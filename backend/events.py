from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import json
from jose import JWTError, jwt

from models import User
from models_events import Event, EventParticipant, EventSubmission
from auth import get_current_user, require_faculty, get_session, JWT_SECRET, ALGORITHM
from slowapi import Limiter
from slowapi.util import get_remote_address

security = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session),
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    if not credentials:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            return None
        from sqlmodel import select

        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        return user
    except JWTError:
        return None


router = APIRouter(prefix="/events", tags=["events"])
limiter = Limiter(key_func=get_remote_address)


# Request/Response Models
class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str  # "weekly_challenge", "team_project", "announcement"
    difficulty: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    prize_description: Optional[str] = None
    rules: Optional[str] = None
    problem_ids: Optional[List[int]] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    prize_description: Optional[str] = None
    rules: Optional[str] = None
    status: Optional[str] = None
    problem_ids: Optional[List[int]] = None


class JoinEventRequest(BaseModel):
    team_name: Optional[str] = None
    team_members: Optional[List[int]] = None


class EventSubmissionRequest(BaseModel):
    repo_url: str
    submission_notes: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    event_type: str
    difficulty: Optional[str]
    start_date: datetime
    end_date: Optional[datetime]
    max_participants: Optional[int]
    current_participants: int
    prize_description: Optional[str]
    rules: Optional[str]
    status: str
    author_name: Optional[str]
    created_at: datetime
    is_joined: bool = False


# Endpoints


@router.get("")
async def get_events(
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    session: Session = Depends(get_session),
    user: Optional[User] = Depends(get_optional_user),
):
    """Get all events, optionally filtered by type and status."""
    statement = select(Event)

    if event_type:
        statement = statement.where(Event.event_type == event_type)
    if status:
        statement = statement.where(Event.status == status)
    else:
        # Default to showing active and upcoming events
        statement = statement.where(Event.status.in_(["active", "completed"]))

    statement = statement.order_by(Event.start_date.desc())
    events = session.exec(statement).all()

    result = []
    for event in events:
        # Get participant count
        participant_count = len(
            session.exec(
                select(EventParticipant).where(EventParticipant.event_id == event.id)
            ).all()
        )

        # Check if current user has joined
        is_joined = False
        if user:
            participant = session.exec(
                select(EventParticipant).where(
                    EventParticipant.event_id == event.id,
                    EventParticipant.user_id == user.id,
                )
            ).first()
            is_joined = participant is not None

        # Get author name
        author = session.get(User, event.created_by)
        author_name = (
            author.full_name
            if author and author.full_name
            else (author.username if author else "Unknown")
        )

        result.append(
            {
                "id": event.id,
                "title": event.title,
                "description": event.description[:200] + "..."
                if len(event.description) > 200
                else event.description,
                "event_type": event.event_type,
                "difficulty": event.difficulty,
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat() if event.end_date else None,
                "max_participants": event.max_participants,
                "current_participants": participant_count,
                "prize_description": event.prize_description,
                "rules": event.rules,
                "status": event.status,
                "author_name": author_name,
                "created_at": event.created_at.isoformat(),
                "is_joined": is_joined,
            }
        )

    return result


@router.get("/{event_id}")
async def get_event(
    event_id: int,
    session: Session = Depends(get_session),
    user: Optional[User] = Depends(get_optional_user),
):
    """Get detailed event information."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Get participants
    participants = session.exec(
        select(EventParticipant).where(EventParticipant.event_id == event_id)
    ).all()

    participant_list = []
    for p in participants:
        participant_user = session.get(User, p.user_id)
        if participant_user:
            participant_list.append(
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "username": participant_user.username,
                    "full_name": participant_user.full_name,
                    "avatar_url": participant_user.avatar_url,
                    "team_name": p.team_name,
                    "joined_at": p.joined_at.isoformat(),
                }
            )

    # Check if current user has joined
    is_joined = False
    if user:
        participant = session.exec(
            select(EventParticipant).where(
                EventParticipant.event_id == event.id,
                EventParticipant.user_id == user.id,
            )
        ).first()
        is_joined = participant is not None

    # Get author name
    author = session.get(User, event.created_by)
    author_name = (
        author.full_name
        if author and author.full_name
        else (author.username if author else "Unknown")
    )

    # Parse problem_ids
    problem_ids = json.loads(event.problem_ids) if event.problem_ids else []

    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "event_type": event.event_type,
        "difficulty": event.difficulty,
        "start_date": event.start_date.isoformat(),
        "end_date": event.end_date.isoformat() if event.end_date else None,
        "max_participants": event.max_participants,
        "current_participants": len(participant_list),
        "prize_description": event.prize_description,
        "rules": event.rules,
        "problem_ids": problem_ids,
        "status": event.status,
        "author_name": author_name,
        "created_at": event.created_at.isoformat(),
        "is_joined": is_joined,
        "participants": participant_list,
    }


@router.post("")
async def create_event(
    event_data: EventCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Create a new event (faculty/admin only)."""
    event = Event(
        title=event_data.title,
        description=event_data.description,
        event_type=event_data.event_type,
        difficulty=event_data.difficulty,
        start_date=event_data.start_date,
        end_date=event_data.end_date,
        max_participants=event_data.max_participants,
        prize_description=event_data.prize_description,
        rules=event_data.rules,
        problem_ids=json.dumps(event_data.problem_ids)
        if event_data.problem_ids
        else None,
        status="draft",
        created_by=user.id,
    )

    session.add(event)
    session.commit()
    session.refresh(event)

    return {"id": event.id, "message": "Event created successfully"}


