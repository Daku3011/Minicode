import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from dotenv import load_dotenv
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from services.websockets_manager import manager

# Load environment variables
load_dotenv()

# Setup Logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Setup Rate Limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables are created and migrations run on startup
    try:
        from scripts.migrate_db import run_migrations

        run_migrations()
        logger.info("Database tables and migrations initialized successfully")

        # Run seeding script if needed
        try:
            from scripts.seed_db import seed_database

            seed_database()
            logger.info("Database seeding checked/completed")
        except Exception as seed_err:
            logger.warning(f"Seeding skipped or failed: {seed_err}")

    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    # Initialize Cache (Redis or InMemory)
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            redis = aioredis.from_url(redis_url)
            await redis.ping()
            FastAPICache.init(RedisBackend(redis), prefix="minicode-cache")
            logger.info("Redis cache initialized")
        except Exception as e:
            logger.warning(
                f"Failed to connect to Redis: {e}. Falling back to InMemoryBackend"
            )
            from fastapi_cache.backends.inmemory import InMemoryBackend

            FastAPICache.init(InMemoryBackend(), prefix="minicode-cache")
    else:
        from fastapi_cache.backends.inmemory import InMemoryBackend

        FastAPICache.init(InMemoryBackend(), prefix="minicode-cache")
        logger.info("InMemory cache initialized (No REDIS_URL provided)")

    # Start Redis websocket listener
    manager.redis_task = asyncio.create_task(manager.listen_redis_events())

    yield

    if manager.redis_task:
        manager.redis_task.cancel()


# Initialize FastAPI App
app = FastAPI(
    title="MiniCode API",
    description="The Modern Coding Arena for Colleges & Clubs",
    version="2.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security & Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        host = request.headers.get("host", "")
        if not ("localhost" in host or "127.0.0.1" in host):
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response


app.add_middleware(SecurityHeadersMiddleware)

cors_origins_str = os.getenv("CORS_ORIGINS", "")
if cors_origins_str:
    cors_origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]
else:
    # No CORS_ORIGINS set: dev allows localhost, production allows all (better than empty list which blocks everything)
    if os.getenv("ENVIRONMENT") == "production":
        logger.warning("CORS_ORIGINS not set in production — allowing all origins. Set CORS_ORIGINS for tighter security!")
        cors_origins = ["*"]
    else:
        cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "MiniCode API is online"}


# Health Check Endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/ping")
def ping():
    return {"status": "pong", "message": "Render keep-alive successful"}

@app.websocket("/ws/submissions/{submission_id}")
async def websocket_submission_endpoint(websocket: WebSocket, submission_id: int):
    await manager.connect(websocket, submission_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, submission_id)



# Include Feature Routers
from routers.auth import router as auth_router
from routers.problems import router as problems_router
from routers.submissions import router as submissions_router
from routers.admin import router as admin_router
from routers.faculty import router as faculty_router
from routers.leaderboard import router as leaderboard_router
from routers.users import router as users_router
from routers.events import router as events_router
from routers.news import router as news_router
from routers.notifications import router as notifications_router
from routers.feedback import router as feedback_router
from routers.cohorts import router as cohorts_router
from routers.labs import router as labs_router
from routers.hackathons import router as hackathons_router
from routers.alumni import router as alumni_router
from routers.roadmap import router as roadmap_router

app.include_router(auth_router)
app.include_router(problems_router)
app.include_router(submissions_router)
app.include_router(admin_router)
app.include_router(faculty_router)
app.include_router(leaderboard_router)
app.include_router(users_router, prefix="/user")
app.include_router(events_router)
app.include_router(news_router)
app.include_router(notifications_router)
app.include_router(feedback_router)
app.include_router(cohorts_router)
app.include_router(labs_router)
app.include_router(hackathons_router)
app.include_router(alumni_router)
app.include_router(roadmap_router)

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
