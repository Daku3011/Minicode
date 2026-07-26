import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from core.database import get_session
from core.models import User
from core.models_discussion import DiscussionReply, DiscussionThread, DiscussionVote
from services.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/problems/{problem_id}/discussions", tags=["discussions"])


# ── Threads ─────────────────────────────────────────────

@router.get("", response_model=dict)
def list_threads(
    problem_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    sort: str = Query("latest"),
    user: User | None = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    offset = (page - 1) * per_page
    query = select(DiscussionThread).where(DiscussionThread.problem_id == problem_id)

    if sort == "top":
        query = query.order_by(DiscussionThread.is_pinned.desc(), DiscussionThread.view_count.desc(), DiscussionThread.created_at.desc())
    elif sort == "unresolved":
        query = query.where(DiscussionThread.is_resolved == False).order_by(DiscussionThread.created_at.desc())
    else:
        query = query.order_by(DiscussionThread.is_pinned.desc(), DiscussionThread.created_at.desc())

    total = session.exec(select(func.count()).select_from(DiscussionThread).where(DiscussionThread.problem_id == problem_id)).one()
    threads = session.exec(query.offset(offset).limit(per_page)).all()

    result = []
    for t in threads:
        reply_count = session.exec(
            select(func.count()).select_from(DiscussionReply).where(DiscussionReply.thread_id == t.id)
        ).one()
        vote_score = session.exec(
            select(func.coalesce(func.sum(DiscussionVote.vote_type), 0))
            .where(DiscussionVote.thread_id == t.id)
        ).one()
        result.append({
            "id": t.id,
            "title": t.title,
            "content": t.content[:300],
            "author_id": t.author_id,
            "author_name": t.author.username if t.author else "unknown",
            "is_pinned": t.is_pinned,
            "is_resolved": t.is_resolved,
            "reply_count": reply_count,
            "vote_score": vote_score,
            "view_count": t.view_count,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        })

    return {
        "threads": result,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.post("", response_model=dict)
def create_thread(
    problem_id: int,
    title: str,
    content: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not title.strip() or not content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")

    thread = DiscussionThread(
        problem_id=problem_id,
        title=title.strip(),
        content=content.strip(),
        author_id=user.id,
    )
    session.add(thread)
    session.commit()
    session.refresh(thread)

    return {
        "id": thread.id,
        "title": thread.title,
        "content": thread.content,
        "created_at": thread.created_at.isoformat(),
    }


@router.get("/{thread_id}", response_model=dict)
def get_thread(
    problem_id: int,
    thread_id: int,
    user: User | None = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread.view_count = (thread.view_count or 0) + 1
    session.add(thread)
    session.commit()

    vote_score = session.exec(
        select(func.coalesce(func.sum(DiscussionVote.vote_type), 0))
        .where(DiscussionVote.thread_id == thread_id)
    ).one()

    return {
        "id": thread.id,
        "title": thread.title,
        "content": thread.content,
        "author_id": thread.author_id,
        "author_name": thread.author.username if thread.author else "unknown",
        "is_pinned": thread.is_pinned,
        "is_resolved": thread.is_resolved,
        "vote_score": vote_score,
        "view_count": thread.view_count,
        "created_at": thread.created_at.isoformat(),
        "updated_at": thread.updated_at.isoformat() if thread.updated_at else None,
    }


@router.put("/{thread_id}", response_model=dict)
def update_thread(
    problem_id: int,
    thread_id: int,
    title: str | None = None,
    content: str | None = None,
    is_resolved: bool | None = None,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if title is not None:
        thread.title = title.strip()
    if content is not None:
        thread.content = content.strip()
    if is_resolved is not None:
        thread.is_resolved = is_resolved
    thread.updated_at = datetime.now(timezone.utc)

    session.add(thread)
    session.commit()
    return {"status": "updated"}


@router.delete("/{thread_id}", response_model=dict)
def delete_thread(
    problem_id: int,
    thread_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(thread)
    session.commit()
    return {"status": "deleted"}


# ── Replies ─────────────────────────────────────────────

@router.get("/{thread_id}/replies", response_model=dict)
def list_replies(
    problem_id: int,
    thread_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    user: User | None = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")

    offset = (page - 1) * per_page
    total = session.exec(
        select(func.count()).select_from(DiscussionReply).where(DiscussionReply.thread_id == thread_id)
    ).one()

    replies = session.exec(
        select(DiscussionReply)
        .where(DiscussionReply.thread_id == thread_id)
        .order_by(DiscussionReply.is_accepted_answer.desc(), DiscussionReply.created_at.asc())
        .offset(offset)
        .limit(per_page)
    ).all()

    result = []
    for r in replies:
        vote_score = session.exec(
            select(func.coalesce(func.sum(DiscussionVote.vote_type), 0))
            .where(DiscussionVote.reply_id == r.id)
        ).one()
        result.append({
            "id": r.id,
            "parent_id": r.parent_id,
            "content": r.content,
            "author_id": r.author_id,
            "author_name": r.author.username if r.author else "unknown",
            "is_accepted_answer": r.is_accepted_answer,
            "vote_score": vote_score,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        })

    return {"replies": result, "total": total, "page": page, "per_page": per_page}


@router.post("/{thread_id}/replies", response_model=dict)
def create_reply(
    problem_id: int,
    thread_id: int,
    content: str,
    parent_id: int | None = None,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")
    if not content.strip():
        raise HTTPException(status_code=400, detail="Content is required")

    if parent_id:
        parent = session.get(DiscussionReply, parent_id)
        if not parent or parent.thread_id != thread_id:
            raise HTTPException(status_code=400, detail="Invalid parent reply")

    reply = DiscussionReply(
        thread_id=thread_id,
        parent_id=parent_id,
        content=content.strip(),
        author_id=user.id,
    )
    session.add(reply)
    session.commit()
    session.refresh(reply)

    return {
        "id": reply.id,
        "content": reply.content,
        "created_at": reply.created_at.isoformat(),
    }


@router.put("/{thread_id}/replies/{reply_id}", response_model=dict)
def update_reply(
    problem_id: int,
    thread_id: int,
    reply_id: int,
    content: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    reply = session.get(DiscussionReply, reply_id)
    if not reply or reply.thread_id != thread_id:
        raise HTTPException(status_code=404, detail="Reply not found")
    if reply.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    reply.content = content.strip()
    reply.updated_at = datetime.now(timezone.utc)
    session.add(reply)
    session.commit()
    return {"status": "updated"}


@router.delete("/{thread_id}/replies/{reply_id}", response_model=dict)
def delete_reply(
    problem_id: int,
    thread_id: int,
    reply_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    reply = session.get(DiscussionReply, reply_id)
    if not reply or reply.thread_id != thread_id:
        raise HTTPException(status_code=404, detail="Reply not found")
    if reply.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(reply)
    session.commit()
    return {"status": "deleted"}


@router.post("/{thread_id}/replies/{reply_id}/accept", response_model=dict)
def accept_reply(
    problem_id: int,
    thread_id: int,
    reply_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.author_id != user.id:
        raise HTTPException(status_code=403, detail="Only the thread author can accept an answer")

    reply = session.get(DiscussionReply, reply_id)
    if not reply or reply.thread_id != thread_id:
        raise HTTPException(status_code=404, detail="Reply not found")

    for r in session.exec(
        select(DiscussionReply).where(DiscussionReply.thread_id == thread_id)
    ).all():
        r.is_accepted_answer = (r.id == reply_id)
        session.add(r)

    thread.is_resolved = True
    session.add(thread)
    session.commit()

    return {"status": "accepted", "reply_id": reply_id}


# ── Votes ───────────────────────────────────────────────

@router.post("/{thread_id}/vote", response_model=dict)
def vote_thread(
    problem_id: int,
    thread_id: int,
    vote_type: int = 1,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    thread = session.get(DiscussionThread, thread_id)
    if not thread or thread.problem_id != problem_id:
        raise HTTPException(status_code=404, detail="Thread not found")

    existing = session.exec(
        select(DiscussionVote).where(
            DiscussionVote.user_id == user.id,
            DiscussionVote.thread_id == thread_id,
        )
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            session.delete(existing)
        else:
            existing.vote_type = vote_type
            session.add(existing)
    else:
        vote = DiscussionVote(
            user_id=user.id,
            thread_id=thread_id,
            vote_type=vote_type,
        )
        session.add(vote)

    session.commit()
    return {"status": "voted"}


@router.post("/{thread_id}/replies/{reply_id}/vote", response_model=dict)
def vote_reply(
    problem_id: int,
    thread_id: int,
    reply_id: int,
    vote_type: int = 1,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    reply = session.get(DiscussionReply, reply_id)
    if not reply or reply.thread_id != thread_id:
        raise HTTPException(status_code=404, detail="Reply not found")

    existing = session.exec(
        select(DiscussionVote).where(
            DiscussionVote.user_id == user.id,
            DiscussionVote.reply_id == reply_id,
        )
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            session.delete(existing)
        else:
            existing.vote_type = vote_type
            session.add(existing)
    else:
        vote = DiscussionVote(
            user_id=user.id,
            reply_id=reply_id,
            vote_type=vote_type,
        )
        session.add(vote)

    session.commit()
    return {"status": "voted"}
