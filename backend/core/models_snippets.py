from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from core.models import User


class CodeSnippet(SQLModel, table=True):
    __tablename__ = "code_snippets"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(index=True)
    description: str | None = None
    language: str = Field(index=True)
    code_content: str
    tags_json: str | None = None
    is_public: bool = Field(default=True, index=True)
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime | None = None

    author: Optional["User"] = Relationship()
    votes: list["SnippetVote"] = Relationship(back_populates="snippet")
    comments: list["SnippetComment"] = Relationship(back_populates="snippet")


class SnippetVote(SQLModel, table=True):
    __tablename__ = "snippet_votes"
    id: int | None = Field(default=None, primary_key=True)
    snippet_id: int = Field(foreign_key="code_snippets.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    vote_type: str = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    snippet: CodeSnippet = Relationship(back_populates="votes")


class SnippetComment(SQLModel, table=True):
    __tablename__ = "snippet_comments"
    id: int | None = Field(default=None, primary_key=True)
    snippet_id: int = Field(foreign_key="code_snippets.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    snippet: CodeSnippet = Relationship(back_populates="comments")
    author: Optional["User"] = Relationship()
