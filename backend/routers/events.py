from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import json
import logging
from jose import JWTError, jwt

from core.models import User, NewsItem
from core.models_events import Event, EventParticipant, EventSubmission, TeamInvitation
from services.auth import get_current_user, require_faculty, get_session, JWT_SECRET, ALGORITHM
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
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
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
    user: Optional[User] = Depends(get_optional_user),
):
    """Get all events, optionally filtered by type and status."""
    base_query = select(Event)

    if event_type:
        base_query = base_query.where(Event.event_type == event_type)
    if status:
        base_query = base_query.where(Event.status == status)
    else:
        base_query = base_query.where(Event.status.in_(["active", "completed"]))

    total_count = len(session.exec(base_query).all())

    statement = base_query.order_by(Event.start_date.desc()).offset(skip).limit(limit)
    events = session.exec(statement).all()

    if not events:
        return {"items": [], "total_count": total_count}

    event_ids = [e.id for e in events]
    author_ids = list({e.created_by for e in events})

    from sqlmodel import func

    participant_counts_raw = session.exec(
        select(EventParticipant.event_id, func.count(EventParticipant.id).label("cnt"))
        .where(EventParticipant.event_id.in_(event_ids))
        .group_by(EventParticipant.event_id)
    ).all()
    participant_count_map = {row[0]: row[1] for row in participant_counts_raw}

    user_joined_ids: set = set()
    if user:
        joined = session.exec(
            select(EventParticipant.event_id).where(
                EventParticipant.event_id.in_(event_ids),
                EventParticipant.user_id == user.id,
            )
        ).all()
        user_joined_ids = {row[0] for row in joined}

    authors = session.exec(
        select(User).where(User.id.in_(author_ids))
    ).all()
    author_map = {a.id: a for a in authors}

    result = []
    for event in events:
        author = author_map.get(event.created_by)
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
                "current_participants": participant_count_map.get(event.id, 0),
                "prize_description": event.prize_description,
                "rules": event.rules,
                "status": event.status,
                "author_name": author_name,
                "created_at": event.created_at.isoformat(),
                "is_joined": event.id in user_joined_ids,
            }
        )

    return {"items": result, "total_count": total_count}


