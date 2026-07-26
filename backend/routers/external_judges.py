import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from core.database import get_session
from core.models import User
from core.models_external import ExternalPlatformLink
from services.auth import get_current_user
from services.external_judge_service import (
    get_cross_platform_stats,
    link_account,
    sync_submissions,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/external", tags=["external"])


class LinkRequest(BaseModel):
    platform: str
    username: str


@router.post("/link")
async def link_external_account(
    req: LinkRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if req.platform not in ("codeforces", "leetcode", "hackerrank"):
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {req.platform}")
    link = link_account(user.id, req.platform, req.username, session)
    return {
        "id": link.id,
        "platform": link.platform,
        "username": link.platform_username,
        "profile_url": link.profile_url,
        "is_verified": link.is_verified,
    }


@router.get("/accounts")
def list_linked_accounts(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    links = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.user_id == user.id
        )
    ).all()
    return [
        {
            "id": l.id,
            "platform": l.platform,
            "username": l.platform_username,
            "profile_url": l.profile_url,
            "is_verified": l.is_verified,
            "synced_at": l.synced_at,
        }
        for l in links
    ]


@router.post("/sync")
async def sync_all_accounts(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    links = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.user_id == user.id
        )
    ).all()
    results = {}
    for link in links:
        count = await sync_submissions(user.id, link.platform, session)
        results[link.platform] = count
    return {"synced": results}


@router.get("/stats")
def external_stats(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_cross_platform_stats(user.id, session)


@router.delete("/accounts/{link_id}")
def unlink_account(
    link_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    link = session.exec(
        select(ExternalPlatformLink).where(
            ExternalPlatformLink.id == link_id,
            ExternalPlatformLink.user_id == user.id,
        )
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Linked account not found")
    session.delete(link)
    session.commit()
    return {"detail": "Account unlinked successfully"}
