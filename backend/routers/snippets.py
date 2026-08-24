from core.database import get_session
from core.models import User
from core.models_snippets import SnippetComment
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from services.auth import get_current_user
from services.snippet_service import (
    create_snippet as svc_create,
)
from services.snippet_service import (
    delete_snippet as svc_delete,
)
from services.snippet_service import (
    get_my_snippets as svc_my,
)
from services.snippet_service import (
    get_snippet as svc_get,
)
from services.snippet_service import (
    get_trending_snippets as svc_trending,
)
from services.snippet_service import (
    list_snippets as svc_list,
)
from services.snippet_service import (
    update_snippet as svc_update,
)
from services.snippet_service import (
    vote_snippet as svc_vote,
)
from sqlmodel import Session

router = APIRouter(prefix="/snippets", tags=["snippets"])


class SnippetCreate(BaseModel):
    title: str
    description: str | None = None
    language: str
    code_content: str
    tags: list[str] = []
    is_public: bool = True


class SnippetUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    language: str | None = None
    code_content: str | None = None
    tags: list[str] | None = None
    is_public: bool | None = None


class SnippetVoteInput(BaseModel):
    vote_type: str  # "upvote" or "downvote"


class SnippetCommentInput(BaseModel):
    content: str


@router.post("")
def create_snippet(
    data: SnippetCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    snippet = svc_create(user.id, data.model_dump(), session=session)
    return snippet


@router.get("")
def list_snippets(
    search: str | None = Query(None),
    language: str | None = Query(None),
    tag: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return svc_list(
        session=session,
        search=search,
        language=language,
        tag=tag,
        page=page,
        per_page=per_page,
    )


@router.get("/trending")
def trending_snippets(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return svc_trending(session=session)


@router.get("/my")
def my_snippets(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return svc_my(user.id, session=session)


@router.get("/{snippet_id}")
def get_snippet(
    snippet_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    snippet = svc_get(snippet_id, session=session)
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    from sqlmodel import select
    comments = session.exec(
        select(SnippetComment).where(SnippetComment.snippet_id == snippet_id)
    ).all()
    comment_list = [
        {
            "id": c.id,
            "content": c.content,
            "user_id": c.user_id,
            "author_name": c.author.username if c.author else "unknown",
            "author_avatar": c.author.avatar_url if c.author else None,
            "created_at": c.created_at.isoformat(),
        }
        for c in comments
    ]
    return {
        "snippet": snippet,
        "comments": comment_list,
    }


@router.put("/{snippet_id}")
def update_snippet(
    snippet_id: int,
    data: SnippetUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        snippet = svc_update(
            snippet_id, user.id, data.model_dump(exclude_unset=True), session=session
        )
        return snippet
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{snippet_id}")
def delete_snippet(
    snippet_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        svc_delete(snippet_id, user.id, session=session)
        return {"detail": "Snippet deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/{snippet_id}/vote")
def vote_snippet(
    snippet_id: int,
    data: SnippetVoteInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if data.vote_type not in ("upvote", "downvote"):
        raise HTTPException(status_code=400, detail="Invalid vote type")
    try:
        return svc_vote(snippet_id, user.id, data.vote_type, session=session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{snippet_id}/comment")
def comment_snippet(
    snippet_id: int,
    data: SnippetCommentInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    content = data.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
    snippet = svc_get(snippet_id, session=session)
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")

    comment = SnippetComment(
        snippet_id=snippet_id,
        user_id=user.id,
        content=content,
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return {
        "id": comment.id,
        "content": comment.content,
        "author_name": user.username,
        "author_avatar": user.avatar_url if hasattr(user, "avatar_url") else None,
        "created_at": comment.created_at.isoformat(),
    }
