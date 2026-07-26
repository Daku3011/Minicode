from datetime import datetime, timezone, date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from core.models import User


class Badge(SQLModel, table=True):
    __tablename__ = "badges"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    description: str
    icon_url: Optional[str] = None
    category: str = Field(default="milestone", index=True)
    criteria_json: Optional[str] = None
    xp_reward: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user_badges: List["UserBadge"] = Relationship(back_populates="badge")


class UserBadge(SQLModel, table=True):
    __tablename__ = "user_badges"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    badge_id: int = Field(foreign_key="badges.id", index=True)
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    displayed_on_profile: bool = Field(default=True)

    user: "User" = Relationship()
    badge: Badge = Relationship(back_populates="user_badges")


class Achievement(SQLModel, table=True):
    __tablename__ = "achievements"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    badge_id: Optional[int] = Field(default=None, foreign_key="badges.id")
    progress: int = Field(default=0)
    target: int = Field(default=1)
    is_completed: bool = Field(default=False, index=True)
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship()
    badge: Optional[Badge] = Relationship()


class UserStreak(SQLModel, table=True):
    __tablename__ = "user_streaks"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    streak_type: str = Field(index=True)  # 'login_daily', 'submission_daily'
    current_count: int = Field(default=0)
    max_count: int = Field(default=0)
    last_activity_date: Optional[date] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: "User" = Relationship()
