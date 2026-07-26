from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from core.models import User


class CodeReview(SQLModel, table=True):
    __tablename__ = "code_reviews"
    id: int | None = Field(default=None, primary_key=True)
    submission_id: int = Field(foreign_key="submission.id", index=True)
    reviewer_id: int = Field(foreign_key="users.id", index=True)
    status: str = Field(default="pending")
    overall_score: float | None = None
    complexity_score: float | None = None
    readability_score: float | None = None
    comments_json: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

    reviewer: Optional["User"] = Relationship()
    comments: list["ReviewComment"] = Relationship(back_populates="review")


class ReviewComment(SQLModel, table=True):
    __tablename__ = "review_comments"
    id: int | None = Field(default=None, primary_key=True)
    review_id: int = Field(foreign_key="code_reviews.id", index=True)
    file_path: str | None = None
    line_start: int | None = None
    line_end: int | None = None
    comment: str
    comment_type: str = Field(default="suggestion")
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    review: CodeReview = Relationship(back_populates="comments")


class ReviewRequest(SQLModel, table=True):
    __tablename__ = "review_requests"
    id: int | None = Field(default=None, primary_key=True)
    submission_id: int = Field(foreign_key="submission.id", index=True)
    requester_id: int = Field(foreign_key="users.id", index=True)
    required_reviewers: int = Field(default=1)
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None

    requester: Optional["User"] = Relationship()
