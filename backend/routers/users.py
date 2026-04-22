from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel
import logging
from datetime import datetime, timezone, timedelta

from database import get_session
from models import User, Problem, Submission
from auth import get_current_user
from sync_xp import calculate_unlocked_level_from_xp, LEVEL_NAMES

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

    now = datetime.now(timezone.utc)
    one_year_ago = now.replace(year=now.year - 1)

    submission_counts = {}
    for sub in submissions:
        if sub.timestamp:
            ts = sub.timestamp
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if ts >= one_year_ago:
                date_str = ts.strftime("%Y-%m-%d")
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

    def get_timestamp(sub):
        ts = sub.timestamp
        if ts is None:
            return (
                datetime.min.replace(tzinfo=timezone.utc)
                if ts and hasattr(ts, "tzinfo")
                else datetime.min
            )
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts

    sorted_submissions = sorted(submissions, key=get_timestamp, reverse=True)
    recent_submissions = []
    for sub in sorted_submissions[:5]:
        prob = problem_map.get(sub.problem_id)
        ts = sub.timestamp
        time_str = ""
        if ts:
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            time_str = ts.strftime("%Y-%m-%d %H:%M")
        recent_submissions.append(
            {
                "id": sub.id,
                "problem": prob.title if prob else f"Problem {sub.problem_id}",
                "status": sub.status,
                "time": time_str,
            }
        )

    # Level mapping based on XP
    user_level = calculate_unlocked_level_from_xp(total_score)
    level_name = LEVEL_NAMES.get(user_level, "Beginner")

    # Keep stored unlocked_level aligned with XP-derived level to avoid stale unlock state.
    if user.unlocked_level is None or user_level != user.unlocked_level:
        logger.info(f"Auto-syncing level for {user.username}: {user.unlocked_level} -> {user_level}")
        user.unlocked_level = user_level
        session.add(user)
        session.commit()
        session.refresh(user)

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
        "unlocked_level": user.unlocked_level,
        "contribution_data": submission_counts,
        "recentSubmissions": recent_submissions,
    }


@router.get("/me")
def get_me(
    user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    return get_user_profile_logic(user, session)


class SettingsUpdate(BaseModel):
    faculty_report_email: Optional[str] = None


@router.put("/me/settings")
def update_user_settings(
    settings: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if settings.faculty_report_email:
        current_user.faculty_report_email = settings.faculty_report_email

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {
        "message": "Settings updated",
        "faculty_report_email": current_user.faculty_report_email,
    }


class SendOtpRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


@router.post("/send-verification-email")
async def send_verification_email(
    data: SendOtpRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from email_verification import (
        generate_otp,
        send_verification_email as send_email_func,
        EmailVerification,
    )

    if not data.email or "@" not in data.email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    existing = session.exec(
        select(EmailVerification).where(
            EmailVerification.user_id == current_user.id,
            EmailVerification.email == data.email,
            EmailVerification.verified == False,
        )
    ).all()
    for e in existing:
        session.delete(e)

    verification = EmailVerification(
        user_id=current_user.id,
        email=data.email,
        otp=otp,
        expires_at=expires_at,
    )
    session.add(verification)
    session.commit()

    success = send_email_func(data.email, otp)

    if success:
        return {"message": "Verification code sent", "expires_in": 600}
    else:
        raise HTTPException(status_code=500, detail="Failed to send verification email")


@router.post("/verify-email")
async def verify_email(
    data: VerifyOtpRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from email_verification import EmailVerification

    verification = session.exec(
        select(EmailVerification).where(
            EmailVerification.user_id == current_user.id,
            EmailVerification.email == data.email,
            EmailVerification.otp == data.otp,
            EmailVerification.verified == False,
        )
    ).first()

    if not verification:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification code"
        )

    if verification.is_expired():
        raise HTTPException(status_code=400, detail="Verification code has expired")

    verification.verified = True
    session.add(verification)

    current_user.email = data.email
    session.add(current_user)
    session.commit()

    return {"message": "Email verified and updated successfully", "email": data.email}


@router.get("/profile/email")
async def get_profile_email(
    current_user: User = Depends(get_current_user),
):
    return {
        "email": current_user.email,
        "is_github_email": current_user.github_id is not None,
    }
