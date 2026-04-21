import os
import json
import logging
import asyncio
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps submission_id to a list of active websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.redis_task = None

    async def connect(self, websocket: WebSocket, submission_id: int):
        await websocket.accept()
        if submission_id not in self.active_connections:
            self.active_connections[submission_id] = []
        self.active_connections[submission_id].append(websocket)
        logger.info(f"WebSocket connected for submission {submission_id}")

    def disconnect(self, websocket: WebSocket, submission_id: int):
        if submission_id in self.active_connections:
            if websocket in self.active_connections[submission_id]:
                self.active_connections[submission_id].remove(websocket)
            if not self.active_connections[submission_id]:
                del self.active_connections[submission_id]
        logger.info(f"WebSocket disconnected for submission {submission_id}")

    async def broadcast_status(self, submission_id: int, status: str):
        if submission_id in self.active_connections:
            websockets = self.active_connections[submission_id]
            for ws in websockets:
                try:
                    await ws.send_json({"submission_id": submission_id, "status": status})
                except Exception as e:
                    logger.error(f"Error sending to WebSocket for submission {submission_id}: {e}")

    async def listen_redis_events(self):
        import redis.asyncio as aioredis
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            logger.info("REDIS_URL not provided, skipping Redis websocket listener")
            return

        try:
            r = aioredis.from_url(redis_url)
            pubsub = r.pubsub()
            await pubsub.subscribe("submission_events")
            logger.info("Subscribed to Redis submission_events")
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"].decode("utf-8"))
                    sub_id = data.get("submission_id")
                    status = data.get("status")
                    if sub_id and status:
                        await self.broadcast_status(sub_id, status)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Redis listener error: {e}")

manager = ConnectionManager()
