import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from core.database import get_session
from core.models import User
from core.models_collab import CollabParticipant, CollabSession, CollabSessionSnapshot
from services.auth import get_current_user
from services.collab_manager import collab_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/collab", tags=["collaboration"])


@router.websocket("/ws/{session_id}")
async def collab_websocket(
    websocket: WebSocket,
    session_id: int,
    token: str = Query(...),
):
    from jose import jwt

    from core.database import engine
    from services.auth import ALGORITHM, JWT_SECRET

    user_id = None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            await websocket.close(code=4001)
            return
        with Session(engine) as session:
            user = session.exec(select(User).where(User.username == username)).first()
            if not user:
                await websocket.close(code=4001)
                return
            user_id = user.id

        collab_session = session.get(CollabSession, session_id)
        if not collab_session or not collab_session.is_active:
            await websocket.close(code=4004)
            return
    except Exception as e:
        logger.error(f"WebSocket auth error: {e}")
        await websocket.close(code=4001)
        return

    await collab_manager.connect(websocket, session_id, user_id)

    participant = session.exec(
        select(CollabParticipant).where(
            CollabParticipant.session_id == session_id,
            CollabParticipant.user_id == user_id,
        )
    ).first()
    if participant:
        participant.is_connected = True
        session.add(participant)
        session.commit()

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "code_change":
                await collab_manager.handle_code_change(session_id, user_id, data)
                with Session(engine) as db_session:
                    cs = db_session.get(CollabSession, session_id)
                    if cs and data.get("code"):
                        cs.code_content = data["code"]
                        cs.updated_at = datetime.now(timezone.utc)
                        db_session.add(cs)
                        db_session.commit()
            elif msg_type == "cursor_update":
                await collab_manager.handle_cursor_update(session_id, user_id, data)
            elif msg_type == "snapshot":
                with Session(engine) as db_session:
                    cs = db_session.get(CollabSession, session_id)
                    if cs:
                        snapshot = CollabSessionSnapshot(
                            session_id=session_id,
                            code_content=cs.code_content,
                            snapshot_type="manual",
                        )
                        db_session.add(snapshot)
                        db_session.commit()
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        collab_manager.disconnect(session_id, user_id)
        with Session(engine) as db_session:
            p = db_session.exec(
                select(CollabParticipant).where(
                    CollabParticipant.session_id == session_id,
                    CollabParticipant.user_id == user_id,
                )
            ).first()
            if p:
                p.is_connected = False
                p.left_at = datetime.now(timezone.utc)
                db_session.add(p)
                db_session.commit()
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        collab_manager.disconnect(session_id, user_id)


@router.post("/sessions", response_model=dict)
def create_session(
    title: str,
    problem_id: int | None = None,
    language: str = "python",
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    collab = CollabSession(
        title=title,
        problem_id=problem_id,
        language=language,
        owner_id=user.id,
    )
    session.add(collab)
    session.commit()
    session.refresh(collab)

    participant = CollabParticipant(
        session_id=collab.id,
        user_id=user.id,
        role="owner",
    )
    session.add(participant)
    session.commit()

    return {
        "id": collab.id,
        "title": collab.title,
        "language": collab.language,
        "problem_id": collab.problem_id,
        "created_at": collab.created_at.isoformat(),
    }


@router.get("/sessions", response_model=list[dict])
def list_sessions(
    problem_id: int | None = None,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    query = select(CollabSession).where(CollabSession.is_active == True)
    if problem_id:
        query = query.where(CollabSession.problem_id == problem_id)
    query = query.order_by(CollabSession.updated_at.desc().nullslast(), CollabSession.created_at.desc())

    sessions = db_session.exec(query).all()
    result = []
    for s in sessions:
        active_count = len(collab_manager.get_active_users(s.id))
        result.append({
            "id": s.id,
            "title": s.title,
            "language": s.language,
            "problem_id": s.problem_id,
            "owner_id": s.owner_id,
            "participant_count": active_count,
            "created_at": s.created_at.isoformat(),
        })
    return result


@router.get("/sessions/{session_id}", response_model=dict)
def get_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    collab = db_session.get(CollabSession, session_id)
    if not collab:
        raise HTTPException(status_code=404, detail="Session not found")

    participants = db_session.exec(
        select(CollabParticipant).where(CollabParticipant.session_id == session_id)
    ).all()

    active_users = collab_manager.get_active_users(session_id)

    return {
        "id": collab.id,
        "title": collab.title,
        "language": collab.language,
        "code_content": collab.code_content,
        "problem_id": collab.problem_id,
        "owner_id": collab.owner_id,
        "is_active": collab.is_active,
        "participants": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "role": p.role,
                "is_connected": p.is_connected or p.user_id in active_users,
                "joined_at": p.joined_at.isoformat(),
            }
            for p in participants
        ],
        "created_at": collab.created_at.isoformat(),
    }


@router.post("/sessions/{session_id}/join", response_model=dict)
def join_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    collab = db_session.get(CollabSession, session_id)
    if not collab or not collab.is_active:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = db_session.exec(
        select(CollabParticipant).where(
            CollabParticipant.session_id == session_id,
            CollabParticipant.user_id == user.id,
        )
    ).first()

    if not existing:
        participant = CollabParticipant(
            session_id=session_id,
            user_id=user.id,
            role="editor",
        )
        db_session.add(participant)
        db_session.commit()

    return {"status": "joined", "session_id": session_id}


@router.post("/sessions/{session_id}/leave", response_model=dict)
def leave_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    participant = db_session.exec(
        select(CollabParticipant).where(
            CollabParticipant.session_id == session_id,
            CollabParticipant.user_id == user.id,
        )
    ).first()

    if participant:
        participant.is_connected = False
        participant.left_at = datetime.now(timezone.utc)
        db_session.add(participant)
        db_session.commit()

    return {"status": "left", "session_id": session_id}


@router.delete("/sessions/{session_id}", response_model=dict)
def delete_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    collab = db_session.get(CollabSession, session_id)
    if not collab:
        raise HTTPException(status_code=404, detail="Session not found")
    if collab.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this session")

    collab.is_active = False
    db_session.add(collab)
    db_session.commit()

    if session_id in collab_manager.rooms:
        del collab_manager.rooms[session_id]

    return {"status": "deleted", "session_id": session_id}


@router.get("/sessions/{session_id}/snapshots", response_model=list[dict])
def list_snapshots(
    session_id: int,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_session),
):
    collab = db_session.get(CollabSession, session_id)
    if not collab:
        raise HTTPException(status_code=404, detail="Session not found")

    snapshots = db_session.exec(
        select(CollabSessionSnapshot)
        .where(CollabSessionSnapshot.session_id == session_id)
        .order_by(CollabSessionSnapshot.created_at.desc())
        .limit(50)
    ).all()

    return [
        {
            "id": s.id,
            "code_content": s.code_content[:500],
            "snapshot_type": s.snapshot_type,
            "created_at": s.created_at.isoformat(),
        }
        for s in snapshots
    ]
