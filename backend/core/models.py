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
    role: str = Field(default="student")  # student, faculty, admin, alumni
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
    is_deleted: bool = Field(default=False, index=True)

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



class CohortJoinRequest(SQLModel, table=True):
    __tablename__ = "cohort_join_requests"
    id: Optional[int] = Field(default=None, primary_key=True)
    cohort_id: int = Field(foreign_key="cohorts.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    status: str = Field(default="pending", index=True)  # pending, approved, rejected
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: Optional[datetime] = None
    faculty_note: Optional[str] = None  # Reason for rejection

    cohort: Optional["Cohort"] = Relationship()
    user: Optional["User"] = Relationship()


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
    join_requests: List["CohortJoinRequest"] = Relationship(back_populates="cohort")

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


class AlumniProfile(SQLModel, table=True):
    __tablename__ = "alumni_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    headline: Optional[str] = None  # Professional headline
    company: Optional[str] = None   # Current company
    location: Optional[str] = None  # Current location
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    bio: Optional[str] = None       # About me
    graduation_year: Optional[int] = None
    degree: Optional[str] = None
    skills: Optional[str] = None    # Comma-separated or JSON string
    projects: Optional[str] = None  # JSON string of projects
    employment_history: Optional[str] = None  # JSON string of work experience
    is_available_for_mentoring: bool = Field(default=False)
    is_available_for_job_referrals: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    user: Optional["User"] = Relationship()


class AlumniNotification(SQLModel, table=True):
    __tablename__ = "alumni_notifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    alumni_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(index=True)
    message: str
    notification_type: str = Field(default="info", index=True)  # info, warning, success
    is_read: bool = Field(default=False, index=True)
    related_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    expires_at: Optional[datetime] = None
    
    alumni: Optional["User"] = Relationship()


class Stream(SQLModel, table=True):
    __tablename__ = "streams"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    slug: str = Field(index=True, unique=True)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    milestones: List["Milestone"] = Relationship(back_populates="stream")


class Milestone(SQLModel, table=True):
    __tablename__ = "milestones"
    id: Optional[int] = Field(default=None, primary_key=True)
    stream_id: int = Field(foreign_key="streams.id", index=True)
    title: str
    description: Optional[str] = None
    order: int = Field(default=0)
    xp_reward: int = Field(default=100)
    content: Optional[str] = None
    hints: Optional[str] = None
    resources: Optional[str] = None
    subtasks: Optional[str] = None  # JSON list of subtask objects
    prerequisites: Optional[str] = None  # What students need to start
    what_to_submit: Optional[str] = None  # Clear submission deliverables
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    stream: Stream = Relationship(back_populates="milestones")
    user_progress: List["UserMilestoneProgress"] = Relationship(back_populates="milestone")


class UserMilestoneProgress(SQLModel, table=True):
    __tablename__ = "user_milestone_progress"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    milestone_id: int = Field(foreign_key="milestones.id", index=True)
    status: str = Field(default="locked")  # locked, in_progress, completed, rewarded
    note: Optional[str] = None
    completed_subtask_ids: Optional[str] = None  # JSON list of completed subtask IDs
    completed_at: Optional[datetime] = None
    rewarded_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: User = Relationship()
    milestone: Milestone = Relationship(back_populates="user_progress")


class ContactRequest(SQLModel, table=True):
    __tablename__ = "contact_requests"
    id: Optional[int] = Field(default=None, primary_key=True)
    requester_id: int = Field(foreign_key="users.id", index=True)  # Student or alumni making request
    recipient_id: int = Field(foreign_key="users.id", index=True)  # Alumni being requested
    status: str = Field(default="pending", index=True)  # pending, accepted, rejected, completed
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responded_at: Optional[datetime] = None
    message: Optional[str] = None  # Initial message from requester
    response_message: Optional[str] = None  # Response from recipient

