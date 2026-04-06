import os
import asyncio
from celery import Celery
from sqlmodel import Session
from dotenv import load_dotenv
import logging

load_dotenv()

from models import Submission, Problem, TestCase, User
from database import engine
from judge import judge_submission

logger = logging.getLogger(__name__)

redis_url = os.getenv(
    "CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379/1")
)

if redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
    if "?" in redis_url:
        redis_url += "&ssl_cert_reqs=none"
    else:
        redis_url += "?ssl_cert_reqs=none"

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
    from sync_xp import sync_all_users_xp

    logger.info("Starting automated XP synchronization task...")
    try:
        updated_count = sync_all_users_xp()
        logger.info(f"Automated XP sync completed. Updated {updated_count} users.")
        return f"Sync complete. Updated {updated_count} users."
    except Exception as e:
        logger.error(f"Error during automated XP sync: {e}")
        return "Sync failed"


@celery_app.task(name="refresh_leaderboard_task")
def refresh_leaderboard_task():
    from utils_cache import invalidate_leaderboard_cache

    logger.info("Refreshing leaderboard cache...")
    try:
        invalidate_leaderboard_cache()
        logger.info("Leaderboard cache refreshed successfully.")
        return "Leaderboard refreshed"
    except Exception as e:
        logger.error(f"Error refreshing leaderboard: {e}")
        return "Refresh failed"


@celery_app.task(name="process_submission_task")
def process_submission_task(submission_id: int):
    logger.info(f"Worker picked up submission {submission_id}")

    with Session(engine) as session:
        submission = session.get(Submission, submission_id)
        if not submission:
            logger.error(f"Submission {submission_id} not found in database.")
            return f"Error: Submission {submission_id} not found"

        user = session.get(User, submission.user_id)
        problem = session.get(Problem, submission.problem_id)

        test_cases = (
            session.query(TestCase).filter(TestCase.problem_id == problem.id).all()
        )

        try:
            asyncio.run(
                judge_submission(submission, user, problem, test_cases, session)
            )
            logger.info(f"Successfully evaluated submission {submission_id}")

            from utils_cache import invalidate_leaderboard_cache

            invalidate_leaderboard_cache()
            logger.info("Leaderboard cache invalidated after submission.")

            return f"Evaluated submission {submission_id} successfully."
        except Exception as e:
            logger.error(f"Error during background judge: {e}")
            import traceback

            logger.error(traceback.format_exc())

            submission.status = "error"
            submission.ai_feedback = (
                f"Internal Exception during background evaluation: {str(e)}"
            )
            session.add(submission)
            session.commit()
            return f"Failed submission {submission_id}"


celery_app.conf.beat_schedule = {
    "sync-xp-every-5-minutes": {
        "task": "sync_xp_task",
        "schedule": 300.0,
    },
    "refresh-leaderboard-every-minute": {
        "task": "refresh_leaderboard_task",
        "schedule": 60.0,
    },
}
