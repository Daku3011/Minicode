from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
import logging

from core.database import get_session
from core.models import User
from services.auth import get_current_user
from services.learning_service import (
    get_weak_areas,
    get_recommendations,
    get_learning_path,
    get_stats_summary,
    get_ai_recommendations,
    get_portfolio_data,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/dashboard")
def get_dashboard(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    stats = get_stats_summary(user.id, session)
    weak_areas = get_weak_areas(user.id, session)
    recommendations = get_recommendations(user.id, session)
    learning_path = get_learning_path(user.id, session)
    ai_recs = get_ai_recommendations(user.id, session)

    return {
        "stats": stats,
        "weak_areas": weak_areas,
        "recommendations": [
            {
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty,
                "subject": p.subject,
                "xp_reward": p.xp_reward,
                "level": p.level,
            }
            for p in recommendations
        ],
        "learning_path": learning_path,
        "ai_recommendations": ai_recs,
    }


@router.get("/recommendations")
def get_recommendations_endpoint(
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    recommendations = get_recommendations(user.id, session, limit=limit)
    return [
        {
            "id": p.id,
            "title": p.title,
            "difficulty": p.difficulty,
            "subject": p.subject,
            "xp_reward": p.xp_reward,
            "level": p.level,
        }
        for p in recommendations
    ]


@router.get("/weak-areas")
def get_weak_areas_endpoint(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_weak_areas(user.id, session)


@router.get("/stats")
def get_stats(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_stats_summary(user.id, session)


@router.get("/path")
def get_path(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_learning_path(user.id, session)


@router.get("/portfolio/{username}")
def get_portfolio(
    username: str,
    session: Session = Depends(get_session),
):
    data = get_portfolio_data(username, session)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return data


@router.get("/portfolio/{username}/public")
def get_public_portfolio(
    username: str,
    session: Session = Depends(get_session),
):
    data = get_portfolio_data(username, session)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return data
