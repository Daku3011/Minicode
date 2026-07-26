from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel
from core.models import User


class DiscussionThread(SQLModel, table=True):
    __tablename__ = "discussion_threads"
    id: int | None = Field(default=None, primary_key=True)
    problem_id: int = Field(foreign_key="problem.id", index=True)
    title: str
    content: str
    author_id: int = Field(foreign_key="users.id", index=True)
    is_pinned: bool = Field(default=False, index=True)
    is_resolved: bool = Field(default=False)
    view_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime | None = None

    author: Optional["User"] = Relationship()
    replies: list["DiscussionReply"] = Relationship(back_populates="thread")
    votes: list["DiscussionVote"] = Relationship(back_populates="thread")


class DiscussionReply(SQLModel, table=True):
    __tablename__ = "discussion_replies"
    id: int | None = Field(default=None, primary_key=True)
    thread_id: int = Field(foreign_key="discussion_threads.id", index=True)
    parent_id: int | None = Field(default=None, foreign_key="discussion_replies.id")
    content: str
    author_id: int = Field(foreign_key="users.id", index=True)
    is_accepted_answer: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime | None = None

    author: Optional["User"] = Relationship()
    thread: DiscussionThread = Relationship(back_populates="replies")
    votes: list["DiscussionVote"] = Relationship(back_populates="reply")


class DiscussionVote(SQLModel, table=True):
    __tablename__ = "discussion_votes"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    thread_id: int | None = Field(default=None, foreign_key="discussion_threads.id", index=True)
    reply_id: int | None = Field(default=None, foreign_key="discussion_replies.id", index=True)
    vote_type: int = Field(default=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship()
    thread: DiscussionThread = Relationship(back_populates="votes")
    reply: DiscussionReply = Relationship(back_populates="votes")
