from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel
from core.models import User


class CollabSession(SQLModel, table=True):
    __tablename__ = "collab_sessions"
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    problem_id: int | None = Field(default=None, foreign_key="problem.id", index=True)
    language: str = Field(default="python")
    code_content: str = Field(default="")
    owner_id: int = Field(foreign_key="users.id", index=True)
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

    owner: Optional["User"] = Relationship()
    participants: list["CollabParticipant"] = Relationship(back_populates="session")
    snapshots: list["CollabSessionSnapshot"] = Relationship(back_populates="session")


class CollabParticipant(SQLModel, table=True):
    __tablename__ = "collab_participants"
    id: int | None = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="collab_sessions.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: str = Field(default="editor")
    cursor_position: str | None = None
    is_connected: bool = Field(default=False)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    left_at: datetime | None = None

    session: CollabSession = Relationship(back_populates="participants")
    user: Optional["User"] = Relationship()


class CollabSessionSnapshot(SQLModel, table=True):
    __tablename__ = "collab_session_snapshots"
    id: int | None = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="collab_sessions.id", index=True)
    code_content: str
    snapshot_type: str = Field(default="periodic")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    session: CollabSession = Relationship(back_populates="snapshots")
