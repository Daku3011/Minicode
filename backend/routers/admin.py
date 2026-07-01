from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import logging

from core.database import get_session
from core.models import User, Submission
from services.auth import require_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(require_admin), session: Session = Depends(get_session)
):
    from sqlmodel import func

    total_users = session.exec(select(func.count(User.id))).one()
    total_submissions = session.exec(select(func.count(Submission.id))).one()
    error_count = session.exec(
        select(func.count(Submission.id)).where(
            Submission.status.in_(["error", "runtime_error"])
        )
    ).one()
    accepted_count = session.exec(
        select(func.count(Submission.id)).where(Submission.status == "accepted")
    ).one()
    student_count = session.exec(
        select(func.count(User.id)).where(User.role == "student")
    ).one()

    pass_rate = round((accepted_count / total_submissions * 100), 2) if total_submissions > 0 else 0.0

    return {
        "total_users": total_users,
        "total_submissions": total_submissions,
        "api_usage": total_submissions,
        "system_alerts": error_count,
        "pass_rate": pass_rate,
        "student_count": student_count,
    }


@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(require_admin), session: Session = Depends(get_session)
):
    from sqlmodel import func
    total_count = session.exec(select(func.count(User.id))).one()
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    return {
        "items": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else "",
            }
            for u in users
        ],
        "total_count": total_count,
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    admin: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    valid_roles = ["student", "faculty", "admin", "alumni"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
    
    user.role = role
    session.add(user)
    session.commit()
    return {"message": f"User {user.username} updated to {role}"}


@router.post("/sync-all-xp")
def admin_sync_all_xp(admin: User = Depends(require_admin)):
    """
    Manually trigger XP synchronization for all users.
    Only accessible by admins.
    """
    from services.sync_xp import sync_all_users_xp
    updated_count = sync_all_users_xp()
    return {"message": f"XP synchronization completed. Updated {updated_count} users."}

