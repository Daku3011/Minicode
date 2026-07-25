"""Admin service functions for user and submission management."""
from typing import List, Optional, Dict, Any
from sqlmodel import Session, func, select
from core.models import User, Submission
from core.database import get_session


def get_stats(session: Session) -> Dict[str, Any]:
    """Get dashboard statistics."""
    user_count = session.exec(select(func.count(User.id))).one()
    submission_count = session.exec(select(func.count(Submission.id))).one()
    passed_count = session.exec(
        select(func.count(Submission.id)).where(Submission.status == "passed")
    ).one()
    pass_rate = (passed_count / submission_count * 100) if submission_count > 0 else 0
    
    return {
        "total_users": user_count,
        "total_submissions": submission_count,
        "passed_submissions": passed_count,
        "pass_rate": round(pass_rate, 1)
    }


def get_users(
    session: Session,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
) -> Dict[str, Any]:
    """Get paginated list of users with filters."""
    query = select(User)
    
    if search:
        query = query.where(User.email.contains(search))
    if role:
        query = query.where(User.role == role)
    if status == "banned":
        query = query.where(User.role == "banned")
    
    # Get total count for pagination
    total_count = session.exec(select(func.count(User.id))).one()
    total_pages = (total_count + page_size - 1) // page_size
    
    # Apply pagination
    offset = (page - 1) * page_size
    users = session.exec(query.offset(offset).limit(page_size)).all()
    
    return {
        "items": [user.dict() for user in users],
        "total_count": total_count,
        "total_pages": total_pages
    }


def get_user(session: Session, user_id: str) -> Optional[User]:
    """Get user by ID."""
    return session.get(User, user_id)


def update_user_role(session: Session, user_id: str, role: str) -> Optional[User]:
    """Update user role."""
    user = session.get(User, user_id)
    if user:
        user.role = role
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def ban_user(session: Session, user_id: str, banned: bool) -> Optional[User]:
    """Ban or unban a user."""
    user = session.get(User, user_id)
    if user:
        user.role = "banned" if banned else "student"
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def delete_user(session: Session, user_id: str) -> bool:
    """Delete a user by ID."""
    user = session.get(User, user_id)
    if user:
        session.delete(user)
        session.commit()
        return True
    return False


def get_audit(
    session: Session,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
) -> Dict[str, Any]:
    """Get paginated audit log of submissions."""
    query = select(Submission)
    
    if user_id:
        query = query.where(Submission.user_id == user_id)
    if status:
        query = query.where(Submission.status == status)
    
    # Get total count for pagination
    total_count = session.exec(select(func.count(Submission.id))).one()
    total_pages = (total_count + page_size - 1) // page_size
    
    # Apply pagination
    offset = (page - 1) * page_size
    submissions = session.exec(query.offset(offset).limit(page_size)).all()
    
    return {
        "items": [submission.dict() for submission in submissions],
        "total_count": total_count,
        "total_pages": total_pages
    }
