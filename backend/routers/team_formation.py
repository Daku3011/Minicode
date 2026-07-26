import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from core.database import get_session
from core.models import User
from core.models_contests import (
    TeamFormationApplication,
    TeamFormationRequest,
    TeamProfile,
)
from services.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/team-formation", tags=["team-formation"])


class TeamProfileCreate(BaseModel):
    roles: str | None = None
    skills: str | None = None
    availability: str | None = None
    bio: str | None = None
    preferred_team_size: str | None = None


@router.post("/profile")
async def set_team_profile(
    data: TeamProfileCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(TeamProfile).where(TeamProfile.user_id == user.id)
    ).first()

    if existing:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(existing, key, value)
        existing.updated_at = datetime.now(timezone.utc)
        session.add(existing)
    else:
        existing = TeamProfile(
            user_id=user.id,
            **data.model_dump(exclude_unset=True),
        )
        session.add(existing)

    session.commit()
    session.refresh(existing)
    return {"id": existing.id, "message": "Team profile saved"}


@router.get("/profile")
async def get_team_profile(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    profile = session.exec(
        select(TeamProfile).where(TeamProfile.user_id == user.id)
    ).first()
    if not profile:
        return None

    return {
        "id": profile.id,
        "roles": profile.roles,
        "skills": profile.skills,
        "availability": profile.availability,
        "bio": profile.bio,
        "preferred_team_size": profile.preferred_team_size,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
    }


class TeamFormationRequestCreate(BaseModel):
    title: str
    description: str | None = None
    desired_roles: str | None = None
    required_skills: str | None = None
    team_size: int = 4


@router.post("/requests")
async def create_team_request(
    data: TeamFormationRequestCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    request = TeamFormationRequest(
        user_id=user.id,
        title=data.title,
        description=data.description,
        desired_roles=data.desired_roles,
        required_skills=data.required_skills,
        team_size=data.team_size,
    )
    session.add(request)
    session.commit()
    session.refresh(request)
    return {"id": request.id, "message": "Team formation request created"}


@router.get("/requests")
async def list_team_requests(
    status: str | None = "open",
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(TeamFormationRequest)
    if status:
        statement = statement.where(TeamFormationRequest.status == status)

    requests = session.exec(
        statement.order_by(TeamFormationRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()

    result = []
    for req in requests:
        creator = session.get(User, req.user_id)
        app_count = len(
            session.exec(
                select(TeamFormationApplication).where(
                    TeamFormationApplication.request_id == req.id
                )
            ).all()
        )

        result.append(
            {
                "id": req.id,
                "title": req.title,
                "description": req.description,
                "desired_roles": req.desired_roles,
                "required_skills": req.required_skills,
                "team_size": req.team_size,
                "status": req.status,
                "creator": {
                    "id": creator.id if creator else None,
                    "username": creator.username if creator else "Unknown",
                    "full_name": creator.full_name if creator else None,
                    "avatar_url": creator.avatar_url if creator else None,
                },
                "application_count": app_count,
                "created_at": req.created_at.isoformat(),
            }
        )

    return result


@router.get("/requests/{request_id}")
async def get_team_request(
    request_id: int,
    session: Session = Depends(get_session),
):
    req = session.get(TeamFormationRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    creator = session.get(User, req.user_id)
    applications = session.exec(
        select(TeamFormationApplication).where(
            TeamFormationApplication.request_id == request_id
        )
    ).all()

    return {
        "id": req.id,
        "title": req.title,
        "description": req.description,
        "desired_roles": req.desired_roles,
        "required_skills": req.required_skills,
        "team_size": req.team_size,
        "status": req.status,
        "creator": {
            "id": creator.id if creator else None,
            "username": creator.username if creator else "Unknown",
            "full_name": creator.full_name if creator else None,
            "avatar_url": creator.avatar_url if creator else None,
        },
        "applications": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "message": a.message,
                "status": a.status,
                "created_at": a.created_at.isoformat(),
            }
            for a in applications
        ],
        "created_at": req.created_at.isoformat(),
    }


class ApplyRequest(BaseModel):
    message: str | None = None


@router.post("/requests/{request_id}/apply")
async def apply_to_request(
    request_id: int,
    data: ApplyRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    req = session.get(TeamFormationRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "open":
        raise HTTPException(status_code=400, detail="Request is not open")

    if req.user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to your own request")

    existing = session.exec(
        select(TeamFormationApplication).where(
            TeamFormationApplication.request_id == request_id,
            TeamFormationApplication.user_id == user.id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this request")

    app = TeamFormationApplication(
        request_id=request_id,
        user_id=user.id,
        message=data.message,
    )
    session.add(app)
    session.commit()
    session.refresh(app)
    return {"id": app.id, "message": "Application submitted"}


class RespondRequest(BaseModel):
    action: str


@router.post("/requests/{request_id}/applications/{app_id}/respond")
async def respond_to_application(
    request_id: int,
    app_id: int,
    data: RespondRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    req = session.get(TeamFormationRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.user_id != user.id:
        raise HTTPException(status_code=403, detail="Only the request creator can respond")

    app = session.get(TeamFormationApplication, app_id)
    if not app or app.request_id != request_id:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "pending":
        raise HTTPException(status_code=400, detail="Application already responded to")

    if data.action not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Invalid action")

    app.status = "accepted" if data.action == "accept" else "rejected"
    app.responded_at = datetime.now(timezone.utc)
    session.add(app)

    if data.action == "accept":
        req.status = "closed"
        session.add(req)

    session.commit()
    return {"message": f"Application {data.action}ed"}


@router.get("/match")
async def get_match_suggestions(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    profile = session.exec(
        select(TeamProfile).where(TeamProfile.user_id == user.id)
    ).first()

    open_requests = session.exec(
        select(TeamFormationRequest).where(
            TeamFormationRequest.status == "open",
            TeamFormationRequest.user_id != user.id,
        )
    ).all()

    user_skills = set()
    if profile and profile.skills:
        user_skills = {s.strip().lower() for s in profile.skills.split(",")}

    scored = []
    for req in open_requests:
        req_skills = set()
        if req.required_skills:
            req_skills = {s.strip().lower() for s in req.required_skills.split(",")}

        if user_skills and req_skills:
            overlap = len(user_skills & req_skills)
        else:
            overlap = 0

        creator = session.get(User, req.user_id)
        scored.append(
            {
                "request": {
                    "id": req.id,
                    "title": req.title,
                    "description": req.description,
                    "desired_roles": req.desired_roles,
                    "required_skills": req.required_skills,
                    "team_size": req.team_size,
                    "created_at": req.created_at.isoformat(),
                },
                "creator": {
                    "id": creator.id if creator else None,
                    "username": creator.username if creator else "Unknown",
                    "full_name": creator.full_name if creator else None,
                    "avatar_url": creator.avatar_url if creator else None,
                },
                "skill_match_score": overlap,
            }
        )

    scored.sort(key=lambda x: x["skill_match_score"], reverse=True)
    return scored[:10]
