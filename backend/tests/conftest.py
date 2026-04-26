import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from main import app
from core.database import get_session
from core.models import User, Problem

# Use SQLite for testing
sqlite_url = "sqlite://"

engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

@pytest.fixture(autouse=True)
def init_cache():
    FastAPICache.init(InMemoryBackend())

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        role="student"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="test_faculty")
def test_faculty_fixture(session: Session):
    user = User(
        username="faculty",
        email="faculty@example.com",
        full_name="Faculty User",
        role="faculty"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
