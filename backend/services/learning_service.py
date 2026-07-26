import logging
import json
import os
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select, func
from google import genai

from core.models import User, Problem, Submission
from services.sync_xp import XP_TO_LEVEL, LEVEL_NAMES

logger = logging.getLogger(__name__)

DIFFICULTY_ORDER = {"Easy": 1, "Medium": 2, "Hard": 3}
LEVEL_XP_THRESHOLDS = sorted(XP_TO_LEVEL.items(), key=lambda x: x[0])


def get_level_info(xp: int) -> dict:
    level = 1
    for threshold, lvl in reversed(LEVEL_XP_THRESHOLDS):
        if xp >= threshold:
            level = lvl
            break
    next_threshold = None
    for threshold, lvl in LEVEL_XP_THRESHOLDS:
        if threshold > xp:
            next_threshold = threshold
            break
    current_threshold = 0
    for threshold, lvl in reversed(LEVEL_XP_THRESHOLDS):
        if lvl < level:
            current_threshold = threshold
            break
    xp_into_level = xp - current_threshold
    xp_for_next = (next_threshold - current_threshold) if next_threshold else 500
    return {
        "level": level,
        "level_name": LEVEL_NAMES.get(level, f"Level {level}"),
        "xp": xp,
        "xp_into_level": xp_into_level,
        "xp_for_next": xp_for_next,
        "progress_pct": round((xp_into_level / xp_for_next * 100) if xp_for_next > 0 else 0, 1),
    }


def get_weak_areas(user_id: int, session: Session) -> dict:
    submissions = session.exec(
        select(Submission).where(Submission.user_id == user_id)
    ).all()

    total_by_subject = {}
    accepted_by_subject = {}
    total_by_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}
    accepted_by_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}

    for sub in submissions:
        problem = session.get(Problem, sub.problem_id)
        if not problem:
            continue
        subject = problem.subject or "uncategorized"
        if subject not in total_by_subject:
            total_by_subject[subject] = 0
            accepted_by_subject[subject] = 0
        total_by_subject[subject] += 1
        if sub.status == "accepted":
            accepted_by_subject[subject] += 1

        diff = problem.difficulty
        if diff in total_by_difficulty:
            total_by_difficulty[diff] += 1
            if sub.status == "accepted":
                accepted_by_difficulty[diff] += 1

    subject_weaknesses = []
    for subject in total_by_subject:
        total = total_by_subject[subject]
        accepted = accepted_by_subject.get(subject, 0)
        pass_rate = round((accepted / total * 100), 1) if total > 0 else 0
        subject_weaknesses.append({
            "subject": subject,
            "total_attempts": total,
            "accepted": accepted,
            "pass_rate": pass_rate,
            "weakness_score": round(100 - pass_rate, 1),
        })
    subject_weaknesses.sort(key=lambda x: x["weakness_score"], reverse=True)

    difficulty_weaknesses = []
    for diff in ["Easy", "Medium", "Hard"]:
        total = total_by_difficulty[diff]
        accepted = accepted_by_difficulty[diff]
        pass_rate = round((accepted / total * 100), 1) if total > 0 else 0
        difficulty_weaknesses.append({
            "difficulty": diff,
            "total_attempts": total,
            "accepted": accepted,
            "pass_rate": pass_rate,
        })

    return {
        "by_subject": subject_weaknesses,
        "by_difficulty": difficulty_weaknesses,
    }


