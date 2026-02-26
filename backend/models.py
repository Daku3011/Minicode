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
    role: str = Field(default="student") # student, faculty, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)

    submissions: List["Submission"] = Relationship(back_populates="user")
    created_problems: List["Problem"] = Relationship(back_populates="author")

class Problem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    difficulty: str = Field(default="Easy") # Easy, Medium, Hard
    input_format: Optional[str] = None
    output_format: Optional[str] = None
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
    user_id: int = Field(foreign_key="users.id")
    problem_id: int = Field(foreign_key="problem.id")
    repo_url: Optional[str] = None
    commit_sha: Optional[str] = None
    code_content: Optional[str] = None
    language: Optional[str] = None
    status: str = Field(default="pending") # pending, accepted, wrong_answer, runtime_error, tle, mle, error
    score: int = Field(default=0)
    ai_feedback: Optional[str] = None
    judge_output: Optional[str] = None
    memory_used: Optional[int] = None # in KB
    time_taken: Optional[float] = None # in seconds
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="submissions")
    problem: Problem = Relationship(back_populates="submissions")
