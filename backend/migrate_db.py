"""
Migration script to add missing columns to existing tables.
Run this once after updating models.py with the new columns.
"""

import sqlite3
import sys
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), "minicode.db")

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    sys.exit(0)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Running migration to add new columns...")

# Check and add columns to submission table
submission_columns_to_add = [
    ("updated_at", "TIMESTAMP"),
    ("deleted_at", "TIMESTAMP"),
]

for column_name, column_type in submission_columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE submission ADD COLUMN {column_name} {column_type}")
        print(f"  ✓ Added column '{column_name}' to 'submission' table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"  - Column '{column_name}' already exists in 'submission' table")
        else:
            print(f"  ✗ Error adding '{column_name}': {e}")

# Check and create event tables if they don't exist
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            event_type TEXT NOT NULL,
            difficulty TEXT,
            start_date TIMESTAMP NOT NULL,
            end_date TIMESTAMP,
            max_participants INTEGER,
            prize_description TEXT,
            rules TEXT,
            problem_ids TEXT,
            status TEXT DEFAULT 'draft',
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    """)
    print("  ✓ Created 'event' table")
except sqlite3.OperationalError as e:
    print(f"  - Event table: {e}")

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_participant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            team_name TEXT,
            team_members TEXT,
            status TEXT DEFAULT 'active',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES event(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("  ✓ Created 'event_participant' table")
except sqlite3.OperationalError as e:
    print(f"  - Event participant table: {e}")

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_submission (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            submission_id INTEGER,
            repo_url TEXT NOT NULL,
            submission_notes TEXT,
            score INTEGER DEFAULT 0,
            feedback TEXT,
            rank INTEGER,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES event(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("  ✓ Created 'event_submission' table")
except sqlite3.OperationalError as e:
    print(f"  - Event submission table: {e}")

# Create indexes
indexes_to_create = [
    ("idx_submission_user_id", "submission", "user_id"),
    ("idx_submission_problem_id", "submission", "problem_id"),
    ("idx_submission_status", "submission", "status"),
    ("idx_submission_timestamp", "submission", "timestamp"),
    ("idx_event_type", "event", "event_type"),
    ("idx_event_status", "event", "status"),
    ("idx_event_participant_event", "event_participant", "event_id"),
    ("idx_event_participant_user", "event_participant", "user_id"),
    ("idx_event_submission_event", "event_submission", "event_id"),
    ("idx_event_submission_user", "event_submission", "user_id"),
]

for index_name, table_name, column_name in indexes_to_create:
    try:
        cursor.execute(
            f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name}({column_name})"
        )
        print(f"  ✓ Created index '{index_name}'")
    except sqlite3.OperationalError as e:
        print(f"  - Index {index_name}: {e}")

conn.commit()
conn.close()

print("\nMigration completed successfully!")
