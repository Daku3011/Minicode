import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from core.models import Problem
from services.auth import get_current_user, require_faculty

def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_problems_empty(client: TestClient):
    response = client.get("/problems")
    assert response.status_code == 200
    assert response.json() == []

def test_create_problem(client: TestClient, session: Session, test_faculty):
    # Mock authentication
    from main import app
    app.dependency_overrides[require_faculty] = lambda: test_faculty
    
    payload = {
        "title": "Two Sum",
        "description": "Given an array of integers <script>alert('xss')</script>...",
        "difficulty": "Easy",
        "input_format": "List of Ints",
        "output_format": "List of Ints"
    }
    
    response = client.post("/problems", json=payload)
    app.dependency_overrides.clear()
    
    print("RESPONSE STATUS:", response.status_code)
    print("RESPONSE JSON:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Two Sum"
    # Ensure Bleach sanitizes input
    assert "<script>" not in data["description"]
    assert data["author_id"] == test_faculty.id

def test_get_problem(client: TestClient, session: Session, test_faculty):
    problem = Problem(
        title="Valid Palindrome",
        description="Verify palindrome string",
        difficulty="Easy",
        author_id=test_faculty.id
    )
    session.add(problem)
    session.commit()
    
    response = client.get(f"/problems/{problem.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Valid Palindrome"

def test_rate_limiter(client: TestClient):
    # Trigger login multiple times to hit rate limit
    for _ in range(6):
        response = client.post("/auth/login", data={"username": "test", "password": "password"})
    
    # 6th request should be rate limited (5/min allowed)
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.text

def test_security_headers(client: TestClient):
    response = client.get("/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"

def test_invalid_language_submission(client: TestClient, session: Session, test_user, test_faculty):
    from main import app
    app.dependency_overrides[get_current_user] = lambda: test_user
    
    problem = Problem(
        title="Test Problem",
        description="Test",
        difficulty="Easy",
        author_id=test_faculty.id
    )
    session.add(problem)
    session.commit()
    
    payload = {
        "language": "rubyyy"  # Invalid language
    }
    
    response = client.post(f"/problems/{problem.id}/submit", json=payload)
    app.dependency_overrides.clear()
    
    assert response.status_code == 422
    assert "Language must be one of" in str(response.json())
