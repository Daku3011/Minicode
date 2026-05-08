from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
import logging
from fastapi_cache.decorator import cache
from datetime import datetime, timezone, timedelta

from core.database import get_session
from core.models import User, Submission
from utils.utils_cache import leaderboard_cache_key_builder

logger = logging.getLogger(__name__)

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard")
@cache(expire=60, key_builder=leaderboard_cache_key_builder)
def get_leaderboard(
    period: str = Query("global", pattern="^(global|monthly|weekly)$"),
    session: Session = Depends(get_session),
):
    now = datetime.now(timezone.utc)

    if period == "weekly":
        cutoff = now - timedelta(days=7)
    elif period == "monthly":
        cutoff = now - timedelta(days=30)
    else:
        cutoff = None

    subquery = (
        select(
            Submission.user_id,
            func.count(func.distinct(Submission.problem_id)).label("problems_count"),
        )
        .where(Submission.status == "accepted")
        .group_by(Submission.user_id)
        .subquery()
    )

    if cutoff:
        xp_subquery = (
            select(
                Submission.user_id,
                func.sum(Submission.score).label("period_xp"),
            )
            .where(Submission.status == "accepted")
            .where(Submission.timestamp >= cutoff)
            .group_by(Submission.user_id)
            .subquery()
        )

        statement = (
            select(
                User,
                func.coalesce(subquery.c.problems_count, 0).label("problems_solved"),
                func.coalesce(xp_subquery.c.period_xp, 0).label("period_score"),
            )
            .outerjoin(subquery, User.id == subquery.c.user_id)
            .outerjoin(xp_subquery, User.id == xp_subquery.c.user_id)
            .where(User.role == "student")
            .order_by(func.coalesce(xp_subquery.c.period_xp, 0).desc())
            .limit(100)
        )
    else:
        statement = (
            select(
                User, func.coalesce(subquery.c.problems_count, 0).label("problems_solved")
            )
            .outerjoin(subquery, User.id == subquery.c.user_id)
            .where(User.role == "student")
            .order_by(User.xp.desc())
            .limit(100)
        )

    results = session.exec(statement).all()
    leaderboard = []

    for i, row in enumerate(results):
        user = row[0]
        problems_solved = row[1]
        score = row[2] if cutoff else (user.xp or 0)

        leaderboard.append(
            {
                "rank": i + 1,
                "id": user.id,
                "name": user.full_name or user.username,
                "username": user.username,
                "score": score,
                "problems": problems_solved,
                "avatar": user.avatar_url,
            }
        )

    return leaderboard