@router.get("/invitations")
async def get_my_invitations(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get pending invitations for the current user."""
    invitations = session.exec(
        select(TeamInvitation).where(
            TeamInvitation.to_user_id == user.id,
            TeamInvitation.status == "pending",
        )
    ).all()

    result = []
    for inv in invitations:
        event = session.get(Event, inv.event_id)
        from_user = session.get(User, inv.from_user_id)
        result.append(
            {
                "id": inv.id,
                "event_id": inv.event_id,
                "event_title": event.title if event else "Unknown Event",
                "from_username": from_user.username if from_user else "Unknown",
                "from_avatar": from_user.avatar_url if from_user else None,
                "team_name": inv.team_name,
                "created_at": inv.created_at.isoformat(),
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

    # Check if current user has joined and get their submission status
    is_joined = False
    user_submission_status = (
        None  # None, "submitted", "rewarded", "disqualified", "completed"
    )
    user_xp_awarded = 0
    user_feedback = None
    if user:
        participant = session.exec(
            select(EventParticipant).where(
                EventParticipant.event_id == event.id,
                EventParticipant.user_id == user.id,
            )
        ).first()
        if participant:
            is_joined = True
            # Check if user has submitted
            submission = session.exec(
                select(EventSubmission).where(
                    EventSubmission.event_id == event.id,
                    EventSubmission.user_id == user.id,
                )
            ).first()
            if submission:
                user_submission_status = "submitted"
            if participant.xp_awarded > 0:
                user_submission_status = "rewarded"
                user_xp_awarded = participant.xp_awarded
                user_feedback = participant.feedback
            if participant.status == "disqualified":
                user_submission_status = "disqualified"
                user_feedback = participant.feedback
            elif participant.status == "withdrawn":
                user_submission_status = "withdrawn"
            if event.status == "completed" and user_submission_status == "submitted":
                user_submission_status = "completed"

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
        "user_submission_status": user_submission_status,
        "user_xp_awarded": user_xp_awarded,
        "user_feedback": user_feedback,
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

    try:
        news_item = NewsItem(
            title=f"New Event: {event.title}",
            content=event.description[:200] + "..."
            if len(event.description) > 200
            else event.description,
            news_type="event",
            link=f"/events/{event.id}",
            priority=2,
            created_by=user.id,
        )
        session.add(news_item)
        session.commit()
    except Exception as e:
        session.rollback()
        logger.warning(f"Failed to create news item for event {event.id}: {e}")

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

    event.updated_at = datetime.now(timezone.utc)
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
    event.updated_at = datetime.now(timezone.utc)
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
    """Join an event. For team events, can join existing team or create new one."""
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
        if existing.status == "withdrawn":
            team_name = join_data.team_name if join_data else None
            existing.status = "active"
            if team_name:
                existing.team_name = team_name
            if join_data and join_data.team_members:
                existing.team_members = json.dumps(join_data.team_members)
            session.add(existing)
            session.commit()
            if team_name:
                return {"message": f"Successfully rejoined as team '{team_name}'", "team_name": team_name}
            return {"message": "Successfully rejoined the event"}
        else:
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

    team_name = join_data.team_name if join_data else None

    # If joining existing team
    if team_name and join_data and join_data.team_name:
        # Find existing team with same name
        existing_team = session.exec(
            select(EventParticipant).where(
                EventParticipant.event_id == event_id,
                EventParticipant.team_name == team_name,
            )
        ).first()

        if existing_team:
            # Add user to existing team's member list
            current_members = []
            if existing_team.team_members:
                current_members = json.loads(existing_team.team_members)

            if user.id not in current_members:
                current_members.append(user.id)
                existing_team.team_members = json.dumps(current_members)
                session.add(existing_team)
                session.commit()

            return {
                "message": f"Successfully joined team '{team_name}'",
                "team_name": team_name,
            }

    # Create new participant entry
    team_members_json = None
    if join_data and join_data.team_members:
        team_members_json = json.dumps(join_data.team_members)
        # Also add self to team members
        members_list = join_data.team_members.copy()
        if user.id not in members_list:
            members_list.append(user.id)
        team_members_json = json.dumps(members_list)
    elif team_name:
        # Create team with self as first member
        team_members_json = json.dumps([user.id])

    participant = EventParticipant(
        event_id=event_id,
        user_id=user.id,
        team_name=team_name,
        team_members=team_members_json,
    )

    session.add(participant)
    session.commit()

    if team_name:
        return {
            "message": f"Successfully created team '{team_name}'",
            "team_name": team_name,
        }
    return {"message": "Successfully joined the event"}


@router.get("/{event_id}/teams")
async def get_event_teams(
    event_id: int,
    session: Session = Depends(get_session),
):
    """Get all teams for an event (for team events)."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Get all participants with team_name
    participants = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id,
            EventParticipant.team_name.isnot(None),
        )
    ).all()

    # Group by team_name
    teams_dict = {}
    for p in participants:
        if p.team_name:
            if p.team_name not in teams_dict:
                teams_dict[p.team_name] = {
                    "team_name": p.team_name,
                    "member_count": 0,
                    "members": [],
                    "leader": None,
                }

            user = session.get(User, p.user_id)
            if user:
                teams_dict[p.team_name]["member_count"] += 1
                teams_dict[p.team_name]["members"].append(
                    {
                        "id": user.id,
                        "username": user.username,
                        "full_name": user.full_name,
                        "avatar_url": user.avatar_url,
                    }
                )
                if not teams_dict[p.team_name]["leader"]:
                    teams_dict[p.team_name]["leader"] = {
                        "id": user.id,
                        "username": user.username,
                    }

    return {"teams": list(teams_dict.values())}


