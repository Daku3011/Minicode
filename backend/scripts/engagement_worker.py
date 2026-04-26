import os
import sys
import logging
import asyncio
from datetime import datetime, timezone
from sqlmodel import Session, select, func
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path to allow importing from core.database and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from core.models import User, Submission
from services.email_service import send_engagement_lure_emails, send_faculty_report

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("EngagementWorker")

async def run_engagement_cycle():
    logger.info("Starting engagement cycle...")
    
    with Session(engine) as session:
        # 1. Send lure emails to inactive students
        try:
            results = send_engagement_lure_emails(session, days_inactive=2)
            logger.info(f"Lure emails results: {results}")
        except Exception as e:
            logger.error(f"Error in lure emails: {e}")

        # 2. Send faculty reports (Weekly on Mondays)
        try:
            is_monday = datetime.now().weekday() == 0
            if is_monday:
                logger.info("Today is Monday. Preparing weekly faculty reports...")
                faculty_list = session.exec(select(User).where(User.role == "faculty", User.faculty_report_email != None)).all()
                
                if faculty_list:
                    # Gather recent stats for all students
                    students = session.exec(select(User).where(User.role == "student")).all()
                    student_stats = []
                    for s in students:
                        sub_count = session.exec(select(func.count(Submission.id)).where(Submission.user_id == s.id)).one()
                        student_stats.append({
                            "username": s.username,
                            "xp": s.xp,
                            "submissions": sub_count,
                            "last_active": s.last_login.strftime('%Y-%m-%d %H:%M') if s.last_login else "Never"
                        })
                    
                    for faculty in faculty_list:
                        success = send_faculty_report(faculty, student_stats)
                        logger.info(f"Report sent to {faculty.username}: {success}")
            else:
                logger.info(f"Skipping faculty reports (Today is {datetime.now().strftime('%A')}). Reports are sent on Mondays.")
        except Exception as e:
            logger.error(f"Error in faculty reports: {e}")

    logger.info("Engagement cycle completed.")

if __name__ == "__main__":
    # This worker can be run via cron every day or manually
    asyncio.run(run_engagement_cycle())
