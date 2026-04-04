import os
import sys
from sqlmodel import create_engine, text, SQLModel
from dotenv import load_dotenv

load_dotenv()

# Add current directory to path
sys.path.append(os.getcwd())

from models import User, Problem, Submission, TestCase, NewsItem, Notification
from models_events import Event, EventParticipant, EventSubmission

def sanitize_database_url(url: str) -> str:
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    import re
    from urllib.parse import quote
    try:
        pattern = r"^(?P<prefix>.*?://)(?P<userinfo>.*)@(?P<hostinfo>.*)$"
        match = re.match(pattern, url)
        if match:
            prefix = match.group("prefix")
            userinfo = match.group("userinfo")
            hostinfo = match.group("hostinfo")
            if ":" in userinfo:
                user, password = userinfo.split(":", 1)
                if "@" in password and "%40" not in password:
                    password = quote(password)
                return f"{prefix}{user}:{password}@{hostinfo}"
    except Exception:
        pass
    return url

DATABASE_URL = sanitize_database_url(os.getenv("DATABASE_URL", "sqlite:///./minicode.db"))
if DATABASE_URL.startswith("postgresql"):
    # SQLAlchemy requires postgresql+psycopg2 explicitly for some versions
    if "+psycopg2" not in DATABASE_URL:
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
            
            if 'last_news_viewed_at' not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_news_viewed_at DATETIME;"))
                print("Added last_news_viewed_at to users (SQLite)")
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

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_news_viewed_at TIMESTAMP;"))
                print("Applied last_news_viewed_at migration (Postgres)")
            except Exception as e:
                print(f"Postgres migration error (last_news_viewed_at): {e}")
        
        conn.commit()
        print("Migrations completed.")

if __name__ == "__main__":
    run_migrations()
