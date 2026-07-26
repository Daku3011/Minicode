import json
import logging
from typing import Any

from core.models_review import CodeReview, ReviewComment, ReviewRequest
from sqlmodel import Session, select

logger = logging.getLogger(__name__)


def request_review(
    submission_id: int, user_id: int, required_reviewers: int = 1, session: Session | None = None
) -> ReviewRequest:
    review_request = ReviewRequest(
        submission_id=submission_id,
        requester_id=user_id,
        required_reviewers=required_reviewers,
        status="pending",
    )
    session.add(review_request)
    session.commit()
    session.refresh(review_request)
    return review_request


def assign_reviewer(
    review_request_id: int, reviewer_id: int, session: Session | None = None
) -> ReviewRequest:
    review_request = session.get(ReviewRequest, review_request_id)
    if not review_request:
        raise ValueError("Review request not found")
    review_request.status = "assigned"
    session.add(review_request)
    session.commit()
    session.refresh(review_request)
    return review_request


def submit_review(
    review_data: dict[str, Any], session: Session | None = None
) -> CodeReview:
    review = CodeReview(
        submission_id=review_data["submission_id"],
        reviewer_id=review_data["reviewer_id"],
        status="completed",
        overall_score=review_data.get("overall_score"),
        complexity_score=review_data.get("complexity_score"),
        readability_score=review_data.get("readability_score"),
        comments_json=json.dumps(review_data.get("comments", [])),
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    for c in review_data.get("comments", []):
        comment = ReviewComment(
            review_id=review.id,
            file_path=c.get("file_path"),
            line_start=c.get("line_start"),
            line_end=c.get("line_end"),
            comment=c.get("comment", ""),
            comment_type=c.get("comment_type", "suggestion"),
        )
        session.add(comment)

    session.commit()
    return review


def resolve_comment(comment_id: int, session: Session | None = None) -> ReviewComment:
    comment = session.get(ReviewComment, comment_id)
    if not comment:
        raise ValueError("Comment not found")
    comment.resolved = True
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


def calculate_review_quality(review_id: int, session: Session | None = None) -> dict[str, Any]:
    review = session.get(CodeReview, review_id)
    if not review:
        raise ValueError("Review not found")
    comment_count = len(session.exec(
        select(ReviewComment).where(ReviewComment.review_id == review_id)
    ).all())
    has_scores = all(
        s is not None for s in [review.overall_score, review.complexity_score, review.readability_score]
    )
    quality = "good" if comment_count >= 3 and has_scores else "needs_improvement"
    return {
        "review_id": review_id,
        "comment_count": comment_count,
        "has_scores": has_scores,
        "quality": quality,
    }


def get_review_summary(submission_id: int, session: Session | None = None) -> dict[str, Any]:
    reviews = session.exec(
        select(CodeReview).where(CodeReview.submission_id == submission_id)
    ).all()

    if not reviews:
        return {"submission_id": submission_id, "review_count": 0}

    scores = [r for r in reviews if r.overall_score is not None]
    avg_overall = sum(r.overall_score for r in scores) / len(scores) if scores else None

    return {
        "submission_id": submission_id,
        "review_count": len(reviews),
        "average_overall_score": avg_overall,
        "reviews": [
            {
                "id": r.id,
                "reviewer_id": r.reviewer_id,
                "overall_score": r.overall_score,
                "complexity_score": r.complexity_score,
                "readability_score": r.readability_score,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ],
    }
