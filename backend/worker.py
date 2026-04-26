import os
import sys
import asyncio
from celery import Celery
from sqlmodel import Session
from dotenv import load_dotenv
import logging

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

load_dotenv()

from core.models import Submission, Problem, TestCase, User
from core.database import engine
from services.judge import judge_submission

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
    from services.sync_xp import sync_all_users_xp

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
    from utils.utils_cache import invalidate_leaderboard_cache

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

            from utils.utils_cache import invalidate_leaderboard_cache

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


@celery_app.task(name="send_inactive_reminders_task")
def send_inactive_reminders_task():
    from services.email_service import send_engagement_lure_emails
    from core.database import engine
    from sqlmodel import Session

    logger.info("Sending inactive student reminder emails...")
    try:
        with Session(engine) as session:
            result = send_engagement_lure_emails(session, days_inactive=3)
            logger.info(f"Inactive reminder results: {result}")
            return f"Sent {result['sent']} reminders to {result['total']} inactive students"
    except Exception as e:
        logger.error(f"Error sending inactive reminders: {e}")
        return "Failed to send inactive reminders"


@celery_app.task(name="send_faculty_reports_task")
def send_faculty_reports_task():
    from services.email_service import send_faculty_report
    from core.database import engine
    from sqlmodel import Session, select, func
    from core.models import User, Submission
    from datetime import datetime, timezone

    logger.info("Sending faculty weekly reports...")
    try:
        with Session(engine) as session:
            faculty_list = session.exec(
                select(User).where(
                    User.role == "faculty", User.faculty_report_email != None
                )
            ).all()

            if not faculty_list:
                logger.info("No faculty members configured for reports")
                return "No faculty configured for reports"

            students = session.exec(select(User).where(User.role == "student")).all()
            student_stats = []
            for s in students:
                sub_count = session.exec(
                    select(func.count(Submission.id)).where(Submission.user_id == s.id)
                ).one()
                student_stats.append(
                    {
                        "username": s.username,
                        "xp": s.xp or 0,
                        "submissions": sub_count,
                        "last_active": s.last_login.strftime("%Y-%m-%d %H:%M")
                        if s.last_login
                        else "Never",
                    }
                )

            sent_count = 0
            for faculty in faculty_list:
                success = send_faculty_report(faculty, student_stats)
                if success:
                    sent_count += 1
                    logger.info(f"Report sent to {faculty.username}")
                else:
                    logger.warning(f"Failed to send report to {faculty.username}")

            return f"Sent {sent_count} faculty reports"
    except Exception as e:
        logger.error(f"Error sending faculty reports: {e}")
        return "Failed to send faculty reports"


celery_app.conf.beat_schedule = {
    "sync-xp-every-5-minutes": {
        "task": "sync_xp_task",
        "schedule": 300.0,
    },
    "refresh-leaderboard-every-minute": {
        "task": "refresh_leaderboard_task",
        "schedule": 60.0,
    },
    "send-inactive-reminders-daily": {
        "task": "send_inactive_reminders_task",
        "schedule": 86400.0,  # Every 24 hours
    },
    "send-faculty-reports-weekly": {
        "task": "send_faculty_reports_task",
        "schedule": 604800.0,  # Every 7 days (weekly)
    },
}
