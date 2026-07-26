from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class ExternalPlatformLink(SQLModel, table=True):
    __tablename__ = "external_platform_links"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    platform: str = Field(index=True)  # codeforces, leetcode, hackerrank
    platform_username: str
    profile_url: str | None = None
    is_verified: bool = Field(default=False)
    synced_at: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExternalSubmission(SQLModel, table=True):
    __tablename__ = "external_submissions"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    platform: str = Field(index=True)
    external_id: str | None = None
    problem_name: str
    problem_url: str | None = None
    difficulty: str | None = None
    language: str | None = None
    status: str = Field(default="unknown")
    score: int | None = None
    submitted_at: datetime | None = None
    synced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
