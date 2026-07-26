import json
import logging
from datetime import datetime, timezone, date
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select, func

from core.models import User, Submission, Notification
from core.models_achievements import Badge, UserBadge, Achievement, UserStreak

logger = logging.getLogger(__name__)

STREAK_MILESTONE_XP = {
    3: 50,
    7: 100,
    14: 250,
    30: 500,
    60: 1000,
    100: 2000,
}

PREDEFINED_BADGES = [
    {
        "slug": "first_blood",
        "name": "First Blood",
        "description": "Solve your first problem",
        "category": "milestone",
        "criteria_json": json.dumps({"trigger": "problems_solved", "count": 1}),
        "xp_reward": 50,
    },
    {
        "slug": "problem_solver",
        "name": "Problem Solver",
        "description": "Solve 10 problems",
        "category": "milestone",
        "criteria_json": json.dumps({"trigger": "problems_solved", "count": 10}),
        "xp_reward": 100,
    },
    {
        "slug": "code_warrior",
        "name": "Code Warrior",
        "description": "Solve 25 problems",
        "category": "milestone",
        "criteria_json": json.dumps({"trigger": "problems_solved", "count": 25}),
        "xp_reward": 250,
    },
    {
        "slug": "marathon_runner",
        "name": "Marathon Runner",
        "description": "Solve 50 problems",
        "category": "milestone",
        "criteria_json": json.dumps({"trigger": "problems_solved", "count": 50}),
        "xp_reward": 500,
    },
    {
        "slug": "speed_demon",
        "name": "Speed Demon",
        "description": "Solve a problem within 5 minutes of first viewing",
        "category": "performance",
        "criteria_json": json.dumps({"trigger": "speed_demon", "minutes": 5}),
        "xp_reward": 75,
    },
    {
        "slug": "bug_hunter",
        "name": "Bug Hunter",
        "description": "Get a submission accepted on the first try",
        "category": "performance",
        "criteria_json": json.dumps({"trigger": "bug_hunter"}),
        "xp_reward": 50,
    },
    {
        "slug": "perfect_score",
        "name": "Perfect Score",
        "description": "Earn 100% score on any problem",
        "category": "performance",
        "criteria_json": json.dumps({"trigger": "perfect_score", "score": 100}),
        "xp_reward": 100,
    },
    {
        "slug": "social_butterfly",
        "name": "Social Butterfly",
        "description": "Join a cohort",
        "category": "social",
        "criteria_json": json.dumps({"trigger": "join_cohort"}),
        "xp_reward": 25,
    },
    {
        "slug": "level_master",
        "name": "Level Master",
        "description": "Reach level 5",
        "category": "milestone",
        "criteria_json": json.dumps({"trigger": "level_reached", "level": 5}),
        "xp_reward": 200,
    },
    {
        "slug": "streak_king",
        "name": "Streak King",
        "description": "Maintain a 7-day submission streak",
        "category": "streak",
        "criteria_json": json.dumps({"trigger": "streak_milestone", "streak_type": "submission_daily", "days": 7}),
        "xp_reward": 150,
    },
]


def _ensure_badges(session: Session):
    existing = session.exec(select(Badge)).first()
    if existing:
        return
    for badge_data in PREDEFINED_BADGES:
        badge = Badge(**badge_data)
        session.add(badge)
    session.commit()
    logger.info(f"Seeded {len(PREDEFINED_BADGES)} predefined badges")


def _award_badge(session: Session, user_id: int, badge_slug: str) -> Optional[Badge]:
    badge = session.exec(select(Badge).where(Badge.slug == badge_slug)).first()
    if not badge:
        return None

    existing = session.exec(
        select(UserBadge).where(
            UserBadge.user_id == user_id, UserBadge.badge_id == badge.id
        )
    ).first()
    if existing:
        return None

    user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
    session.add(user_badge)

    user = session.get(User, user_id)
    if user and badge.xp_reward > 0:
        user.xp = (user.xp or 0) + badge.xp_reward
        session.add(user)

    notification = Notification(
        user_id=user_id,
        title=f"Badge Earned: {badge.name}",
        message=f"Congratulations! You earned the '{badge.name}' badge +{badge.xp_reward} XP.",
        notification_type="achievement",
        related_url="/profile/achievements",
    )
    session.add(notification)
    session.commit()
    logger.info(f"Awarded badge '{badge_slug}' to user {user_id}")
    return badge


