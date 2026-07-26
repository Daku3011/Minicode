import pytest
from services.auth import encrypt_token, decrypt_token
from core.models import User, Problem, Submission
from sqlmodel import Session, select

def test_token_encryption():
    token = "gho_test_token_12345"
    encrypted = encrypt_token(token)
    assert encrypted != token
    assert encrypted is not None
    
    decrypted = decrypt_token(encrypted)
    assert decrypted == token

def test_token_decryption_failure():
    assert decrypt_token("invalid_garbage") is None
    assert decrypt_token(None) is None

def test_leaderboard_logic(client, session: Session):
    # Setup users
    user1 = User(username="user1", email="u1@test.com", role="student", github_id=1, full_name="User One")
    user2 = User(username="user2", email="u2@test.com", role="student", github_id=2, full_name="User Two")
    session.add(user1)
    session.add(user2)
    session.commit()
    
    # Setup problems
    p1 = Problem(title="P1", description="D1", difficulty="Easy", author_id=1)
    p2 = Problem(title="P2", description="D2", difficulty="Easy", author_id=1)
    session.add(p1)
    session.add(p2)
    session.commit()
    
    # Setup submissions (multiple accepted for same problem, should take max)
    s1 = Submission(user_id=user1.id, problem_id=p1.id, status="accepted", score=80)
    s2 = Submission(user_id=user1.id, problem_id=p1.id, status="accepted", score=100)
    s3 = Submission(user_id=user1.id, problem_id=p2.id, status="accepted", score=50)
    
    s4 = Submission(user_id=user2.id, problem_id=p1.id, status="accepted", score=90)
    s5 = Submission(user_id=user2.id, problem_id=p2.id, status="wrong_answer", score=0)
    
    session.add_all([s1, s2, s3, s4, s5])
    session.commit()
    
    # Set XP values (leaderboard uses user.xp in global mode)
    user1.xp = 150
    user2.xp = 90
    session.add(user1)
    session.add(user2)
    session.commit()
    
    # Hit leaderboard
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    
    # Check User 1: max(80, 100) + 50 = 150
    # Check User 2: max(90) + 0 = 90
    
    items = data["items"]
    assert data["total_count"] == 2
    assert len(items) == 2
    assert items[0]["username"] == "user1"
    assert items[0]["score"] == 150
    assert items[0]["problems"] == 2
    
    assert items[1]["username"] == "user2"
    assert items[1]["score"] == 90
    assert items[1]["problems"] == 1
