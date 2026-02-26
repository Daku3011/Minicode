import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from typing import List, Optional
from dotenv import load_dotenv
import httpx

load_dotenv()

from models import User, Problem, Submission, TestCase
from auth import get_current_user, create_access_token, get_github_user_info, get_session, require_admin, require_faculty
from repo_manager import create_student_repo
from judge import judge_submission

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/minicode")

# Connection pooling for high-traffic production use
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,           # Max persistent connections
        max_overflow=10,        # Extra connections under load
        pool_pre_ping=True,     # Verify connections before use
        pool_recycle=300,       # Recycle connections every 5 min
    )

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__" and os.getenv("CREATE_TABLES"):
    create_db_and_tables()
    print("Tables created successfully")
    exit(0)

def get_session():
    with Session(engine) as session:
        yield session

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Database tables are created via preDeployCommand (Render)
    # or manually to avoid race conditions between Gunicorn workers.
    yield
    # Shutdown logic (if any)

app = FastAPI(title="MiniCode API", lifespan=lifespan)

# CORS: Read allowed origins from env (comma-separated), default "*" for dev
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_origins_str.split(",")] if cors_origins_str != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MiniCode API"}

@app.get("/health")
def health_check():
    """Health check endpoint for load balancers and Render."""
    return {"status": "healthy"}

# Problem Endpoints
@app.get("/problems", response_model=List[Problem])
def get_problems(session: Session = Depends(get_session)):
    return session.exec(select(Problem)).all()

@app.get("/problems/{problem_id}")
def get_problem(problem_id: int, session: Session = Depends(get_session)):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@app.get("/problems/{problem_id}/testcases")
def get_problem_testcases(problem_id: int, session: Session = Depends(get_session)):
    """Return sample test cases for display on the problem page."""
    test_cases = session.exec(select(TestCase).where(TestCase.problem_id == problem_id)).all()
    # Only return sample test cases to students (is_sample=True)
    samples = [tc for tc in test_cases if tc.is_sample]
    # If no samples marked, return all (for problems without is_sample distinction)
    if not samples:
        samples = test_cases
    return [{"id": tc.id, "input": tc.input_data, "expected_output": tc.expected_output} for tc in samples]

@app.post("/problems", response_model=Problem)
def create_problem(
    problem: Problem, 
    user: User = Depends(require_faculty), 
    session: Session = Depends(get_session)
):
    problem.author_id = user.id
    session.add(problem)
    session.commit()
    session.refresh(problem)
    return problem

# Auth Endpoints
@app.get("/auth/github/callback")
async def github_callback(code: str, redirect_uri: Optional[str] = None, session: Session = Depends(get_session)):
    # Exchange code for token
    params = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code": code
    }
    if redirect_uri:
        params["redirect_uri"] = redirect_uri

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            params=params,
            headers={"Accept": "application/json"}
        )
        token_data = response.json()
        access_token = token_data.get("access_token")
    
    if not access_token:
        error_desc = token_data.get("error_description", token_data.get("error", "Unknown error"))
        print(f"GitHub OAuth error: {token_data}")
        raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {error_desc}")
    
    # Get user info
    github_user = await get_github_user_info(access_token)
    
    # Create or update user
    statement = select(User).where(User.github_id == github_user["id"])
    user = session.exec(statement).first()
    
    if not user:
        user = User(
            username=github_user["login"],
            email=github_user.get("email") or f"{github_user['login']}@github.com",
            full_name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            github_id=github_user["id"],
            github_access_token=access_token
        )
        session.add(user)
    else:
        user.github_access_token = access_token
    
    session.commit()
    session.refresh(user)
    
    # Create JWT
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordRequestForm
from auth import verify_password

