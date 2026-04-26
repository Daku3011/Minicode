import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, text
from core.database import engine

def migrate():
    print("Running migration to add google_id column...")
    try:
        with engine.begin() as conn:
            # Check if using sqlite or postgresql to adapt query
            if "sqlite" in str(engine.url):
                # We handle sqlite uniquely because ADD COLUMN UNIQUE is not supported in a single alter table for older sqlite.
                # Since we already ran it locally or we can run:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR;"))
                    conn.execute(text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id);"))
                    print("Added google_id to SQLite DB.")
                except Exception as e:
                    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                        print("Column google_id already exists in SQLite DB.")
                    else:
                        raise e
            else:
                # PostgreSQL
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;"))
                    print("Added google_id to PostgreSQL DB.")
                except Exception as e:
                    if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                        print("Column google_id already exists in PostgreSQL DB.")
                    else:
                        raise e
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