@router.post("/{event_id}/leave")
async def leave_event(
    event_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Leave an event - marks participant as withdrawn instead of deleting."""
    participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id, EventParticipant.user_id == user.id
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Not joined this event")

    participant.status = "withdrawn"
    session.add(participant)
    session.commit()

    return {"message": "Successfully left the event"}


@router.get("/{event_id}/leaderboard")
async def get_event_leaderboard(event_id: int, session: Session = Depends(get_session)):
    """Get event leaderboard with team rankings based on xp_awarded."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    participants = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .order_by(EventParticipant.xp_awarded.desc())
    ).all()

    all_user_ids = {p.user_id for p in participants}
    for p in participants:
        if p.team_members:
            member_ids = (
                json.loads(p.team_members)
                if isinstance(p.team_members, str)
                else p.team_members
            )
            all_user_ids.update(member_ids)

    users_map = {}
    if all_user_ids:
        users = session.exec(
            select(User).where(User.id.in_(list(all_user_ids)))
        ).all()
        users_map = {u.id: u for u in users}

    leaderboard = []
    seen_teams = set()
    processed_users = set()

    for p in participants:
        user = users_map.get(p.user_id)
        if not user or p.user_id in processed_users:
            continue

        if p.team_name:
            team_key = p.team_name
            if team_key in seen_teams:
                continue

            seen_teams.add(team_key)
            processed_users.add(p.user_id)

            team_member_ids = set()
            for tp in participants:
                if tp.team_name == team_key:
                    team_member_ids.add(tp.user_id)
                    if tp.team_members:
                        member_ids = (
                            json.loads(tp.team_members)
                            if isinstance(tp.team_members, str)
                            else tp.team_members
                        )
                        team_member_ids.update(member_ids)

            team_xp = 0
            team_feedback = None
            for tp in participants:
                if tp.team_name == team_key:
                    team_xp = max(team_xp, tp.xp_awarded)
                    if tp.feedback:
                        team_feedback = tp.feedback

            members = []
            for mid in team_member_ids:
                member = users_map.get(mid)
                if member:
                    members.append({
                        "id": mid,
                        "username": member.username,
                        "full_name": member.full_name,
                        "avatar_url": member.avatar_url,
                    })

            entry = {
                "rank": len(leaderboard) + 1,
                "team_name": team_key,
                "is_team": True,
                "xp_awarded": team_xp,
                "feedback": team_feedback,
                "member_count": len(team_member_ids),
                "members": members,
            }
            leaderboard.append(entry)
        else:
            processed_users.add(p.user_id)
            entry = {
                "rank": len(leaderboard) + 1,
                "user_id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "xp_awarded": p.xp_awarded,
                "status": p.status,
                "feedback": p.feedback,
                "is_team": False,
            }
            leaderboard.append(entry)

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
        existing.submitted_at = datetime.now(timezone.utc)
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
                "description": event.description,
                "event_type": event.event_type,
                "difficulty": event.difficulty,
                "subject": event.subject,
                "status": event.status,
                "start_date": event.start_date.isoformat(),
                "end_date": event.end_date.isoformat() if event.end_date else None,
                "current_participants": participant_count,
                "max_participants": event.max_participants,
                "prize_description": event.prize_description,
                "rules": event.rules,
                "created_at": event.created_at.isoformat(),
            }
        )

    return result


