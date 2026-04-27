from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlmodel import Session, select
from typing import List, Optional
import bleach
import logging
from fastapi_cache.decorator import cache
from pydantic import BaseModel
from core.database import get_session
from core.models import User, Problem, TestCase, NewsItem, LabProblemLink
from services.auth import require_faculty, get_current_user
from services.ai_generator import generate_problem_content, extract_text_from_file, improve_problem_content

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=List[Problem])
def get_problems(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user.role in ["admin", "faculty"]:
        return session.exec(select(Problem).where(Problem.is_deleted == False)).all()
    
    public_problems = session.exec(select(Problem).where(Problem.visibility == "public", Problem.is_deleted == False)).all()
    
    private_problems = []
    if user.cohorts:
        student_lab_ids = []
        for cohort in user.cohorts:
            for lab in cohort.labs:
                student_lab_ids.append(lab.id)
        
        if student_lab_ids:
            private_problems = session.exec(
                select(Problem)
                .join(LabProblemLink)
                .where(Problem.visibility == "private", Problem.is_deleted == False)
                .where(LabProblemLink.lab_id.in_(student_lab_ids))
            ).all()
            
    all_problems = {p.id: p for p in public_problems + private_problems}.values()
    return list(all_problems)


@router.get("/{problem_id}")
def get_problem(
    problem_id: int, 
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    problem = session.get(Problem, problem_id)
    if not problem or problem.is_deleted:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    if problem.visibility == "private" and user.role not in ["admin", "faculty"]:
        has_access = False
        for cohort in user.cohorts:
            for lab in cohort.labs:
                link = session.exec(select(LabProblemLink).where(
                    LabProblemLink.lab_id == lab.id,
                    LabProblemLink.problem_id == problem_id
                )).first()
                if link:
                    has_access = True
                    break
            if has_access:
                break
        if not has_access:
            raise HTTPException(status_code=403, detail="Not authorized to view this private problem")
            
    return problem


@router.get("/{problem_id}/testcases")
def get_problem_testcases(problem_id: int, session: Session = Depends(get_session)):
    """Return sample test cases for display on the problem page."""
    test_cases = session.exec(
        select(TestCase).where(TestCase.problem_id == problem_id)
    ).all()
    # Only return sample test cases to students (is_sample=True)
    samples = [tc for tc in test_cases if tc.is_sample]
    # If no samples marked, return all (for problems without is_sample distinction)
    if not samples:
        samples = test_cases
    return [
        {"id": tc.id, "input": tc.input_data, "expected_output": tc.expected_output}
        for tc in samples
    ]


class TestCaseCreate(BaseModel):
    input_data: str
    expected_output: str
    is_sample: bool = False


class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str = "Easy"
    subject: Optional[str] = None
    level: int = 1
    xp_reward: int = 100
    visibility: str = "public"
    hints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None


@router.post("/{problem_id}/testcases")
def add_test_case(
    problem_id: int,
    test_case: TestCaseCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Add a test case to a problem (faculty/admin only)."""
    problem = session.get(Problem, problem_id)
    if not problem or problem.is_deleted:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Check ownership (admin can add to any)
    if user.role != "admin" and problem.author_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this problem"
        )

    db_test_case = TestCase(
        problem_id=problem_id,
        input_data=test_case.input_data,
        expected_output=test_case.expected_output,
        is_sample=test_case.is_sample,
    )
    session.add(db_test_case)
    session.commit()
    session.refresh(db_test_case)
    return db_test_case


@router.post("", response_model=Problem)
def create_problem(
    problem_data: ProblemCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    problem = Problem(
        title=problem_data.title,
        description=problem_data.description,
        difficulty=problem_data.difficulty,
        subject=problem_data.subject,
        level=problem_data.level,
        xp_reward=problem_data.xp_reward,
        visibility=problem_data.visibility,
        hints=problem_data.hints,
        input_format=problem_data.input_format,
        output_format=problem_data.output_format,
        constraints=problem_data.constraints,
    )

    # Input validation / sanitization
    problem.title = bleach.clean(problem.title)
    allowed_tags = list(bleach.sanitizer.ALLOWED_TAGS) + [
        "p",
        "h1",
        "h2",
        "h3",
        "strong",
        "em",
        "code",
        "pre",
        "ul",
        "li",
        "ol",
    ]
    problem.description = bleach.clean(problem.description, tags=allowed_tags)
    if problem.hints:
        problem.hints = bleach.clean(problem.hints, tags=allowed_tags)

    problem.author_id = user.id
    session.add(problem)
    session.commit()
    session.refresh(problem)

    try:
        news_item = NewsItem(
            title=f"New Problem: {problem.title}",
            content=f"A new {problem.difficulty} problem has been added to the arena.",
            news_type="problem",
            link=f"/problems/{problem.id}",
            priority=1,
            created_by=user.id,
        )
        session.add(news_item)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Warning: Failed to create news item for problem {problem.id}: {e}")

    session.refresh(problem)
    return problem


@router.put("/{problem_id}")
def update_problem(
    problem_id: int,
    update_data: dict,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Update a problem (faculty/admin only)."""
    problem = session.get(Problem, problem_id)
    if not problem or problem.is_deleted:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Check ownership (admin can edit any)
    if user.role != "admin" and problem.author_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this problem"
        )

    # Update fields
    if "title" in update_data:
        problem.title = bleach.clean(update_data["title"])
    if "description" in update_data:
        problem.description = bleach.clean(update_data["description"])
    if "difficulty" in update_data:
        problem.difficulty = update_data["difficulty"]
    if "subject" in update_data:
        problem.subject = update_data["subject"]
    if "level" in update_data:
        problem.level = update_data["level"]
    if "xp_reward" in update_data:
        problem.xp_reward = update_data["xp_reward"]
    if "visibility" in update_data:
        problem.visibility = update_data["visibility"]
    if "hints" in update_data:
        problem.hints = update_data["hints"]
    if "input_format" in update_data:
        problem.input_format = update_data["input_format"]
    if "output_format" in update_data:
        problem.output_format = update_data["output_format"]
    if "constraints" in update_data:
        problem.constraints = update_data["constraints"]

    session.add(problem)
    session.commit()
    session.refresh(problem)
    return problem


@router.delete("/{problem_id}")
def delete_problem(
    problem_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    """Delete a problem (faculty/admin only)."""
    problem = session.get(Problem, problem_id)
    if not problem or problem.is_deleted:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # Check ownership (admin can delete any)
    if user.role != "admin" and problem.author_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this problem"
        )

    problem.is_deleted = True
    session.add(problem)
    session.commit()
    return {"message": "Problem deleted successfully"}


@router.post("/generate-ai")
async def generate_ai_problem(
    file: UploadFile = File(...),
    user: User = Depends(require_faculty),
):
    """Generates a complete problem statement from an uploaded file using AI."""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        content = await file.read()
        text = extract_text_from_file(content, file.filename)

        if not text.strip():
            raise HTTPException(
                status_code=400, detail="Uploaded file is empty or unreadable"
            )

        problem_data = await generate_problem_content(text)
        return problem_data
    except Exception as e:
        logger.error(f"Failed to generate problem with AI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ProblemImproveRequest(BaseModel):
    title: str
    description: str
    difficulty: str
    subject: Optional[str] = None
    hints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None

@router.post("/improve-ai")
async def improve_ai_problem(
    request: ProblemImproveRequest,
    user: User = Depends(require_faculty),
):
    """Improves an existing problem statement using AI."""
    try:
        improved_data = await improve_problem_content(request.dict())
        return improved_data
    except Exception as e:
        logger.error(f"Failed to improve problem with AI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