@app.post("/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    # Username mapped to username field 
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

from pydantic import BaseModel

class SubmissionRequest(BaseModel):
    language: str

# Problem Interaction
@app.post("/problems/{problem_id}/start")
async def start_problem(
    problem_id: int, 
    user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    repo_url = create_student_repo(user, problem, session)
    return {"repo_url": repo_url}

@app.post("/problems/{problem_id}/submit")
async def submit_problem(
    problem_id: int,
    request: SubmissionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    repo_name = f"minicode-{user.username}-{problem.title.lower().replace(' ', '-')}"
    repo_url = f"https://github.com/{user.username}/{repo_name}"
    
    submission = Submission(
        user_id=user.id,
        problem_id=problem.id,
        repo_url=repo_url,
        language=request.language,
        status="pending"
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)
    
    # Trigger judging
    test_cases = session.exec(select(TestCase).where(TestCase.problem_id == problem.id)).all()
    try:
        await judge_submission(submission, user, problem, test_cases, session)
    except Exception as e:
        print(f"Judge error: {e}")
        submission.status = "error"
        submission.ai_feedback = f"Judge failed: {str(e)}"
        session.add(submission)
        session.commit()
    
    # Refresh to get updated fields from the judge
    session.refresh(submission)
    
    return {
        "id": submission.id,
        "status": submission.status,
        "score": submission.score,
        "ai_feedback": submission.ai_feedback,
        "judge_output": submission.judge_output,
        "code_content": submission.code_content,
        "repo_url": submission.repo_url,
    }

# Leaderboard Endpoint
@app.get("/leaderboard")
def get_leaderboard(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    leaderboard = []
    for user in users:
        # Calculate distinct problem accepted scores
        submissions = session.exec(select(Submission).where(Submission.user_id == user.id, Submission.status == "accepted")).all()
        # Get max score per problem
        problem_scores = {}
        for sub in submissions:
            if sub.problem_id not in problem_scores or sub.score > problem_scores[sub.problem_id]:
                problem_scores[sub.problem_id] = sub.score
        
        total_score = sum(problem_scores.values())
        problems_solved = len(problem_scores)
        
        if total_score > 0:
            leaderboard.append({
                "id": user.id,
                "name": user.full_name or user.username,
                "username": user.username,
                "score": total_score,
                "problems": problems_solved,
                "avatar": user.avatar_url
            })
            
    # Sort by score descending
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    
    # Assign ranks
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return leaderboard

# Faculty Analytics
@app.get("/faculty/problems", response_model=List[Problem])
def get_faculty_problems(user: User = Depends(require_faculty), session: Session = Depends(get_session)):
    return session.exec(select(Problem).where(Problem.author_id == user.id)).all()

@app.get("/faculty/analytics/{problem_id}")
def get_problem_analytics(
    problem_id: int, 
    user: User = Depends(require_faculty), 
    session: Session = Depends(get_session)
):
    problem = session.get(Problem, problem_id)
    if not problem or (user.role != "admin" and problem.author_id != user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    submissions = session.exec(select(Submission).where(Submission.problem_id == problem_id)).all()
    
    return {
        "problem_title": problem.title,
        "total_submissions": len(submissions),
        "accepted_count": len([s for s in submissions if s.status == "accepted"]),
        "average_score": sum(s.score for s in submissions) / len(submissions) if submissions else 0
    }

# Admin User Management
@app.get("/admin/users")
def get_all_users(admin: User = Depends(require_admin), session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else ""
    } for u in users]

@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int, 
    role: str, 
    admin: User = Depends(require_admin), 
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    session.add(user)
    session.commit()
    return {"message": f"User {user.username} updated to {role}"}

# Auth & User endpoints (to be implemented in auth.py)
@app.get("/auth/me")
def get_me(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Calculate stats for profile
    submissions = session.exec(select(Submission).where(Submission.user_id == user.id)).all()
    accepted_subs = [s for s in submissions if s.status == "accepted"]
    
    problem_scores = {}
    for sub in accepted_subs:
        if sub.problem_id not in problem_scores or sub.score > problem_scores[sub.problem_id]:
            problem_scores[sub.problem_id] = sub.score
            
    total_score = sum(problem_scores.values())
    problems_solved = len(problem_scores)
    
    recent_submissions = []
    for sub in sorted(submissions, key=lambda x: x.timestamp, reverse=True)[:5]:
        prob = session.get(Problem, sub.problem_id)
        recent_submissions.append({
            "id": sub.id,
            "problem": prob.title if prob else f"Problem {sub.problem_id}",
            "status": sub.status,
            "time": sub.timestamp.strftime("%Y-%m-%d %H:%M") if sub.timestamp else ""
        })
        
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "github_id": user.github_id,
        "created_at": user.created_at.strftime("%Y-%m-%d") if user.created_at else "",
        "stats": {
            "solved": problems_solved,
            "rank": 0, # Will be calculated by leaderboard in real app, mocked for now or could do a query
            "xp": total_score,
            "streak": 1 # Mocked streak
        },
        "recentSubmissions": recent_submissions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
