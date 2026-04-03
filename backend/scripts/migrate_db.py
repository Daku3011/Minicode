import os
import sys
from sqlmodel import create_engine, text, SQLModel
from dotenv import load_dotenv

load_dotenv()

# Add current directory to path
sys.path.append(os.getcwd())

from models import User, Problem, Submission, TestCase, NewsItem, Notification
from models_events import Event, EventParticipant, EventSubmission

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./minicode.db")
if DATABASE_URL.startswith("postgresql"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(DATABASE_URL)

def run_migrations():
    print("Initializing tables...")
    SQLModel.metadata.create_all(engine)
    print("Tables created.")

    with engine.connect() as conn:
        print("Running column migrations...")
        
        # Check dialect
        dialect = engine.dialect.name
        
        if dialect == "sqlite":
            # For SQLite
            res = conn.execute(text("PRAGMA table_info(users);")).fetchall()
            cols = [r[1] for r in res]
            
            if 'last_login' not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME;"))
                print("Added last_login to users (SQLite)")
            
            if 'faculty_report_email' not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN faculty_report_email TEXT;"))
                print("Added faculty_report_email to users (SQLite)")
        else:
            # For PostgreSQL (supports IF NOT EXISTS in 9.6+)
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;"))
                print("Applied last_login migration (Postgres)")
            except Exception as e:
                print(f"Postgres migration error (last_login): {e}")

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty_report_email TEXT;"))
                print("Applied faculty_report_email migration (Postgres)")
            except Exception as e:
                print(f"Postgres migration error (faculty_report_email): {e}")
        
        conn.commit()
        print("Migrations completed.")

if __name__ == "__main__":
    run_migrations()