def check_and_award(session: Session, user_id: int, trigger_type: str, context: Optional[Dict[str, Any]] = None):
    _ensure_badges(session)
    context = context or {}
    awarded = []

    badges_to_check = session.exec(
        select(Badge)
    ).all()

    user = session.get(User, user_id)
    if not user:
        return awarded

    for badge in badges_to_check:
        try:
            criteria = json.loads(badge.criteria_json) if badge.criteria_json else {}
        except (json.JSONDecodeError, TypeError):
            continue

        if criteria.get("trigger") != trigger_type:
            continue

        already_earned = session.exec(
            select(UserBadge).where(
                UserBadge.user_id == user_id, UserBadge.badge_id == badge.id
            )
        ).first()
        if already_earned:
            continue

        should_award = False

        if trigger_type == "problems_solved":
            required = criteria.get("count", 1)
            solved_count = context.get("solved_count", 0)
            if solved_count >= required:
                should_award = True

        elif trigger_type == "first_submission":
            should_award = True

        elif trigger_type == "speed_demon":
            if context.get("is_fast"):
                should_award = True

        elif trigger_type == "bug_hunter":
            if context.get("first_try"):
                should_award = True

        elif trigger_type == "perfect_score":
            if context.get("score", 0) >= 100:
                should_award = True

        elif trigger_type == "join_cohort":
            should_award = True

        elif trigger_type == "level_reached":
            required_level = criteria.get("level", 1)
            if (user.unlocked_level or 1) >= required_level:
                should_award = True

        elif trigger_type == "streak_milestone":
            streak_type = criteria.get("streak_type")
            required_days = criteria.get("days", 0)
            if streak_type:
                streak = session.exec(
                    select(UserStreak).where(
                        UserStreak.user_id == user_id,
                        UserStreak.streak_type == streak_type,
                    )
                ).first()
                if streak and streak.current_count >= required_days:
                    should_award = True

        if should_award:
            result = _award_badge(session, user_id, badge.slug)
            if result:
                awarded.append(result)

    return awarded


def update_streak(session: Session, user_id: int, streak_type: str) -> UserStreak:
    today = date.today()

    streak = session.exec(
        select(UserStreak).where(
            UserStreak.user_id == user_id,
            UserStreak.streak_type == streak_type,
        )
    ).first()

    if not streak:
        streak = UserStreak(
            user_id=user_id,
            streak_type=streak_type,
            current_count=1,
            max_count=1,
            last_activity_date=today,
        )
        session.add(streak)
        session.commit()
        session.refresh(streak)
        return streak

    if streak.last_activity_date == today:
        return streak

    if streak.last_activity_date:
        delta = (today - streak.last_activity_date).days
        if delta == 1:
            streak.current_count += 1
        elif delta > 1:
            streak.current_count = 1
    else:
        streak.current_count = 1

    if streak.current_count > streak.max_count:
        streak.max_count = streak.current_count

    streak.last_activity_date = today
    streak.updated_at = datetime.now(timezone.utc)
    session.add(streak)
    session.commit()
    session.refresh(streak)

    if streak.current_count in STREAK_MILESTONE_XP:
        user = session.get(User, user_id)
        if user:
            xp_bonus = STREAK_MILESTONE_XP[streak.current_count]
            user.xp = (user.xp or 0) + xp_bonus
            session.add(user)

            notification = Notification(
                user_id=user_id,
                title=f"Streak Milestone: {streak.current_count} Days!",
                message=f"Amazing! You've reached a {streak.current_count}-day streak! +{xp_bonus} XP bonus.",
                notification_type="achievement",
                related_url="/profile/achievements",
            )
            session.add(notification)
            session.commit()

    return streak


def get_streaks(session: Session, user_id: int) -> List[UserStreak]:
    streaks = session.exec(
        select(UserStreak).where(UserStreak.user_id == user_id)
    ).all()
    return streaks


def get_streak_calendar(session: Session, user_id: int, streak_type: str, days: int = 30) -> List[Dict[str, Any]]:
    today = date.today()
    start_date = date.fromordinal(today.toordinal() - days + 1)

    submissions = session.exec(
        select(Submission).where(
            Submission.user_id == user_id,
            Submission.status == "accepted",
            func.date(Submission.timestamp) >= start_date,
        )
    ).all()

    activity_dates: set[date] = set()
    for sub in submissions:
        if sub.timestamp:
            d = sub.timestamp.date() if hasattr(sub.timestamp, 'date') else sub.timestamp
            activity_dates.add(d)

    calendar = []
    for i in range(days):
        d = date.fromordinal(start_date.toordinal() + i)
        calendar.append({
            "date": d.isoformat(),
            "active": d in activity_dates,
            "is_today": d == today,
        })

    return calendar
