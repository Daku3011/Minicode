from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class UserCohortLink(SQLModel, table=True):
    __tablename__ = "user_cohort_links"
    __table_args__ = {"extend_existing": True}
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", primary_key=True)
    cohort_id: Optional[int] = Field(default=None, foreign_key="cohorts.id", primary_key=True)

class LabProblemLink(SQLModel, table=True):
    __tablename__ = "lab_problem_links"
    __table_args__ = {"extend_existing": True}
    lab_id: Optional[int] = Field(default=None, foreign_key="labs.id", primary_key=True)
    problem_id: Optional[int] = Field(default=None, foreign_key="problem.id", primary_key=True)

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    github_id: Optional[int] = Field(default=None, unique=True)
    google_id: Optional[str] = Field(default=None, unique=True, index=True)
    github_access_token: Optional[str] = None
    hashed_password: Optional[str] = None
    role: str = Field(default="student")  # student, faculty, admin
    xp: int = Field(default=0)  # Total XP earned
    unlocked_level: int = Field(default=1)  # Current unlocked level
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = Field(default=None)  # For inactivity tracking
    faculty_report_email: Optional[str] = Field(default=None)  # For faculty reports
    last_news_viewed_at: Optional[datetime] = Field(
        default=None
    )  # For unread news tracking
    last_engagement_email_sent: Optional[datetime] = Field(default=None)  # For tracking inactivity spam

    submissions: List["Submission"] = Relationship(back_populates="user")
    created_problems: List["Problem"] = Relationship(back_populates="author")
    managed_cohorts: List["Cohort"] = Relationship(back_populates="faculty")
    cohorts: List["Cohort"] = Relationship(back_populates="students", link_model=UserCohortLink)


class Problem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    difficulty: str = Field(default="Easy")  # Easy, Medium, Hard
    subject: Optional[str] = Field(
        default=None, index=True
    )  # Subject area (Data Structures, Algorithms, etc.)
    level: int = Field(default=1)  # Unlock level for students
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None  # Problem constraints
    hints: Optional[str] = None  # Optional hints for students
    xp_reward: int = Field(default=100)  # XP reward for solving
    visibility: str = Field(default="public", index=True)  # public or private
    author_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    author: Optional["User"] = Relationship(back_populates="created_problems")
    test_cases: List["TestCase"] = Relationship(back_populates="problem")
    submissions: List["Submission"] = Relationship(back_populates="problem")
    labs: List["Lab"] = Relationship(back_populates="problems", link_model=LabProblemLink)


class TestCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    problem_id: int = Field(foreign_key="problem.id")
    input_data: str
    expected_output: str
    is_sample: bool = Field(default=False)

    problem: Problem = Relationship(back_populates="test_cases")


class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        foreign_key="users.id", index=True
    )  # Indexed for /auth/me queries
    problem_id: int = Field(
        foreign_key="problem.id", index=True
    )  # Indexed for analytics queries
    repo_url: Optional[str] = None
    commit_sha: Optional[str] = None
    code_content: Optional[str] = None
    language: Optional[str] = None
    status: str = Field(default="pending", index=True)  # Indexed for leaderboard filter
    score: int = Field(default=0)
    ai_feedback: Optional[str] = None
    judge_output: Optional[str] = None
    memory_used: Optional[int] = None  # in KB
    time_taken: Optional[float] = None  # in seconds
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), index=True
    )  # Indexed for sorting
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None  # Soft delete support

    user: User = Relationship(back_populates="submissions")
    problem: Problem = Relationship(back_populates="submissions")


class NewsItem(SQLModel, table=True):
    __tablename__ = "news_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    news_type: str = Field(default="announcement", index=True)
    link: Optional[str] = None
    priority: int = Field(default=0, index=True)
    is_active: bool = Field(default=True, index=True)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    expires_at: Optional[datetime] = None

    author: Optional["User"] = Relationship()


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str
    message: str
    notification_type: str = Field(default="info", index=True)
    is_read: bool = Field(default=False, index=True)
    related_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    expires_at: Optional[datetime] = None

    user: "User" = Relationship()


class QuestRewardClaim(SQLModel, table=True):
    __tablename__ = "quest_reward_claims"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    quest_id: str = Field(index=True)
    xp_awarded: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)

    user: "User" = Relationship()



class Cohort(SQLModel, table=True):
    __tablename__ = "cohorts"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    faculty_id: int = Field(foreign_key="users.id", index=True)
    status: str = Field(default="active", index=True)  # active, archived
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    faculty: Optional["User"] = Relationship(back_populates="managed_cohorts")
    students: List["User"] = Relationship(back_populates="cohorts", link_model=UserCohortLink)
    labs: List["Lab"] = Relationship(back_populates="cohort")

class Lab(SQLModel, table=True):
    __tablename__ = "labs"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    cohort_id: int = Field(foreign_key="cohorts.id", index=True)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    cohort: Optional[Cohort] = Relationship(back_populates="labs")
    problems: List["Problem"] = Relationship(back_populates="labs", link_model=LabProblemLink)


class Hackathon(SQLModel, table=True):
    __tablename__ = "hackathons"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    url: str
    platform: str = Field(index=True)  # "hackerearth", "hack2skill"
    status: str = Field(default="UPCOMING", index=True)  # "ONGOING", "UPCOMING", "ENDED"
    cover_image: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

