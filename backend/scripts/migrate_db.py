import os
import sys
from sqlmodel import text, SQLModel
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from core.models import User, Problem, Submission, TestCase, NewsItem, Notification, CohortJoinRequest
from core.models import AlumniProfile, AlumniNotification, ContactRequest, Stream, Milestone, UserMilestoneProgress
from core.models_events import Event, EventParticipant, EventSubmission
from services.email_verification import EmailVerification


def run_migrations():
    print("Initializing tables...")

    with engine.connect() as conn:
        dialect = engine.dialect.name
        print(f"Using database dialect: {dialect}")

        if dialect == "postgresql":
            from sqlalchemy import create_engine
            from sqlalchemy.exc import ProgrammingError

            # Create tables with checkfirst to avoid duplicate errors
            try:
                SQLModel.metadata.create_all(engine, checkfirst=True)
                print("Tables created or already exist.")
            except ProgrammingError as e:
                if "already exists" in str(e):
                    print("Tables already exist, skipping creation.")
                else:
                    raise e
            except Exception as e:
                if "duplicate key" in str(e).lower():
                    print("Tables may already exist, continuing...")
                else:
                    print(f"Table creation warning: {e}")

            print("Running column migrations...")

            # Add missing columns to users table
            columns_to_add = [
                ("last_login", "TIMESTAMP"),
                ("faculty_report_email", "TEXT"),
                ("last_news_viewed_at", "TIMESTAMP"),
                ("unlocked_level", "INTEGER DEFAULT 1"),
                ("google_id", "VARCHAR UNIQUE"),
                ("last_engagement_email_sent", "TIMESTAMP"),
            ]

            for col_name, col_type in columns_to_add:
                try:
                    conn.execute(
                        text(
                            f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};"
                        )
                    )
                    print(f"Added {col_name} to users")
                except Exception as e:
                        print(f"Column {col_name}: {e}")

            # Add visibility to problem table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE problem ADD COLUMN IF NOT EXISTS visibility VARCHAR DEFAULT 'public';"
                    )
                )
                print("Added visibility to problem")
            except Exception as e:
                print(f"Column visibility in problem: {e}")

            # Add is_deleted to problem table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE problem ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;"
                    )
                )
                print("Added is_deleted to problem")
            except Exception as e:
                print(f"Column is_deleted in problem: {e}")

            # Create email_verifications table
            try:
                conn.execute(
                    text("""
                    CREATE TABLE IF NOT EXISTS email_verifications (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        email VARCHAR NOT NULL,
                        otp VARCHAR(6) NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        verified BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW()
                    );
                """)
                )
                print("Created email_verifications table")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("email_verifications table already exists")
                else:
                    print(f"email_verifications table: {e}")

            # Add status to cohorts table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';"
                    )
                )
                print("Added status to cohorts")
            except Exception as e:
                print(f"Column status in cohorts: {e}")

            # Add notes to cohorts table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS notes TEXT;"
                    )
                )
                print("Added notes to cohorts")
            except Exception as e:
                print(f"Column notes in cohorts: {e}")

            # Add hints and resources to milestones table
            for col_name, col_type in [("hints", "TEXT"), ("resources", "TEXT")]:
                try:
                    conn.execute(
                        text(f"ALTER TABLE milestones ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                    )
                    print(f"Added {col_name} to milestones")
                except Exception as e:
                    print(f"Column {col_name} in milestones: {e}")

        elif dialect == "sqlite":
            SQLModel.metadata.create_all(engine, checkfirst=True)
            print("Tables created.")

            print("Running column migrations for sqlite...")
            columns_to_add = [
                ("last_login", "TIMESTAMP"),
                ("faculty_report_email", "TEXT"),
                ("last_news_viewed_at", "TIMESTAMP"),
                ("unlocked_level", "INTEGER DEFAULT 1"),
                ("google_id", "VARCHAR"),
                ("last_engagement_email_sent", "TIMESTAMP"),
            ]

            for col_name, col_type in columns_to_add:
                try:
                    conn.execute(
                        text(
                            f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"
                        )
                    )
                    print(f"Added {col_name} to users")
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        print(f"Column {col_name} already exists")
                    else:
                        print(f"Column {col_name}: {e}")

            # Add visibility to problem table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE problem ADD COLUMN visibility VARCHAR DEFAULT 'public';"
                    )
                )
                print("Added visibility to problem")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("Column visibility already exists in problem")
                else:
                    print(f"Column visibility in problem: {e}")

            # Add is_deleted to problem table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE problem ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;"
                    )
                )
                print("Added is_deleted to problem")
            except Exception as e:
                if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                    print("Column is_deleted already exists in problem")
                else:
                    print(f"Column is_deleted in problem: {e}")

            # Add status to cohorts table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE cohorts ADD COLUMN status VARCHAR DEFAULT 'active';"
                    )
                )
                print("Added status to cohorts")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("Column status already exists in cohorts")
                else:
                    print(f"Column status in cohorts: {e}")

            # Add notes to cohorts table
            try:
                conn.execute(
                    text(
                        "ALTER TABLE cohorts ADD COLUMN notes TEXT;"
                    )
                )
                print("Added notes to cohorts")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("Column notes already exists in cohorts")
                else:
                    print(f"Column notes in cohorts: {e}")

            # Note: email_verifications table is already created by create_all if it's in SQLModel metadata.

            # Add hints and resources to milestones table
            for col_name, col_type in [("hints", "TEXT"), ("resources", "TEXT")]:
                try:
                    conn.execute(
                        text(f"ALTER TABLE milestones ADD COLUMN {col_name} {col_type};")
                    )
                    print(f"Added {col_name} to milestones")
                except Exception as e:
                    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                        print(f"Column {col_name} already exists in milestones")
                    else:
                        print(f"Column {col_name} in milestones: {e}")

        conn.commit()
        print("Migrations completed.")


if __name__ == "__main__":
    run_migrations()