def get_recommendations(user_id: int, session: Session, limit: int = 10) -> list:
    weak_areas_data = get_weak_areas(user_id, session)
    weak_subjects = [w["subject"] for w in weak_areas_data["by_subject"] if w["weakness_score"] > 30]

    user = session.get(User, user_id)
    if not user:
        return []

    solved_problem_ids = set(
        s.problem_id for s in session.exec(
            select(Submission).where(
                Submission.user_id == user_id,
                Submission.status == "accepted",
            )
        ).all()
    )

    all_problems = session.exec(
        select(Problem).where(Problem.is_deleted == False, Problem.visibility == "public")
    ).all()

    scored = []
    for p in all_problems:
        if p.id in solved_problem_ids:
            continue
        score = 0
        if p.subject and p.subject in weak_subjects:
            score += 30
        if p.level <= (user.unlocked_level or 1):
            score += 20
        if p.difficulty == "Easy":
            score += 10
        elif p.difficulty == "Medium":
            score += 5
        scored.append({"problem": p, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return [s["problem"] for s in scored[:limit]]


def get_learning_path(user_id: int, session: Session) -> dict:
    user = session.get(User, user_id)
    if not user:
        return {"streams": [], "recommendations": []}

    from core.models import Stream, Milestone, UserMilestoneProgress

    streams = session.exec(
        select(Stream).where(Stream.is_active == True).order_by(Stream.name)
    ).all()

    result_streams = []
    for stream in streams:
        milestones = session.exec(
            select(Milestone)
            .where(Milestone.stream_id == stream.id)
            .order_by(Milestone.order)
        ).all()

        milestone_ids = [m.id for m in milestones]
        progress_entries = []
        if milestone_ids:
            progress_entries = session.exec(
                select(UserMilestoneProgress).where(
                    UserMilestoneProgress.user_id == user_id,
                    UserMilestoneProgress.milestone_id.in_(milestone_ids),
                )
            ).all()

        progress_map = {p.milestone_id: p for p in progress_entries}
        completed = sum(1 for p in progress_entries if p.status == "rewarded")
        in_progress = sum(1 for p in progress_entries if p.status == "in_progress")

        result_streams.append({
            "id": stream.id,
            "name": stream.name,
            "slug": stream.slug,
            "description": stream.description,
            "icon": stream.icon,
            "color": stream.color,
            "total_milestones": len(milestones),
            "completed_milestones": completed,
            "in_progress_milestones": in_progress,
            "progress_pct": round((completed / len(milestones) * 100) if milestones else 0, 1),
        })

    return {
        "streams": result_streams,
        "level_info": get_level_info(user.xp or 0),
    }


def get_stats_summary(user_id: int, session: Session) -> dict:
    user = session.get(User, user_id)
    if not user:
        return {}

    submissions = session.exec(
        select(Submission).where(Submission.user_id == user_id)
    ).all()

    accepted = [s for s in submissions if s.status == "accepted"]
    pending = [s for s in submissions if s.status == "pending"]
    rejected = [s for s in submissions if s.status not in ("accepted", "pending")]

    solved_problem_ids = set(s.problem_id for s in accepted)
    total_problems_solved = len(solved_problem_ids)

    by_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}
    by_subject = {}
    for pid in solved_problem_ids:
        problem = session.get(Problem, pid)
        if problem:
            if problem.difficulty in by_difficulty:
                by_difficulty[problem.difficulty] += 1
            subject = problem.subject or "uncategorized"
            by_subject[subject] = by_subject.get(subject, 0) + 1

    recent = session.exec(
        select(Submission)
        .where(Submission.user_id == user_id)
        .order_by(Submission.timestamp.desc())
        .limit(20)
    ).all()

    recent_activity = []
    for s in recent:
        problem = session.get(Problem, s.problem_id)
        recent_activity.append({
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": problem.title if problem else "Unknown",
            "status": s.status,
            "score": s.score,
            "timestamp": s.timestamp.isoformat(),
        })

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    recent_submissions_count = sum(
        1 for s in submissions if s.timestamp and s.timestamp >= thirty_days_ago
    )

    return {
        "total_submissions": len(submissions),
        "total_solved": total_problems_solved,
        "accepted": len(accepted),
        "pending": len(pending),
        "rejected": len(rejected),
        "by_difficulty": by_difficulty,
        "by_subject": by_subject,
        "recent_activity": recent_activity,
        "recent_submissions_count": recent_submissions_count,
        "level_info": get_level_info(user.xp or 0),
    }


def get_ai_recommendations(user_id: int, session: Session) -> list:
    weak_areas = get_weak_areas(user_id, session)
    stats = get_stats_summary(user_id, session)
    user = session.get(User, user_id)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return []

    weak_subjects_str = ", ".join(
        f"{w['subject']} ({w['weakness_score']}% weak)"
        for w in weak_areas["by_subject"][:5]
    )

    prompt = f"""You are an AI learning coach. Based on the student's performance data, recommend specific topics or areas to focus on.

Student Level: {stats['level_info']['level']} ({stats['level_info']['level_name']})
Total Solved: {stats['total_solved']}
Weak Areas: {weak_subjects_str or 'None identified yet'}
Difficulty Breakdown: {json.dumps(stats['by_difficulty'])}

Return a JSON object with 3-5 recommendations:
{{
    "recommendations": [
        {{
            "topic": "topic name",
            "reason": "why they should study this",
            "resource_type": "practice problems / tutorials / projects",
            "priority": "high/medium/low"
        }}
    ]
}}
"""

    try:
        client = genai.Client(api_key=api_key)
        from services.ai_generator import generate_content_with_retry
        import anyio

        response_text = anyio.run(
            generate_content_with_retry, client, prompt, "gemini-3-flash-preview", "application/json"
        )
        result = json.loads(response_text)
        return result.get("recommendations", [])
    except Exception as e:
        logger.error(f"AI recommendations failed: {e}")
        return []


def get_portfolio_data(username: str, session: Session) -> dict:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        return None

    submissions = session.exec(
        select(Submission).where(Submission.user_id == user.id).order_by(Submission.timestamp.desc())
    ).all()

    accepted_subs = [s for s in submissions if s.status == "accepted"]
    solved_ids = set(s.problem_id for s in accepted_subs)

    problems_solved = len(solved_ids)
    by_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}
    by_subject = {}
    for pid in solved_ids:
        problem = session.get(Problem, pid)
        if problem:
            if problem.difficulty in by_difficulty:
                by_difficulty[problem.difficulty] += 1
            subj = problem.subject or "uncategorized"
            by_subject[subj] = by_subject.get(subj, 0) + 1

    activity_dates = {}
    for s in submissions:
        date_key = s.timestamp.strftime("%Y-%m-%d") if s.timestamp else "unknown"
        activity_dates[date_key] = activity_dates.get(date_key, 0) + 1

    top_subs = sorted(accepted_subs, key=lambda x: x.score, reverse=True)[:10]
    top_solutions = []
    for s in top_subs:
        problem = session.get(Problem, s.problem_id)
        top_solutions.append({
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": problem.title if problem else "Unknown",
            "problem_difficulty": problem.difficulty if problem else "Unknown",
            "score": s.score,
            "language": s.language,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
        })

    from core.models import UserMilestoneProgress, Milestone
    milestone_progress = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id,
            UserMilestoneProgress.status == "rewarded",
        )
    ).all()
    milestones_completed = len(milestone_progress)

    max_streak = _calculate_max_streak(sorted(activity_dates.keys()))
    total_days_active = len(activity_dates)

    badges = _generate_badges(
        problems_solved=problems_solved,
        by_difficulty=by_difficulty,
        milestones_completed=milestones_completed,
        max_streak=max_streak,
        total_submissions=len(submissions),
    )

    return {
        "username": user.username,
        "full_name": user.full_name or user.username,
        "avatar_url": user.avatar_url,
        "bio": None,
        "xp": user.xp or 0,
        "level_info": get_level_info(user.xp or 0),
        "stats": {
            "problems_solved": problems_solved,
            "total_submissions": len(submissions),
            "by_difficulty": by_difficulty,
            "by_subject": by_subject,
            "max_streak": max_streak,
            "total_days_active": total_days_active,
            "milestones_completed": milestones_completed,
            "badges_earned": len(badges),
        },
        "activity": {
            "dates": activity_dates,
            "total_days": total_days_active,
            "max_streak": max_streak,
        },
        "badges": badges,
        "top_solutions": top_solutions,
        "xp_history": _generate_xp_history(submissions),
        "recent_activity": [
            {
                "id": s.id,
                "type": "submission",
                "problem_id": s.problem_id,
                "problem_title": session.get(Problem, s.problem_id).title if session.get(Problem, s.problem_id) else "Unknown",
                "status": s.status,
                "score": s.score,
                "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            }
            for s in submissions[:20]
        ],
        "member_since": user.created_at.isoformat() if user.created_at else None,
    }


def _calculate_max_streak(dates: list) -> int:
    if not dates:
        return 0
    from datetime import datetime
    sorted_dates = sorted(set(dates))
    max_streak = 1
    current_streak = 1
    for i in range(1, len(sorted_dates)):
        d1 = datetime.strptime(sorted_dates[i - 1], "%Y-%m-%d")
        d2 = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
        if (d2 - d1).days == 1:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        elif (d2 - d1).days > 1:
            current_streak = 1
    return max_streak


def _generate_badges(**kwargs) -> list:
    badges = []
    if kwargs.get("problems_solved", 0) >= 1:
        badges.append({"id": "first_solve", "name": "First Solve", "icon": "🎯", "description": "Solved first problem"})
    if kwargs.get("problems_solved", 0) >= 10:
        badges.append({"id": "double_digit", "name": "Double Digits", "icon": "💪", "description": "Solved 10 problems"})
    if kwargs.get("problems_solved", 0) >= 50:
        badges.append({"id": "fifty_club", "name": "50 Club", "icon": "🏆", "description": "Solved 50 problems"})
    if kwargs.get("by_difficulty", {}).get("Hard", 0) >= 1:
        badges.append({"id": "hard_breaker", "name": "Hard Breaker", "icon": "🔥", "description": "Solved a Hard problem"})
    if kwargs.get("by_difficulty", {}).get("Hard", 0) >= 5:
        badges.append({"id": "hard_master", "name": "Hard Master", "icon": "⚡", "description": "Solved 5 Hard problems"})
    if kwargs.get("milestones_completed", 0) >= 1:
        badges.append({"id": "first_milestone", "name": "First Milestone", "icon": "🏅", "description": "Completed first milestone"})
    if kwargs.get("max_streak", 0) >= 7:
        badges.append({"id": "weekly_warrior", "name": "Weekly Warrior", "icon": "📅", "description": "7-day streak"})
    if kwargs.get("max_streak", 0) >= 30:
        badges.append({"id": "monthly_master", "name": "Monthly Master", "icon": "📆", "description": "30-day streak"})
    if kwargs.get("total_submissions", 0) >= 100:
        badges.append({"id": "century", "name": "Century", "icon": "💯", "description": "100 submissions"})
    return badges


def _generate_xp_history(submissions: list) -> list:
    history = {}
    for s in submissions:
        if s.timestamp:
            month_key = s.timestamp.strftime("%Y-%m")
            history[month_key] = history.get(month_key, 0) + s.score
    return [{"month": k, "xp_earned": v} for k, v in sorted(history.items())]
