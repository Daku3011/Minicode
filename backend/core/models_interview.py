from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Interview(SQLModel, table=True):
    __tablename__ = "interviews"
    id: Optional[int] = Field(default=None, primary_key=True)
    creator_id: int = Field(foreign_key="users.id", index=True)
    candidate_emails_json: str = Field(default="[]")
    problems_json: str = Field(default="[]")
    duration_minutes: int = Field(default=60)
    scheduled_at: Optional[datetime] = None
    status: str = Field(default="scheduled", index=True)
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    creator: Optional["User"] = Relationship()
    sessions: List["InterviewSession"] = Relationship(back_populates="interview")


class InterviewSession(SQLModel, table=True):
    __tablename__ = "interview_sessions"
    id: Optional[int] = Field(default=None, primary_key=True)
    interview_id: int = Field(foreign_key="interviews.id", index=True)
    candidate_id: int = Field(foreign_key="users.id", index=True)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = Field(default="pending")
    recording_json: Optional[str] = Field(default=None)
    score: Optional[float] = None
    code_snapshots_json: Optional[str] = Field(default=None)
    final_code_json: Optional[str] = Field(default=None)
    evaluation: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    interview: Optional[Interview] = Relationship(back_populates="sessions")
    candidate: Optional["User"] = Relationship()