# Faculty: Get participants and submissions for an event
@router.get("/faculty/{event_id}/participants")
async def get_event_participants(
    event_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Get all participants and their submissions for an event (faculty only).
    Groups team members together as a single team entry.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if user.role != "admin" and event.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    participants = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .order_by(EventParticipant.joined_at.desc())
    ).all()

    teams_dict = {}
    individual_participants = []

    for p in participants:
        participant_user = session.get(User, p.user_id)
        if not participant_user:
            continue

        if p.team_name:
            team_key = p.team_name
            if team_key not in teams_dict:
                teams_dict[team_key] = {
                    "team_id": p.team_name,
                    "team_name": p.team_name,
                    "leader": {
                        "id": participant_user.id,
                        "username": participant_user.username,
                        "full_name": participant_user.full_name,
                        "avatar_url": participant_user.avatar_url,
                    },
                    "members": [],
                    "all_user_ids": set(),
                    "xp_awarded": p.xp_awarded,
                    "status": p.status,
                    "feedback": p.feedback,
                    "joined_at": p.joined_at.isoformat() if p.joined_at else None,
                    "submissions": [],
                    "participant_id": p.id,
                }

            teams_dict[team_key]["all_user_ids"].add(p.user_id)

            if p.team_members:
                if isinstance(p.team_members, str):
                    member_ids = json.loads(p.team_members)
                else:
                    member_ids = p.team_members
                for mid in member_ids:
                    teams_dict[team_key]["all_user_ids"].add(mid)

            if p.xp_awarded > teams_dict[team_key]["xp_awarded"]:
                teams_dict[team_key]["xp_awarded"] = p.xp_awarded
                teams_dict[team_key]["feedback"] = p.feedback
                teams_dict[team_key]["status"] = p.status
                teams_dict[team_key]["leader"] = {
                    "id": participant_user.id,
                    "username": participant_user.username,
                    "full_name": participant_user.full_name,
                    "avatar_url": participant_user.avatar_url,
                }
        else:
            submissions = session.exec(
                select(EventSubmission).where(
                    EventSubmission.event_id == event_id,
                    EventSubmission.user_id == p.user_id,
                )
            ).all()

            individual_participants.append(
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "username": participant_user.username,
                    "full_name": participant_user.full_name,
                    "avatar_url": participant_user.avatar_url,
                    "team_name": None,
                    "is_team": False,
                    "team_members": [],
                    "status": p.status,
                    "xp_awarded": p.xp_awarded,
                    "feedback": p.feedback,
                    "joined_at": p.joined_at.isoformat() if p.joined_at else None,
                    "submissions": [
                        {
                            "id": s.id,
                            "repo_url": s.repo_url,
                            "submission_notes": s.submission_notes,
                            "score": s.score,
                            "feedback": s.feedback,
                            "rank": s.rank,
                            "submitted_at": s.submitted_at.isoformat()
                            if s.submitted_at
                            else None,
                        }
                        for s in submissions
                    ],
                }
            )

    # Convert teams to list format
    teams_list = []
    for team_key, team_data in teams_dict.items():
        all_user_ids = list(team_data["all_user_ids"])
        team_submissions = session.exec(
            select(EventSubmission).where(
                EventSubmission.event_id == event_id,
                EventSubmission.user_id.in_(all_user_ids),
            )
        ).all()

        members = []
        for mid in all_user_ids:
            member = session.get(User, mid)
            if member:
                members.append(
                    {
                        "id": member.id,
                        "username": member.username,
                        "full_name": member.full_name,
                        "avatar_url": member.avatar_url,
                    }
                )

        teams_list.append(
            {
                "id": team_data["participant_id"],
                "team_id": team_data["team_id"],
                "team_name": team_data["team_name"],
                "leader": team_data["leader"],
                "members": members,
                "member_count": len(all_user_ids),
                "is_team": True,
                "status": team_data["status"],
                "xp_awarded": team_data["xp_awarded"],
                "feedback": team_data["feedback"],
                "joined_at": team_data["joined_at"],
                "submissions": [
                    {
                        "id": s.id,
                        "repo_url": s.repo_url,
                        "submission_notes": s.submission_notes,
                        "score": s.score,
                        "feedback": s.feedback,
                        "rank": s.rank,
                        "submitted_by": session.get(User, s.user_id).username
                        if session.get(User, s.user_id)
                        else "Unknown",
                        "submitted_at": s.submitted_at.isoformat()
                        if s.submitted_at
                        else None,
                    }
                    for s in team_submissions
                ],
            }
        )

    return {
        "teams": teams_list,
        "individuals": individual_participants,
        "total_teams": len(teams_list),
        "total_individuals": len(individual_participants),
    }


