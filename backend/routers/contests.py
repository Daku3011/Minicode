import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlmodel import Session, select

from core.database import get_session
from core.models import User
from core.models_contests import Contest, ContestParticipant
from services.auth import ALGORITHM, JWT_SECRET, get_current_user, require_faculty
from services.contest_service import (
    create_contest,
    end_contest,
    get_standings,
    register_for_contest,
    start_attempt,
    submit_solution,
)

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)
router = APIRouter(prefix="/contests", tags=["contests"])


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    session: Session = Depends(get_session),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        return user
    except JWTError:
        return None


class ContestCreate(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    registration_deadline: datetime | None = None
    duration_minutes: int = 120
    problem_ids: list[int] | None = None
    rules: str | None = None
    scoring_type: str = "standard"


class ContestUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    registration_deadline: datetime | None = None
    duration_minutes: int | None = None
    problem_ids: list[int] | None = None
    rules: str | None = None
    scoring_type: str | None = None
    status: str | None = None


@router.get("")
async def get_contests(
    status: str | None = None,
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
    user: User | None = Depends(get_optional_user),
):
    statement = select(Contest)
    if status:
        statement = statement.where(Contest.status == status)

    total = len(session.exec(statement).all())
    contests = session.exec(
        statement.order_by(Contest.start_time.desc()).offset(skip).limit(limit)
    ).all()

    user_registered_ids = set()
    if user:
        regs = session.exec(
            select(ContestParticipant.contest_id).where(
                ContestParticipant.user_id == user.id,
                ContestParticipant.contest_id.in_([c.id for c in contests]),
            )
        ).all()
        user_registered_ids = set(regs)

    result = []
    for c in contests:
        author = session.get(User, c.created_by)
        result.append(
            {
                "id": c.id,
                "title": c.title,
                "description": c.description[:200] + "..." if len(c.description) > 200 else c.description,
                "start_time": c.start_time.isoformat(),
                "end_time": c.end_time.isoformat(),
                "duration_minutes": c.duration_minutes,
                "scoring_type": c.scoring_type,
                "status": c.status,
                "author_name": author.full_name if author and author.full_name else (author.username if author else "Unknown"),
                "created_at": c.created_at.isoformat(),
                "is_registered": c.id in user_registered_ids,
            }
        )

    return {"items": result, "total": total}


@router.get("/{contest_id}")
async def get_contest(
    contest_id: int,
    session: Session = Depends(get_session),
    user: User | None = Depends(get_optional_user),
):
    contest = session.get(Contest, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    author = session.get(User, contest.created_by)
    participant_count = len(
        session.exec(
            select(ContestParticipant).where(ContestParticipant.contest_id == contest_id)
        ).all()
    )

    is_registered = False
    user_started = None
    if user:
        p = session.exec(
            select(ContestParticipant).where(
                ContestParticipant.contest_id == contest_id,
                ContestParticipant.user_id == user.id,
            )
        ).first()
        if p:
            is_registered = True
            user_started = p.started_at.isoformat() if p.started_at else None

    return {
        "id": contest.id,
        "title": contest.title,
        "description": contest.description,
        "start_time": contest.start_time.isoformat(),
        "end_time": contest.end_time.isoformat(),
        "registration_deadline": contest.registration_deadline.isoformat() if contest.registration_deadline else None,
        "duration_minutes": contest.duration_minutes,
        "problems_json": contest.problems_json,
        "rules": contest.rules,
        "scoring_type": contest.scoring_type,
        "status": contest.status,
        "author_name": author.full_name if author and author.full_name else (author.username if author else "Unknown"),
        "created_at": contest.created_at.isoformat(),
        "participant_count": participant_count,
        "is_registered": is_registered,
        "user_started": user_started,
    }


@router.post("")
async def create_contest_endpoint(
    data: ContestCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    try:
        contest = create_contest(session, data.model_dump(), user.id)
        return {"id": contest.id, "message": "Contest created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{contest_id}")
async def update_contest(
    contest_id: int,
    data: ContestUpdate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    contest = session.get(Contest, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    if user.role != "admin" and contest.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "problem_ids":
            setattr(contest, key, json.dumps(value) if value else None)
        else:
            setattr(contest, key, value)

    contest.updated_at = datetime.now(timezone.utc)
    session.add(contest)
    session.commit()
    return {"message": "Contest updated successfully"}


@router.post("/{contest_id}/register")
async def register_for_contest_endpoint(
    contest_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        participant = register_for_contest(session, contest_id, user.id)
        return {"message": "Registered successfully", "participant_id": participant.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{contest_id}/start")
async def start_attempt_endpoint(
    contest_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        result = start_attempt(session, contest_id, user.id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class SubmitSolutionRequest(BaseModel):
    problem_index: str
    code: str
    language: str = "python"


@router.post("/{contest_id}/submit")
async def submit_solution_endpoint(
    contest_id: int,
    data: SubmitSolutionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        result = submit_solution(session, contest_id, user.id, data.problem_index, data.code, data.language)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{contest_id}/standings")
async def get_standings_endpoint(
    contest_id: int,
    session: Session = Depends(get_session),
):
    try:
        standings = get_standings(session, contest_id)
        return standings
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{contest_id}/end")
async def end_contest_endpoint(
    contest_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    contest = session.get(Contest, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    if user.role != "admin" and contest.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        result = end_contest(session, contest_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
