from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel
import logging
from datetime import datetime, UTC, timedelta

from database import get_session
from models import User, Problem, Submission
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["users"])

def get_user_profile_logic(user: User, session: Session):
    # Batch fetch all problems once to avoid N+1 queries
    all_problems = session.exec(select(Problem)).all()
    problem_map = {p.id: p for p in all_problems}

    # Calculate stats for profile
    submissions = session.exec(
        select(Submission).where(Submission.user_id == user.id)
    ).all()
    accepted_subs = [s for s in submissions if s.status == "accepted"]

    problem_scores = {}
    for sub in accepted_subs:
        if (
            sub.problem_id not in problem_scores
            or sub.score > problem_scores[sub.problem_id]
        ):
            problem_scores[sub.problem_id] = sub.score

    total_score = user.xp or 0
    problems_solved = len(problem_scores)

    now = datetime.now(UTC)
    one_year_ago = now.replace(year=now.year - 1)

    submission_counts = {}
    for sub in submissions:
        if sub.timestamp and sub.timestamp >= one_year_ago:
            date_str = sub.timestamp.strftime("%Y-%m-%d")
            submission_counts[date_str] = submission_counts.get(date_str, 0) + 1

    streak = 0
    curr_date = now.date()
    while True:
        date_str = curr_date.strftime("%Y-%m-%d")
        if date_str in submission_counts:
            streak += 1
            curr_date = curr_date - timedelta(days=1)
        else:
            if streak == 0:
                yesterday = now.date() - timedelta(days=1)
                if yesterday.strftime("%Y-%m-%d") in submission_counts:
                    curr_date = yesterday
                    continue
            break

    sorted_submissions = sorted(
        submissions, key=lambda x: x.timestamp or datetime.min, reverse=True
    )
    recent_submissions = []
    for sub in sorted_submissions[:5]:
        prob = problem_map.get(sub.problem_id)
        recent_submissions.append(
            {
                "id": sub.id,
                "problem": prob.title if prob else f"Problem {sub.problem_id}",
                "status": sub.status,
                "time": sub.timestamp.strftime("%Y-%m-%d %H:%M")
                if sub.timestamp
                else "",
            }
        )

    # Level mapping based on XP
    if total_score >= 1500:
        user_level = 6
        level_name = "Legend"
    elif total_score >= 1000:
        user_level = 5
        level_name = "Master"
    elif total_score >= 600:
        user_level = 4
        level_name = "Warrior"
    elif total_score >= 300:
        user_level = 3
        level_name = "Ninja"
    elif total_score >= 100:
        user_level = 2
        level_name = "Explorer"
    else:
        user_level = 1
        level_name = "Beginner"

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "github_id": user.github_id,
        "created_at": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
        "stats": {
            "solved": problems_solved,
            "rank": 0,
            "xp": total_score,
            "level": user_level,
            "level_name": level_name,
            "streak": streak,
        },
        "contribution_data": submission_counts,
        "recentSubmissions": recent_submissions,
    }

@router.get("/auth/me")
def get_me(
    user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    return get_user_profile_logic(user, session)


class SettingsUpdate(BaseModel):
    report_email: Optional[str] = None

@router.put("/users/me/settings")
def update_user_settings(
    settings: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if settings.report_email:
        current_user.faculty_report_email = settings.report_email

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {
        "message": "Settings updated",
        "faculty_report_email": current_user.faculty_report_email,
    }
