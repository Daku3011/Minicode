import os
import re
import logging
from urllib.parse import quote, unquote
from sqlmodel import Session, create_engine
from dotenv import load_dotenv

load_dotenv()

# Configure logging for the database module
logger = logging.getLogger("database")

def sanitize_database_url(url: str) -> str:
    """
    Cleans and re-encodes the database URL to handle common issues:
    1. 'postgres://' vs 'postgresql://' prefixes
    2. Passwords containing special characters like '@'
    3. Ensuring the +psycopg2 driver is explicitly used where needed
    """
    if not url:
        return url

    # 1. Standardize the prefix to postgresql
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # 2. Standardize to postgresql+psycopg2 for SQLAlchemy compatibility on some hosts
    if url.startswith("postgresql://") and "+psycopg2" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # 3. Robustly handle passwords with special characters like '@' using rsplit
    try:
        if "@" in url:
            # Format: [protocol]://[userinfo]@[hostinfo]
            protocol_part, rest = url.split("://", 1)
            
            # Find the LAST '@' which separates the userinfo (potentially containing '@') from the host
            # url: postgresql+psycopg2://user:pass@word@aws-host:5432/db
            # rsplit('@', 1) gives ["user:pass@word", "aws-host:5432/db"]
            userinfo, hostinfo = rest.rsplit("@", 1)
            
            # Split userinfo into user and password
            if ":" in userinfo:
                user, password = userinfo.split(":", 1)
                
                # We unquote first to avoid double-encoding (if it was partially encoded already)
                # then quote everything to ensure it's SQL-safe
                sanitized_password = quote(unquote(password), safe="")
                
                new_url = f"{protocol_part}://{user}:{sanitized_password}@{hostinfo}"
                return new_url
    except Exception as e:
        logger.warning(f"Failed to sanitize DATABASE_URL: {e}")
        pass

    return url

# Initialize the global engine
DATABASE_URL = sanitize_database_url(
    os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/minicode")
)

# Connection pooling for high-traffic production use
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    engine = create_engine(
        DATABASE_URL,
        # Keep totals modest for managed Postgres connection limits (e.g.
        # Supabase): total processes × (pool + overflow) must stay under
        # the plan cap. Choose direct/session/transaction mode according
        # to network reachability and session requirements; see the review.
        pool_size=int(os.getenv("DB_POOL_SIZE", "2")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "1")),
        pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "15")),
        connect_args={"connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", "10"))},
        pool_pre_ping=True,   # Verify connection is up before giving it to user
        pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "300")),  # Recycle connections to avoid stale pools
    )

def get_session():
    """Dependency for providing a fresh database session."""
    with Session(engine) as session:
        yield session
