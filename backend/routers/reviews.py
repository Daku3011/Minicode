from datetime import datetime, timezone

from core.database import get_session
from core.models import User
from core.models_review import CodeReview, ReviewComment, ReviewRequest
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.auth import get_current_user
from services.review_service import (
    get_review_summary as svc_get_review_summary,
)
from services.review_service import (
    request_review as svc_request_review,
)
from services.review_service import (
    resolve_comment as svc_resolve_comment,
)
from services.review_service import (
    submit_review as svc_submit_review,
)
from sqlmodel import Session, select

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewRequestInput(BaseModel):
    submission_id: int
    required_reviewers: int = 1


class ReviewSubmitInput(BaseModel):
    overall_score: float | None = None
    complexity_score: float | None = None
    readability_score: float | None = None
    comments: list[dict] = []


@router.post("/request")
def request_review(
    data: ReviewRequestInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    review_request = svc_request_review(
        submission_id=data.submission_id,
        user_id=user.id,
        required_reviewers=data.required_reviewers,
        session=session,
    )
    return review_request


@router.get("/pending")
def get_pending_reviews(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    reviews = session.exec(
        select(CodeReview).where(
            CodeReview.reviewer_id == user.id,
            CodeReview.status == "pending",
        )
    ).all()
    return reviews


@router.get("/my-requests")
def get_my_review_requests(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    requests = session.exec(
        select(ReviewRequest).where(ReviewRequest.requester_id == user.id)
    ).all()
    return requests


@router.post("/{request_id}/submit")
def submit_review(
    request_id: int,
    data: ReviewSubmitInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    review_request = session.get(ReviewRequest, request_id)
    if not review_request:
        raise HTTPException(status_code=404, detail="Review request not found")

    review_data = {
        "submission_id": review_request.submission_id,
        "reviewer_id": user.id,
        "overall_score": data.overall_score,
        "complexity_score": data.complexity_score,
        "readability_score": data.readability_score,
        "comments": data.comments,
    }
    review = svc_submit_review(review_data, session=session)
    review_request.status = "completed"
    review_request.completed_at = datetime.now(timezone.utc)
    session.add(review_request)
    session.commit()

    try:
        from services.plugin_engine import run_hook
        run_hook("on_review_submit", review)
    except Exception:
        pass

    return review


@router.get("/{review_id}")
def get_review(
    review_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    review = session.get(CodeReview, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    comments = session.exec(
        select(ReviewComment).where(ReviewComment.review_id == review_id)
    ).all()
    return {
        "review": review,
        "comments": comments,
    }


@router.post("/comments/{comment_id}/resolve")
def resolve_comment_endpoint(
    comment_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    comment = svc_resolve_comment(comment_id, session=session)
    return comment


@router.get("/submission/{submission_id}")
def get_submission_reviews(
    submission_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    summary = svc_get_review_summary(submission_id, session=session)
    return summary
