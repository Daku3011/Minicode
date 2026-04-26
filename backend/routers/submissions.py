from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from pydantic import BaseModel, field_validator
import logging

from core.database import get_session
from core.models import User, Problem, Submission
from services.auth import get_current_user
from services.repo_manager import create_student_repo, build_repo_name

logger = logging.getLogger(__name__)

router = APIRouter(tags=["submissions"])

class SubmissionRequest(BaseModel):
    language: str

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        allowed_languages = [
            "py",
            "python",
            "javascript",
            "js",
            "java",
            "cpp",
            "c",
            "go",
            "rs",
        ]
        if v.lower() not in allowed_languages:
            raise ValueError(f"Language must be one of {allowed_languages}")
        return v.lower()


@router.post("/problems/{problem_id}/start")
async def start_problem(
    problem_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    repo_url = create_student_repo(user, problem, session)
    return {"repo_url": repo_url}


@router.post("/problems/{problem_id}/submit")
async def submit_problem(
    request: Request,
    problem_id: int,
    submission_req: SubmissionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    repo_name = build_repo_name(user, problem)
    repo_url = f"https://github.com/{user.username}/{repo_name}"

    submission = Submission(
        user_id=user.id,
        problem_id=problem.id,
        repo_url=repo_url,
        language=submission_req.language,
        status="pending",
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    # Trigger judging via Celery
    try:
        from worker import process_submission_task
        process_submission_task.delay(submission.id)
    except Exception as e:
        logger.error(f"Failed to queue judge task: {e}")
        submission.status = "error"
        submission.ai_feedback = f"Failed to queue judge task: {str(e)}"
        session.add(submission)
        session.commit()

    # Refresh to get updated fields from the judge
    session.refresh(submission)

    return {
        "id": submission.id,
        "status": submission.status,
        "score": submission.score,
        "ai_feedback": submission.ai_feedback,
        "judge_output": submission.judge_output,
        "code_content": submission.code_content,
        "repo_url": submission.repo_url,
    }


@router.get("/submissions/{submission_id}")
def get_submission_status(
    submission_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    submission = session.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Security: Only allow user to check their own submissions (unless admin/faculty)
    if submission.user_id != user.id and user.role not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "id": submission.id,
        "status": submission.status,
        "score": submission.score,
        "ai_feedback": submission.ai_feedback,
        "code_content": submission.code_content,
        "judge_output": submission.judge_output,
    }
