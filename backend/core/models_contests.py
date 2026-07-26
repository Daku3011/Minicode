from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Contest(SQLModel, table=True):
    __tablename__ = "contests"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    start_time: datetime
    end_time: datetime
    registration_deadline: datetime | None = None
    duration_minutes: int = Field(default=120)
    problems_json: str | None = None
    rules: str | None = None
    scoring_type: str = Field(default="standard")
    status: str = Field(default="draft", index=True)
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None


class ContestParticipant(SQLModel, table=True):
    __tablename__ = "contest_participants"

    id: int | None = Field(default=None, primary_key=True)
    contest_id: int = Field(foreign_key="contests.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    score: int = Field(default=0)
    rank: int | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContestSubmission(SQLModel, table=True):
    __tablename__ = "contest_submissions"

    id: int | None = Field(default=None, primary_key=True)
    contest_id: int = Field(foreign_key="contests.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    problem_index: str
    submission_id: int | None = Field(default=None, foreign_key="submission.id")
    score: int = Field(default=0)
    time_taken_seconds: int | None = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeamProfile(SQLModel, table=True):
    __tablename__ = "team_profiles"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True)
    roles: str | None = None
    skills: str | None = None
    availability: str | None = None
    bio: str | None = None
    preferred_team_size: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None


class TeamFormationRequest(SQLModel, table=True):
    __tablename__ = "team_formation_requests"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str
    description: str | None = None
    desired_roles: str | None = None
    required_skills: str | None = None
    team_size: int = Field(default=4)
    status: str = Field(default="open", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None


class TeamFormationApplication(SQLModel, table=True):
    __tablename__ = "team_formation_applications"

    id: int | None = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="team_formation_requests.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    message: str | None = None
    status: str = Field(default="pending", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: datetime | None = None
