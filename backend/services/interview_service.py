import logging
import json
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from google import genai

from core.models import User, Problem
from core.models_interview import Interview, InterviewSession

logger = logging.getLogger(__name__)


def schedule_interview(creator_id: int, data: dict, session: Session) -> Interview:
    interview = Interview(
        creator_id=creator_id,
        candidate_emails_json=json.dumps(data.get("candidate_emails", [])),
        problems_json=json.dumps(data.get("problem_ids", [])),
        duration_minutes=data.get("duration_minutes", 60),
        scheduled_at=data.get("scheduled_at"),
        status="scheduled",
    )
    session.add(interview)
    session.commit()
    session.refresh(interview)
    return interview


def start_session(session_id: int, candidate_id: int, session: Session) -> dict:
    interview_session = session.get(InterviewSession, session_id)
    if not interview_session:
        return {"error": "Session not found"}
    if interview_session.candidate_id != candidate_id:
        return {"error": "Not your session"}

    interview = session.get(Interview, interview_session.interview_id)
    if not interview:
        return {"error": "Interview not found"}

    interview_session.start_time = datetime.now(timezone.utc)
    interview_session.end_time = datetime.now(timezone.utc) + timedelta(minutes=interview.duration_minutes)
    interview_session.status = "in_progress"
    interview_session.recording_json = json.dumps([])
    session.add(interview_session)
    session.commit()
    session.refresh(interview_session)

    return {
        "session_id": interview_session.id,
        "start_time": interview_session.start_time.isoformat(),
        "end_time": interview_session.end_time.isoformat(),
        "duration_minutes": interview.duration_minutes,
    }


def end_session(session_id: int, session: Session) -> dict:
    interview_session = session.get(InterviewSession, session_id)
    if not interview_session:
        return {"error": "Session not found"}

    interview_session.end_time = datetime.now(timezone.utc)
    interview_session.status = "completed"
    session.add(interview_session)
    session.commit()

    return {
        "session_id": interview_session.id,
        "end_time": interview_session.end_time.isoformat(),
        "status": "completed",
    }


def submit_code(session_id: int, problem_index: int, code: str, session: Session) -> dict:
    interview_session = session.get(InterviewSession, session_id)
    if not interview_session:
        return {"error": "Session not found"}

    recording = json.loads(interview_session.recording_json) if interview_session.recording_json else []
    recording.append({
        "problem_index": problem_index,
        "code": code,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    interview_session.recording_json = json.dumps(recording)

    code_snapshots = json.loads(interview_session.code_snapshots_json) if interview_session.code_snapshots_json else {}
    code_snapshots[str(problem_index)] = code
    interview_session.code_snapshots_json = json.dumps(code_snapshots)

    session.add(interview_session)
    session.commit()

    return {"status": "saved", "recording_length": len(recording)}


def get_session_recording(session_id: int, db_session: Session) -> dict:
    interview_session = db_session.get(InterviewSession, session_id)
    if not interview_session:
        return {"error": "Session not found"}

    return {
        "session_id": session_id,
        "recording": json.loads(interview_session.recording_json) if interview_session.recording_json else [],
        "code_snapshots": json.loads(interview_session.code_snapshots_json) if interview_session.code_snapshots_json else {},
    }


def evaluate_interview(session_id: int, db_session: Session) -> dict:
    interview_session = db_session.get(InterviewSession, session_id)
    if not interview_session:
        return {"error": "Session not found"}

    interview = db_session.get(Interview, interview_session.interview_id)
    if not interview:
        return {"error": "Interview not found"}

    problem_ids = json.loads(interview.problems_json) if interview.problems_json else []
    problems = []
    for pid in problem_ids:
        p = db_session.get(Problem, pid)
        if p:
            problems.append({"title": p.title, "difficulty": p.difficulty, "subject": p.subject})

    code_snapshots = json.loads(interview_session.code_snapshots_json) if interview_session.code_snapshots_json else {}
    recording = json.loads(interview_session.recording_json) if interview_session.recording_json else []

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "AI evaluation not available"}

    prompt = f"""You are an AI interview evaluator. Evaluate the candidate's performance.

Duration: {interview.duration_minutes} minutes
Problems assigned: {json.dumps(problems)}

Code submitted per problem:
{json.dumps(code_snapshots, indent=2)}

Code change timeline (recording):
{json.dumps(recording, indent=2)}

Evaluate based on:
1. Code correctness and completeness
2. Problem-solving approach
3. Code quality and style
4. Time management (considering the timeline)

Return a JSON object:
{{
    "overall_score": <0-100>,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "per_problem_scores": {{"0": <score>, "1": <score>}},
    "detailed_feedback": "detailed markdown feedback",
    "recommendation": "Strong Hire / Hire / Lean Hire / No Hire"
}}
"""

    try:
        from services.ai_generator import generate_content_with_retry
        import anyio

        client = genai.Client(api_key=api_key)
        response_text = anyio.run(
            generate_content_with_retry, client, prompt, "gemini-3-flash-preview", "application/json"
        )
        result = json.loads(response_text)

        interview_session.score = result.get("overall_score", 0)
        interview_session.evaluation = json.dumps(result)
        interview_session.status = "evaluated"
        db_session.add(interview_session)
        db_session.commit()

        interview.feedback = result.get("detailed_feedback", "")
        db_session.add(interview)
        db_session.commit()

        return result
    except Exception as e:
        logger.error(f"AI evaluation failed: {e}")
        return {"error": f"Evaluation failed: {str(e)}"}
