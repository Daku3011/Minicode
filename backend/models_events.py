from datetime import datetime,timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from models import User


class Event(SQLModel, table=True):
    """Events can be weekly challenges, team projects, or announcements."""

    __tablename__ = "events"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    event_type: str = Field(
        index=True
    )  # "weekly_challenge", "team_project", "announcement"
    difficulty: Optional[str] = None  # "Easy", "Medium", "Hard"
    subject: Optional[str] = None  # Associated subject
    start_date: datetime
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    prize_description: Optional[str] = None
    rules: Optional[str] = None
    problem_ids: Optional[str] = None  # JSON string of associated problem IDs
    status: str = Field(
        default="draft", index=True
    )  # "draft", "active", "completed", "cancelled"
    min_level: int = Field(default=1)  # Minimum level to participate (1 = any student)
    xp_reward: int = Field(default=500)  # XP reward for participating
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

    # Relationships
    author: Optional[User] = Relationship()
    participants: List["EventParticipant"] = Relationship(back_populates="event")
    submissions: List["EventSubmission"] = Relationship(back_populates="event")


class EventParticipant(SQLModel, table=True):
    """Tracks who has joined each event, with optional team info."""

    __tablename__ = "event_participants"

    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    team_name: Optional[str] = None
    team_members: Optional[str] = None  # JSON string of user IDs for team projects
    status: str = Field(default="active")  # "active", "withdrawn", "disqualified"
    xp_awarded: int = Field(default=0)  # XP actually awarded by faculty
    feedback: Optional[str] = None  # Faculty feedback for participant
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    event: Event = Relationship(back_populates="participants")
    user: User = Relationship()


class TeamInvitation(SQLModel, table=True):
    """Invitations to join a team for an event."""

    __tablename__ = "team_invitations"

    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    from_user_id: int = Field(foreign_key="users.id")  # Who sent the invite
    to_user_id: int = Field(foreign_key="users.id")  # Who receives the invite
    team_name: str
    status: str = Field(
        default="pending"
    )  # "pending", "accepted", "rejected", "cancelled"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: Optional[datetime] = None

    # Relationships
    event: Event = Relationship()
    from_user: User = Relationship(sa_relationship_kwargs={"foreign_keys": "TeamInvitation.from_user_id"})
    to_user: User = Relationship(sa_relationship_kwargs={"foreign_keys": "TeamInvitation.to_user_id"})


class EventSubmission(SQLModel, table=True):
    """Submissions made for specific events."""

    __tablename__ = "event_submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    submission_id: Optional[int] = Field(
        default=None, foreign_key="submission.id"
    )  # Link to main submission
    repo_url: str
    submission_notes: Optional[str] = None
    score: int = Field(default=0)
    feedback: Optional[str] = None
    rank: Optional[int] = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    event: Event = Relationship(back_populates="submissions")
    user: User = Relationship()