# Faculty: Award XP and feedback to a participant
@router.put("/faculty/{event_id}/participants/{participant_id}/reward")
async def award_participant(
    event_id: int,
    participant_id: int,
    reward_data: dict,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Award XP and feedback to a participant or team (faculty only).
    For teams, XP is distributed equally among all members.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if user.role != "admin" and event.created_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    participant = session.get(EventParticipant, participant_id)
    if not participant or participant.event_id != event_id:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Calculate XP difference
    old_xp = participant.xp_awarded
    new_xp = reward_data.get("xp_awarded", old_xp)
    xp_diff = new_xp - old_xp

    # Get all team members by looking at ALL participants with same team_name
    if participant.team_name:
        all_team_participants = session.exec(
            select(EventParticipant).where(
                EventParticipant.event_id == event_id,
                EventParticipant.team_name == participant.team_name,
            )
        ).all()

        # Collect all unique user IDs from all team participants
        team_member_ids = set()
        for tp in all_team_participants:
            team_member_ids.add(tp.user_id)
            if tp.team_members:
                member_ids = (
                    json.loads(tp.team_members)
                    if isinstance(tp.team_members, str)
                    else tp.team_members
                )
                team_member_ids.update(member_ids)

        team_member_ids = list(team_member_ids)

        # Update all team participants with same xp_awarded
        for tp in all_team_participants:
            tp.xp_awarded = new_xp
            if "feedback" in reward_data:
                tp.feedback = reward_data["feedback"]
            if "status" in reward_data:
                tp.status = reward_data["status"]
            session.add(tp)
    else:
        # Individual participant
        team_member_ids = [participant.user_id]
        if "xp_awarded" in reward_data:
            participant.xp_awarded = new_xp
        if "feedback" in reward_data:
            participant.feedback = reward_data["feedback"]
        if "status" in reward_data:
            participant.status = reward_data["status"]
        session.add(participant)

    # Update XP for all team members
    affected_users = []
    xp_per_member = xp_diff // len(team_member_ids) if team_member_ids else xp_diff
    remainder = xp_diff % len(team_member_ids) if team_member_ids else xp_diff

    for i, member_id in enumerate(team_member_ids):
        member_user = session.get(User, member_id)
        if member_user:
            actual_xp = xp_per_member + (remainder if i == 0 else 0)
            member_user.xp = max(0, member_user.xp + actual_xp)
            session.add(member_user)
            affected_users.append(
                {
                    "id": member_user.id,
                    "username": member_user.username,
                    "xp_added": actual_xp,
                    "total_xp": member_user.xp,
                }
            )

    session.commit()

    # Invalidate leaderboard cache
    from utils.utils_cache import invalidate_leaderboard_cache

    invalidate_leaderboard_cache()

    # Refresh participant
    session.refresh(participant)

    return {
        "message": "Reward updated successfully",
        "xp_awarded": new_xp,
        "is_team": bool(participant.team_name),
        "team_name": participant.team_name,
        "member_count": len(team_member_ids),
        "xp_per_member": xp_per_member,
        "affected_users": affected_users,
    }


# Team invitation system
class SendInvitationRequest(BaseModel):
    to_username: str
    team_name: str


@router.post("/{event_id}/invite")
async def send_team_invitation(
    event_id: int,
    invite_data: SendInvitationRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Send a team invitation to another user."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.status != "active":
        raise HTTPException(status_code=400, detail="Event is not active")

    to_user = session.exec(
        select(User).where(User.username == invite_data.to_username)
    ).first()
    if not to_user:
        raise HTTPException(status_code=404, detail="User not found")

    if to_user.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")

    existing = session.exec(
        select(TeamInvitation).where(
            TeamInvitation.event_id == event_id,
            TeamInvitation.from_user_id == user.id,
            TeamInvitation.to_user_id == to_user.id,
            TeamInvitation.status == "pending",
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Invitation already sent")

    invitation = TeamInvitation(
        event_id=event_id,
        from_user_id=user.id,
        to_user_id=to_user.id,
        team_name=invite_data.team_name,
    )
    session.add(invitation)
    session.commit()

    return {"message": f"Invitation sent to {to_user.username}"}


@router.post("/invitations/{invitation_id}/respond")
async def respond_to_invitation(
    invitation_id: int,
    response_data: dict,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Accept or reject a team invitation."""
    invitation = session.get(TeamInvitation, invitation_id)
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.to_user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Invitation already responded to")

    action = response_data.get("action")
    if action not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Invalid action")

    invitation.status = "accepted" if action == "accept" else "rejected"
    invitation.responded_at = datetime.now(timezone.utc)
    session.add(invitation)

    if action == "accept":
        existing = session.exec(
            select(EventParticipant).where(
                EventParticipant.event_id == invitation.event_id,
                EventParticipant.user_id == user.id,
            )
        ).first()

        if not existing:
            participant = EventParticipant(
                event_id=invitation.event_id,
                user_id=user.id,
                team_name=invitation.team_name,
            )
            session.add(participant)

    session.commit()

    return {"message": f"Invitation {action}ed successfully"}
