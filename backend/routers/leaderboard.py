from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
import logging
from fastapi_cache.decorator import cache

from database import get_session
from models import User, Submission
from utils_cache import leaderboard_cache_key_builder

logger = logging.getLogger(__name__)

router = APIRouter(tags=["leaderboard"])

@router.get("/leaderboard")
@cache(expire=3600, key_builder=leaderboard_cache_key_builder)
def get_leaderboard(session: Session = Depends(get_session)):
    # Simple and fast: Order by User.xp and filter out admins/faculty if needed
    # We also show count of accepted problems for context
    subquery = (
        select(
            Submission.user_id,
            func.count(func.distinct(Submission.problem_id)).label("problems_count"),
        )
        .where(Submission.status == "accepted")
        .group_by(Submission.user_id)
        .subquery()
    )

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

    for i, (user, problems_solved) in enumerate(results):
        leaderboard.append(
            {
                "rank": i + 1,
                "id": user.id,
                "name": user.full_name or user.username,
                "username": user.username,
                "score": user.xp,
                "problems": problems_solved,
                "avatar": user.avatar_url,
            }
        )

    return leaderboard
