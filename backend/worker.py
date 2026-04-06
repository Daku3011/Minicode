import os
import asyncio
from celery import Celery
from sqlmodel import Session
from dotenv import load_dotenv
import logging

# We need to load env and our logic
load_dotenv()

from models import Submission, Problem, TestCase, User
from database import engine
from judge import judge_submission

logger = logging.getLogger(__name__)

# Initialize Celery
# We handle rediss:// (SSL) explicitly for Upstash/Render
redis_url = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379/1"))

if redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
    # Append the required SSL parameters for better security/compatibility
    # A rediss:// URL must have parameter ssl_cert_reqs=none for many hosted setups
    if "?" in redis_url:
        redis_url += "&ssl_cert_reqs=none"
    else:
        redis_url += "?ssl_cert_reqs=none"

# Additional config to silence SSL warnings and ensure secure transport
celery_config = {
    "broker_url": redis_url,
    "result_backend": redis_url,
    "task_serializer": "json",
    "accept_content": ["json"],
    "result_serializer": "json",
    "timezone": "UTC",
    "enable_utc": True,
}

if redis_url.startswith("rediss://"):
    import ssl
    celery_config["broker_use_ssl"] = {"ssl_cert_reqs": ssl.CERT_NONE}
    celery_config["redis_backend_use_ssl"] = {"ssl_cert_reqs": ssl.CERT_NONE}

celery_app = Celery("minicode_worker")
celery_app.conf.update(**celery_config)

@celery_app.task(name="sync_xp_task")
def sync_xp_task():
    """
    Periodic task to synchronize XP for all users.
    """
    from .sync_xp import sync_all_users_xp
    logger.info("Starting automated XP synchronization task...")
    try:
        updated_count = sync_all_users_xp()
        logger.info(f"Automated XP sync completed. Updated {updated_count} users.")
        return f"Sync complete. Updated {updated_count} users."
    except Exception as e:
        logger.error(f"Error during automated XP sync: {e}")
        return "Sync failed"

# Configure Beat Schedule
celery_app.conf.beat_schedule = {
    "sync-xp-every-5-minutes": {
        "task": "sync_xp_task",
        "schedule": 300.0,  # 5 minutes in seconds
    },
}

@celery_app.task(name="process_submission_task")
def process_submission_task(submission_id: int):
    """
    Background worker that runs the synchronous DB wrapper and async Gemini API calls 
    via asyncio.run()
    """
    logger.info(f"Worker picked up submission {submission_id}")

    # Spin up its own Database Session to prevent connection issues across threads
    # Use the centralized engine from database.py
    with Session(engine) as session:
        submission = session.get(Submission, submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found in database.")
            return f"Error: Submission {submission_id} not found"

        user = session.get(User, submission.user_id)
        problem = session.get(Problem, submission.problem_id)
        
        # We need the full proxy object models, but fetching standard queries
        # is enough for standard relationships in our app structure.
        
        test_cases = session.query(TestCase).filter(TestCase.problem_id == problem.id).all()
        
        # The judge_submission API is an async function because it calls genai.Client.aio
        # Standard celery tasks are synchronous. We must use asyncio.run to await it.
        try:
            asyncio.run(judge_submission(submission, user, problem, test_cases, session))
            logger.info(f"Successfully evaluated submission {submission_id}")
            return f"Evaluated submission {submission_id} successfully."
        except Exception as e:
            logger.error(f"Error during background judge: {e}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Update safety net
            submission.status = "error"
            submission.ai_feedback = f"Internal Exception during background evaluation: {str(e)}"
            session.add(submission)
            session.commit()
            return f"Failed submission {submission_id}"