@router.put("/{event_id}")
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Update an event (faculty/admin only)."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check ownership (admin can edit any)
    if user.role != "admin" and event.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update fields
    update_data = event_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "problem_ids":
            setattr(event, key, json.dumps(value) if value else None)
        else:
            setattr(event, key, value)

    event.updated_at = datetime.utcnow()
    session.add(event)
    session.commit()

    return {"message": "Event updated successfully"}


@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Cancel/delete an event (faculty/admin only)."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check ownership (admin can delete any)
    if user.role != "admin" and event.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    event.status = "cancelled"
    event.updated_at = datetime.utcnow()
    session.add(event)
    session.commit()

    return {"message": "Event cancelled successfully"}


@router.post("/{event_id}/join")
@limiter.limit("10/minute")
async def join_event(
    request: Request,
    event_id: int,
    join_data: Optional[JoinEventRequest] = None,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Join an event."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.status != "active":
        raise HTTPException(status_code=400, detail="Event is not active")

    # Check if already joined
    existing = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id, EventParticipant.user_id == user.id
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already joined this event")

    # Check max participants
    if event.max_participants:
        current_count = len(
            session.exec(
                select(EventParticipant).where(EventParticipant.event_id == event_id)
            ).all()
        )
        if current_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Event is full")

    # Create participant
    team_members_json = (
        json.dumps(join_data.team_members)
        if join_data and join_data.team_members
        else None
    )

    participant = EventParticipant(
        event_id=event_id,
        user_id=user.id,
        team_name=join_data.team_name if join_data else None,
        team_members=team_members_json,
    )

    session.add(participant)
    session.commit()

    return {"message": "Successfully joined the event"}


@router.post("/{event_id}/leave")
async def leave_event(
    event_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Leave an event."""
    participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id, EventParticipant.user_id == user.id
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Not joined this event")

    session.delete(participant)
    session.commit()

    return {"message": "Successfully left the event"}


@router.get("/{event_id}/leaderboard")
async def get_event_leaderboard(event_id: int, session: Session = Depends(get_session)):
    """Get event leaderboard."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Get submissions for this event, ordered by score
    submissions = session.exec(
        select(EventSubmission)
        .where(EventSubmission.event_id == event_id)
        .order_by(EventSubmission.score.desc())
    ).all()

    leaderboard = []
    for i, sub in enumerate(submissions):
        user = session.get(User, sub.user_id)
        if user:
            leaderboard.append(
                {
                    "rank": i + 1,
                    "user_id": user.id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "avatar_url": user.avatar_url,
                    "score": sub.score,
                    "submitted_at": sub.submitted_at.isoformat(),
                }
            )

    return leaderboard


@router.post("/{event_id}/submit")
@limiter.limit("5/minute")
async def submit_to_event(
    request: Request,
    event_id: int,
    submission_data: EventSubmissionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Submit work for an event."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.status != "active":
        raise HTTPException(status_code=400, detail="Event is not active")

    # Check if user is a participant
    participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id, EventParticipant.user_id == user.id
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=400, detail="Must join event before submitting")

    # Check for existing submission
    existing = session.exec(
        select(EventSubmission).where(
            EventSubmission.event_id == event_id, EventSubmission.user_id == user.id
        )
    ).first()

    if existing:
        # Update existing submission
        existing.repo_url = submission_data.repo_url
        existing.submission_notes = submission_data.submission_notes
        existing.submitted_at = datetime.utcnow()
        session.add(existing)
    else:
        # Create new submission
        submission = EventSubmission(
            event_id=event_id,
            user_id=user.id,
            repo_url=submission_data.repo_url,
            submission_notes=submission_data.submission_notes,
        )
        session.add(submission)

    session.commit()

    return {"message": "Submission recorded successfully"}


# Faculty endpoints for event management
@router.get("/faculty/my-events")
async def get_faculty_events(
    user: User = Depends(require_faculty), session: Session = Depends(get_session)
):
    """Get events created by the current faculty member."""
    events = session.exec(
        select(Event)
        .where(Event.created_by == user.id)
        .order_by(Event.created_at.desc())
    ).all()

    result = []
    for event in events:
        participant_count = len(
            session.exec(
                select(EventParticipant).where(EventParticipant.event_id == event.id)
            ).all()
        )

        result.append(
            {
                "id": event.id,
                "title": event.title,
                "event_type": event.event_type,
                "status": event.status,
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat() if event.end_date else None,
                "current_participants": participant_count,
                "max_participants": event.max_participants,
                "created_at": event.created_at.isoformat(),
            }
        )

    return result
