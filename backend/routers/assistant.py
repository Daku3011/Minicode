import logging
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from core.database import get_session
from core.models import Problem, Submission, User
from services.assistant_service import (
    chat_with_assistant,
    explain_submission_failure,
    generate_hint,
)
from services.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["assistant"])

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 20
_rate_limit: dict[int, list[float]] = {}


def _check_rate_limit(user_id: int):
    now = time.time()
    if user_id not in _rate_limit:
        _rate_limit[user_id] = []
    timestamps = _rate_limit[user_id]
    timestamps[:] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(timestamps) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. 20 requests per minute allowed.")
    timestamps.append(now)


class ChatRequest(BaseModel):
    query: str


class HintRequest(BaseModel):
    problem_id: int


class ExplainRequest(BaseModel):
    submission_id: int


@router.post("/chat", response_model=dict)
async def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _check_rate_limit(user.id)

    recent_submissions = session.exec(
        select(Submission)
        .where(Submission.user_id == user.id)
        .order_by(Submission.timestamp.desc())
        .limit(5)
    ).all()

    recent_problems = []
    for sub in recent_submissions:
        if sub.problem:
            recent_problems.append(sub.problem.title)

    try:
        response = await chat_with_assistant(
            user_id=user.id,
            query=req.query,
            user_level=user.unlocked_level,
            recent_problems=recent_problems,
        )
        return {"response": response}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Assistant chat error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")


@router.post("/hint/{problem_id}", response_model=dict)
async def hint(
    problem_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _check_rate_limit(user.id)

    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    try:
        hint_text = await generate_hint(
            problem_id=problem.id,
            problem_title=problem.title,
            problem_description=problem.description,
            user_level=user.unlocked_level,
        )
        return {"hint": hint_text}
    except Exception as e:
        logger.error(f"Hint generation error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")


@router.post("/explain/{submission_id}", response_model=dict)
async def explain(
    submission_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _check_rate_limit(user.id)

    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your submission")

    problem = session.get(Problem, submission.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    try:
        explanation = await explain_submission_failure(
            code_content=submission.code_content or "",
            problem_title=problem.title,
            problem_description=problem.description,
            judge_output=submission.judge_output,
            language=submission.language,
        )
        return {"explanation": explanation}
    except Exception as e:
        logger.error(f"Submission explanation error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")
