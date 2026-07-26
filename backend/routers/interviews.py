import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from core.database import get_session
from core.models import User
from core.models_interview import Interview, InterviewSession
from services.auth import get_current_user, require_faculty
from services.interview_service import (
    schedule_interview,
    start_session,
    end_session,
    submit_code,
    evaluate_interview,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interviews", tags=["interviews"])


class CreateInterviewRequest(BaseModel):
    candidate_emails: List[str]
    problem_ids: List[int]
    duration_minutes: int = 60
    scheduled_at: Optional[datetime] = None


class StartSessionRequest(BaseModel):
    candidate_id: int


class SubmitCodeRequest(BaseModel):
    problem_index: int
    code: str


@router.post("")
def create_interview(
    data: CreateInterviewRequest,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    interview = schedule_interview(
        creator_id=user.id,
        data=data.model_dump(),
        session=session,
    )
    return {
        "id": interview.id,
        "status": interview.status,
        "duration_minutes": interview.duration_minutes,
        "scheduled_at": interview.scheduled_at.isoformat() if interview.scheduled_at else None,
    }


@router.get("")
def list_interviews(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if user.role in ("faculty", "admin"):
        interviews = session.exec(
            select(Interview).where(Interview.creator_id == user.id)
            .order_by(Interview.created_at.desc())
        ).all()
    else:
        interviews = session.exec(
            select(Interview).order_by(Interview.created_at.desc())
        ).all()

    result = []
    for iv in interviews:
        sessions_list = session.exec(
            select(InterviewSession).where(InterviewSession.interview_id == iv.id)
        ).all()
        result.append({
            "id": iv.id,
            "candidate_emails": json.loads(iv.candidate_emails_json) if iv.candidate_emails_json else [],
            "duration_minutes": iv.duration_minutes,
            "scheduled_at": iv.scheduled_at.isoformat() if iv.scheduled_at else None,
            "status": iv.status,
            "feedback": iv.feedback,
            "created_at": iv.created_at.isoformat(),
            "sessions": [
                {
                    "id": s.id,
                    "candidate_id": s.candidate_id,
                    "status": s.status,
                    "start_time": s.start_time.isoformat() if s.start_time else None,
                    "score": s.score,
                }
                for s in sessions_list
            ],
        })
    return result


@router.get("/{interview_id}")
def get_interview(
    interview_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    sessions_list = session.exec(
        select(InterviewSession).where(InterviewSession.interview_id == interview_id)
    ).all()

    return {
        "id": interview.id,
        "creator_id": interview.creator_id,
        "candidate_emails": json.loads(interview.candidate_emails_json) if interview.candidate_emails_json else [],
        "problems_json": json.loads(interview.problems_json) if interview.problems_json else [],
        "duration_minutes": interview.duration_minutes,
        "scheduled_at": interview.scheduled_at.isoformat() if interview.scheduled_at else None,
        "status": interview.status,
        "feedback": interview.feedback,
        "created_at": interview.created_at.isoformat(),
        "sessions": [
            {
                "id": s.id,
                "candidate_id": s.candidate_id,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "status": s.status,
                "score": s.score,
                "evaluation": json.loads(s.evaluation) if s.evaluation else None,
            }
            for s in sessions_list
        ],
    }


@router.post("/{interview_id}/sessions")
def create_session(
    interview_id: int,
    data: StartSessionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    interview = session.get(Interview, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    existing = session.exec(
        select(InterviewSession).where(
            InterviewSession.interview_id == interview_id,
            InterviewSession.candidate_id == data.candidate_id,
            InterviewSession.status.in_(["pending", "in_progress"]),
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Active session already exists for this candidate")

    db_session_obj = InterviewSession(
        interview_id=interview_id,
        candidate_id=data.candidate_id,
        status="pending",
    )
    session.add(db_session_obj)
    session.commit()
    session.refresh(db_session_obj)

    return {
        "session_id": db_session_obj.id,
        "status": "pending",
        "interview_id": interview_id,
    }


@router.post("/sessions/{session_id}/start")
def start_interview_session(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    result = start_session(session_id, user.id, session)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/sessions/{session_id}/code")
def submit_code_endpoint(
    session_id: int,
    data: SubmitCodeRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    result = submit_code(session_id, data.problem_index, data.code, session)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/sessions/{session_id}")
def get_session_state(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    db_session_obj = session.get(InterviewSession, session_id)
    if not db_session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    interview = session.get(Interview, db_session_obj.interview_id)

    return {
        "id": db_session_obj.id,
        "interview_id": db_session_obj.interview_id,
        "candidate_id": db_session_obj.candidate_id,
        "start_time": db_session_obj.start_time.isoformat() if db_session_obj.start_time else None,
        "end_time": db_session_obj.end_time.isoformat() if db_session_obj.end_time else None,
        "status": db_session_obj.status,
        "score": db_session_obj.score,
        "code_snapshots": json.loads(db_session_obj.code_snapshots_json) if db_session_obj.code_snapshots_json else {},
        "recording": json.loads(db_session_obj.recording_json) if db_session_obj.recording_json else [],
        "evaluation": json.loads(db_session_obj.evaluation) if db_session_obj.evaluation else None,
        "duration_minutes": interview.duration_minutes if interview else 60,
        "problems": json.loads(interview.problems_json) if interview and interview.problems_json else [],
    }


@router.post("/sessions/{session_id}/end")
def end_session_endpoint(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    result = end_session(session_id, session)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{interview_id}/evaluate")
def evaluate_interview_endpoint(
    interview_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    sessions_list = session.exec(
        select(InterviewSession).where(
            InterviewSession.interview_id == interview_id,
            InterviewSession.status == "completed",
        )
    ).all()

    if not sessions_list:
        raise HTTPException(status_code=400, detail="No completed sessions to evaluate")

    results = []
    for s in sessions_list:
        result = evaluate_interview(s.id, session)
        results.append({"session_id": s.id, "evaluation": result})

    return {"interview_id": interview_id, "evaluations": results}
