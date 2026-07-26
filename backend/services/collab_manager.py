import asyncio
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class CollabRoom:
    def __init__(self, session_id: int):
        self.session_id = session_id
        self.connections: dict[int, WebSocket] = {}
        self.cursor_positions: dict[int, dict] = {}

    @property
    def user_ids(self) -> set[int]:
        return set(self.connections.keys())

    async def broadcast(self, message: dict, exclude_user_id: int | None = None):
        for uid, ws in self.connections.items():
            if uid == exclude_user_id:
                continue
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to user {uid} in session {self.session_id}: {e}")


class CollabManager:
    def __init__(self):
        self.rooms: dict[int, CollabRoom] = {}

    def get_or_create_room(self, session_id: int) -> CollabRoom:
        if session_id not in self.rooms:
            self.rooms[session_id] = CollabRoom(session_id)
        return self.rooms[session_id]

    def get_room(self, session_id: int) -> CollabRoom | None:
        return self.rooms.get(session_id)

    async def connect(self, websocket: WebSocket, session_id: int, user_id: int):
        await websocket.accept()
        room = self.get_or_create_room(session_id)
        room.connections[user_id] = websocket
        logger.info(f"User {user_id} connected to collab session {session_id}")

        await room.broadcast({
            "type": "user_joined",
            "user_id": user_id,
            "active_users": list(room.user_ids),
        })

    def disconnect(self, session_id: int, user_id: int):
        room = self.get_room(session_id)
        if not room:
            return
        room.connections.pop(user_id, None)
        room.cursor_positions.pop(user_id, None)
        logger.info(f"User {user_id} disconnected from collab session {session_id}")

        if not room.connections:
            del self.rooms[session_id]
        else:
            asyncio.create_task(room.broadcast({
                "type": "user_left",
                "user_id": user_id,
                "active_users": list(room.user_ids),
            }))

    async def handle_code_change(self, session_id: int, user_id: int, data: dict):
        room = self.get_room(session_id)
        if not room:
            return
        await room.broadcast({
            "type": "code_change",
            "user_id": user_id,
            "patch": data.get("patch"),
            "code": data.get("code"),
        }, exclude_user_id=user_id)

    async def handle_cursor_update(self, session_id: int, user_id: int, data: dict):
        room = self.get_room(session_id)
        if not room:
            return
        position = {
            "line": data.get("line"),
            "column": data.get("column"),
            "selection": data.get("selection"),
        }
        room.cursor_positions[user_id] = position
        await room.broadcast({
            "type": "cursor_update",
            "user_id": user_id,
            "position": position,
        }, exclude_user_id=user_id)

    def get_active_users(self, session_id: int) -> list[int]:
        room = self.get_room(session_id)
        if not room:
            return []
        return list(room.user_ids)

    def get_cursor_positions(self, session_id: int) -> dict[int, dict]:
        room = self.get_room(session_id)
        if not room:
            return {}
        return dict(room.cursor_positions)


collab_manager = CollabManager()
