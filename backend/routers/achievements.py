from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import timezone
from pydantic import BaseModel

from core.models import User, Submission
from core.models_achievements import Badge, UserBadge, Achievement, UserStreak
from services.auth import get_current_user, get_session
from services.achievement_service import (
    check_and_award,
    update_streak,
    get_streaks,
    get_streak_calendar,
    _ensure_badges,
)

router = APIRouter(prefix="/achievements", tags=["achievements"])


class BadgeResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    icon_url: Optional[str] = None
    category: str
    criteria_json: Optional[str] = None
    xp_reward: int


class UserBadgeResponse(BaseModel):
    id: int
    badge_id: int
    badge: BadgeResponse
    earned_at: str
    displayed_on_profile: bool


class StreakResponse(BaseModel):
    streak_type: str
    current_count: int
    max_count: int
    last_activity_date: Optional[str] = None


class CalendarDay(BaseModel):
    date: str
    active: bool
    is_today: bool


class CheckResponse(BaseModel):
    awarded: list[BadgeResponse]


@router.get("", response_model=List[BadgeResponse])
def list_available_badges(
    category: Optional[str] = None,
    session: Session = Depends(get_session),
):
    _ensure_badges(session)
    statement = select(Badge)
    if category:
        statement = statement.where(Badge.category == category)
    badges = session.exec(statement).all()
    return [
        BadgeResponse(
            id=b.id,
            name=b.name,
            slug=b.slug,
            description=b.description,
            icon_url=b.icon_url,
            category=b.category,
            criteria_json=b.criteria_json,
            xp_reward=b.xp_reward,
        )
        for b in badges
    ]


@router.get("/my", response_model=List[UserBadgeResponse])
def my_badges(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    user_badges = session.exec(
        select(UserBadge)
        .where(UserBadge.user_id == user.id)
        .order_by(UserBadge.earned_at.desc())
    ).all()

    result = []
    for ub in user_badges:
        badge = session.get(Badge, ub.badge_id)
        if not badge:
            continue
        result.append(
            UserBadgeResponse(
                id=ub.id,
                badge_id=ub.badge_id,
                badge=BadgeResponse(
                    id=badge.id,
                    name=badge.name,
                    slug=badge.slug,
                    description=badge.description,
                    icon_url=badge.icon_url,
                    category=badge.category,
                    criteria_json=badge.criteria_json,
                    xp_reward=badge.xp_reward,
                ),
                earned_at=ub.earned_at.isoformat(),
                displayed_on_profile=ub.displayed_on_profile,
            )
        )
    return result


@router.get("/user/{user_id}", response_model=List[UserBadgeResponse])
def user_badges(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_badges = session.exec(
        select(UserBadge)
        .where(UserBadge.user_id == user_id)
        .order_by(UserBadge.earned_at.desc())
    ).all()

    result = []
    for ub in user_badges:
        badge = session.get(Badge, ub.badge_id)
        if not badge:
            continue
        result.append(
            UserBadgeResponse(
                id=ub.id,
                badge_id=ub.badge_id,
                badge=BadgeResponse(
                    id=badge.id,
                    name=badge.name,
                    slug=badge.slug,
                    description=badge.description,
                    icon_url=badge.icon_url,
                    category=badge.category,
                    criteria_json=badge.criteria_json,
                    xp_reward=badge.xp_reward,
                ),
                earned_at=ub.earned_at.isoformat(),
                displayed_on_profile=ub.displayed_on_profile,
            )
        )
    return result


class CheckPayload(BaseModel):
    trigger_type: str
    context: Optional[dict] = None


@router.post("/check", response_model=CheckResponse)
def trigger_badge_check(
    payload: CheckPayload,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.trigger_type == "problems_solved":
        solved_count = len(
            session.exec(
                select(Submission.problem_id)
                .where(Submission.user_id == user.id, Submission.status == "accepted")
                .distinct()
            ).all()
        )
        context = payload.context or {}
        context["solved_count"] = solved_count
        payload.context = context

    awarded = check_and_award(session, user.id, payload.trigger_type, payload.context)
    return CheckResponse(
        awarded=[
            BadgeResponse(
                id=b.id,
                name=b.name,
                slug=b.slug,
                description=b.description,
                icon_url=b.icon_url,
                category=b.category,
                criteria_json=b.criteria_json,
                xp_reward=b.xp_reward,
            )
            for b in awarded
        ]
    )


@router.get("/streaks", response_model=List[StreakResponse])
def list_streaks(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    streaks = get_streaks(session, user.id)
    return [
        StreakResponse(
            streak_type=s.streak_type,
            current_count=s.current_count,
            max_count=s.max_count,
            last_activity_date=s.last_activity_date.isoformat() if s.last_activity_date else None,
        )
        for s in streaks
    ]


class CheckinResponse(BaseModel):
    streak: StreakResponse
    calendar: List[CalendarDay]
    xp_bonus: int = 0


@router.post("/streaks/checkin", response_model=CheckinResponse)
def streak_checkin(
    streak_type: str = "login_daily",
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if streak_type not in ("login_daily", "submission_daily"):
        raise HTTPException(status_code=400, detail="Invalid streak type")

    streak = update_streak(session, user.id, streak_type)
    calendar = get_streak_calendar(session, user.id, streak_type)

    return CheckinResponse(
        streak=StreakResponse(
            streak_type=streak.streak_type,
            current_count=streak.current_count,
            max_count=streak.max_count,
            last_activity_date=streak.last_activity_date.isoformat() if streak.last_activity_date else None,
        ),
        calendar=calendar,
    )
