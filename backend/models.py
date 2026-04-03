from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    github_id: Optional[int] = Field(default=None, unique=True)
    github_access_token: Optional[str] = None
    hashed_password: Optional[str] = None
    role: str = Field(default="student")  # student, faculty, admin
    xp: int = Field(default=0)  # Total XP earned
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(default=None)  # For inactivity tracking
    faculty_report_email: Optional[str] = Field(default=None)  # For faculty reports

    submissions: List["Submission"] = Relationship(back_populates="user")
    created_problems: List["Problem"] = Relationship(back_populates="author")


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
    author_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    author: Optional["User"] = Relationship(back_populates="created_problems")
    test_cases: List["TestCase"] = Relationship(back_populates="problem")
    submissions: List["Submission"] = Relationship(back_populates="problem")


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
        default_factory=datetime.utcnow, index=True
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
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
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
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = None

    user: "User" = Relationship()
