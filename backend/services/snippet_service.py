import json
import logging
from datetime import datetime, timezone
from typing import Any

from core.models_snippets import CodeSnippet, SnippetVote
from sqlmodel import Session, or_, select

logger = logging.getLogger(__name__)


def create_snippet(
    user_id: int, data: dict[str, Any], session: Session | None = None
) -> CodeSnippet:
    snippet = CodeSnippet(
        user_id=user_id,
        title=data["title"],
        description=data.get("description"),
        language=data["language"],
        code_content=data["code_content"],
        tags_json=json.dumps(data.get("tags", [])),
        is_public=data.get("is_public", True),
    )
    session.add(snippet)
    session.commit()
    session.refresh(snippet)
    return snippet


def update_snippet(
    snippet_id: int, user_id: int, data: dict[str, Any], session: Session | None = None
) -> CodeSnippet:
    snippet = session.get(CodeSnippet, snippet_id)
    if not snippet:
        raise ValueError("Snippet not found")
    if snippet.user_id != user_id:
        raise PermissionError("Not authorized")

    for field in ("title", "description", "language", "code_content", "is_public"):
        if field in data:
            setattr(snippet, field, data[field])
    if "tags" in data:
        snippet.tags_json = json.dumps(data["tags"])
    snippet.updated_at = datetime.now(timezone.utc)

    session.add(snippet)
    session.commit()
    session.refresh(snippet)
    return snippet


def delete_snippet(snippet_id: int, user_id: int, session: Session | None = None) -> None:
    snippet = session.get(CodeSnippet, snippet_id)
    if not snippet:
        raise ValueError("Snippet not found")
    if snippet.user_id != user_id:
        raise PermissionError("Not authorized")
    session.delete(snippet)
    session.commit()


def list_snippets(
    session: Session | None = None,
    search: str | None = None,
    language: str | None = None,
    tag: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> dict[str, Any]:
    query = select(CodeSnippet).where(CodeSnippet.is_public == True)

    if search:
        query = query.where(
            or_(
                CodeSnippet.title.ilike(f"%{search}%"),
                CodeSnippet.description.ilike(f"%{search}%"),
            )
        )
    if language:
        query = query.where(CodeSnippet.language == language)
    if tag:
        query = query.where(CodeSnippet.tags_json.ilike(f"%{tag}%"))

    query = query.order_by(CodeSnippet.created_at.desc())
    total = len(session.exec(query).all())
    snippets = session.exec(query.offset((page - 1) * per_page).limit(per_page)).all()

    return {
        "snippets": [
            {
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "language": s.language,
                "tags": json.loads(s.tags_json) if s.tags_json else [],
                "upvotes": s.upvotes,
                "downvotes": s.downvotes,
                "user_id": s.user_id,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in snippets
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_snippet(snippet_id: int, session: Session | None = None) -> CodeSnippet | None:
    return session.get(CodeSnippet, snippet_id)


def vote_snippet(
    snippet_id: int, user_id: int, vote_type: str, session: Session | None = None
) -> dict[str, Any]:
    snippet = session.get(CodeSnippet, snippet_id)
    if not snippet:
        raise ValueError("Snippet not found")

    existing = session.exec(
        select(SnippetVote).where(
            SnippetVote.snippet_id == snippet_id,
            SnippetVote.user_id == user_id,
        )
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            return {"upvotes": snippet.upvotes, "downvotes": snippet.downvotes}
        if existing.vote_type == "upvote":
            snippet.upvotes = max(0, snippet.upvotes - 1)
        elif existing.vote_type == "downvote":
            snippet.downvotes = max(0, snippet.downvotes - 1)
        existing.vote_type = vote_type
    else:
        new_vote = SnippetVote(snippet_id=snippet_id, user_id=user_id, vote_type=vote_type)
        session.add(new_vote)

    if vote_type == "upvote":
        snippet.upvotes += 1
    elif vote_type == "downvote":
        snippet.downvotes += 1

    session.add(snippet)
    session.commit()
    return {"upvotes": snippet.upvotes, "downvotes": snippet.downvotes}


def get_trending_snippets(
    session: Session | None = None, limit: int = 10
) -> list[dict[str, Any]]:
    snippets = session.exec(
        select(CodeSnippet)
        .where(CodeSnippet.is_public == True)
        .order_by((CodeSnippet.upvotes - CodeSnippet.downvotes).desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "language": s.language,
            "tags": json.loads(s.tags_json) if s.tags_json else [],
            "upvotes": s.upvotes,
            "downvotes": s.downvotes,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in snippets
    ]


def get_my_snippets(
    user_id: int, session: Session | None = None
) -> list[dict[str, Any]]:
    snippets = session.exec(
        select(CodeSnippet)
        .where(CodeSnippet.user_id == user_id)
        .order_by(CodeSnippet.created_at.desc())
    ).all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "language": s.language,
            "tags": json.loads(s.tags_json) if s.tags_json else [],
            "is_public": s.is_public,
            "upvotes": s.upvotes,
            "downvotes": s.downvotes,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in snippets
    ]
