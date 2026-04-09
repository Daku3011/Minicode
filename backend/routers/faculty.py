from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
import logging
from datetime import datetime, timezone
from pydantic import BaseModel

from database import get_session
from models import User, Problem, Submission, Notification
from auth import require_faculty
from routers.users import get_user_profile_logic
from sync_xp import calculate_unlocked_level_from_xp
from utils_cache import invalidate_leaderboard_cache


logger = logging.getLogger(__name__)



router = APIRouter(prefix="/faculty", tags=["faculty"])


class StudentListItem(BaseModel):
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    xp: int
    created_at: datetime
    last_login: Optional[datetime]


@router.get("/students", response_model=List[StudentListItem])
def get_students(
    faculty: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    students = session.exec(
        select(User).where(User.role == "student").order_by(User.xp.desc())
    ).all()

    return [
        StudentListItem(
            username=s.username,
            email=s.email,
            full_name=s.full_name,
            avatar_url=s.avatar_url,
            xp=s.xp or 0,
            created_at=s.created_at,
            last_login=s.last_login,
        )
        for s in students
    ]


@router.get("/problems", response_model=List[Problem])
def get_faculty_problems(
    user: User = Depends(require_faculty), session: Session = Depends(get_session)
):
    return session.exec(select(Problem).where(Problem.author_id == user.id)).all()


@router.get("/analytics/{problem_id}")
def get_problem_analytics(
    problem_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    problem = session.get(Problem, problem_id)
    if not problem or (user.role != "admin" and problem.author_id != user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    submissions = session.exec(
        select(Submission).where(Submission.problem_id == problem_id)
    ).all()

    return {
        "problem_title": problem.title,
        "total_submissions": len(submissions),
        "accepted_count": len([s for s in submissions if s.status == "accepted"]),
        "average_score": sum(s.score for s in submissions) / len(submissions)
        if submissions
        else 0,
    }


@router.get("/student/{username}")
def get_student_profile(
    username: str,
    faculty: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    statement = select(User).where(User.username == username)
    student = session.exec(statement).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return get_user_profile_logic(student, session)


from pydantic import BaseModel


class AwardXPRequest(BaseModel):
    amount: int
    reason: Optional[str] = None


@router.post("/award-xp/{username}")
def award_student_xp(
    username: str,
    data: AwardXPRequest,
    faculty: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    student = session.exec(select(User).where(User.username == username)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.xp is None:
        student.xp = 0

    student.xp += data.amount

    new_level = calculate_unlocked_level_from_xp(student.xp)
    old_level = student.unlocked_level or 1
    student.unlocked_level = max(student.unlocked_level or 1, new_level)

    notification_title = "Sovereign Override Awarded"
    notification_message = f"You have received {data.amount} XP from a faculty member. Reason: {data.reason or 'N/A'}"

    if new_level > old_level:
        notification_message += f" Level Up! You are now Level {new_level}."

    notification = Notification(
        user_id=student.id,
        title=notification_title,
        message=notification_message,
        notification_type="achievement",
        created_at=datetime.now(timezone.utc),
    )
    session.add(notification)
    session.commit()

    invalidate_leaderboard_cache()
    logger.info(
        f"Awarded {data.amount} XP to {username}. New XP: {student.xp}, Level: {student.unlocked_level}"
    )

    return {
        "message": "XP awarded successfully",
        "new_xp": student.xp,
        "new_level": student.unlocked_level,
        "leveled_up": new_level > old_level,
    }


class FacultyDashboardStats(BaseModel):
    total_problems: int
    total_students: int
    total_submissions: int
    avg_pass_rate: float
    recent_activity: List[dict]


@router.get("/dashboard-stats")
def get_faculty_dashboard_stats(
    faculty: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    # Stats Aggregation
    total_problems = session.exec(select(func.count(Problem.id))).one()
    total_students = session.exec(
        select(func.count(User.id)).where(User.role == "student")
    ).one()
    total_submissions = session.exec(select(func.count(Submission.id))).one()

    # Calculate Pass Rate
    accepted_count = session.exec(
        select(func.count(Submission.id)).where(Submission.status == "Accepted")
    ).one()
    avg_pass_rate = (
        (accepted_count / total_submissions * 100) if total_submissions > 0 else 0.0
    )

    # Recent Activity (Operational Logs)
    # 1. Recent Student Joins
    recent_joins_raw = session.exec(
        select(User)
        .where(User.role == "student")
        .order_by(User.created_at.desc())
        .limit(3)
    ).all()

    # 2. Recent Submissions
    recent_submissions_raw = session.exec(
        select(Submission).order_by(Submission.timestamp.desc()).limit(3)
    ).all()

    # Normalize activities
    activities = []

    for user in recent_joins_raw:
        activities.append(
            {
                "id": f"join-{user.id}",
                "type": "join",
                "message": f"New student enrolled: {user.username}",
                "timestamp": user.created_at,
                "user": user.username,
            }
        )

    for sub in recent_submissions_raw:
        # Get problem title
        problem = session.get(Problem, sub.problem_id)
        student = session.get(User, sub.user_id)
        activities.append(
            {
                "id": f"sub-{sub.id}",
                "type": "submission",
                "message": f"Submission received for '{problem.title if problem else 'Unknown'}' from {student.username if student else 'Unknown'}",
                "timestamp": sub.timestamp,
                "status": sub.status,
                "user": student.username if student else None,
            }
        )

    # Sort combined activities by timestamp and pick top 3
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    recent_activity = activities[:3]

    # Convert timestamps to relative human-readable format or just ISO strings for frontend to parse
    for act in recent_activity:
        act["timestamp_raw"] = (
            act["timestamp"].isoformat() if act["timestamp"] else None
        )
        # Simplistic relative time for now, or let frontend handle it
        if act["timestamp"]:
            from datetime import timezone

            ts = act["timestamp"]
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            diff = datetime.now(timezone.utc) - ts
            if diff.days > 0:
                act["timestamp"] = f"{diff.days}d ago"
            elif diff.seconds > 3600:
                act["timestamp"] = f"{diff.seconds // 3600}h ago"
            elif diff.seconds > 60:
                act["timestamp"] = f"{diff.seconds // 60}m ago"
            else:
                act["timestamp"] = "just now"
        else:
            act["timestamp"] = "unknown"

    return FacultyDashboardStats(
        total_problems=total_problems,
        total_students=total_students,
        total_submissions=total_submissions,
        avg_pass_rate=round(avg_pass_rate, 1),
        recent_activity=recent_activity,
    )
