from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from core.database import get_session
from core.models import User, Cohort, Lab, LabProblemLink, Problem
from services.auth import require_faculty, get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/labs", tags=["labs"])

class LabCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ProblemAdd(BaseModel):
    problem_id: int

@router.post("/cohorts/{cohort_id}")
def create_lab(
    cohort_id: int,
    lab_data: LabCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
        
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_lab = Lab(
        name=lab_data.name,
        description=lab_data.description,
        cohort_id=cohort_id,
        start_time=lab_data.start_time,
        end_time=lab_data.end_time
    )
    session.add(new_lab)
    session.commit()
    session.refresh(new_lab)
    return new_lab

@router.get("/cohorts/{cohort_id}")
def list_labs_for_cohort(
    cohort_id: int,
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
        
    results = []
    for lb in cohort.labs:
        lb_dict = lb.model_dump()
        lb_dict["problem_count"] = len(lb.problems)
        results.append(lb_dict)
    return results

@router.get("/{lab_id}")
def get_lab_detail(
    lab_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    lab = session.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    cohort = session.get(Cohort, lab.cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
        
    from core.models import UserCohortLink
    is_member = any(link.user_id == user.id for link in session.exec(select(UserCohortLink).where(UserCohortLink.cohort_id == cohort.id)).all())
    is_faculty = cohort.faculty_id == user.id
    
    if user.role != "admin" and not is_faculty and not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
        
    res = lab.model_dump()
    res["problems"] = []
    for p in lab.problems:
        p_dict = p.model_dump()
        res["problems"].append(p_dict)
        
    return res

@router.post("/{lab_id}/problems")
def add_problem_to_lab(
    lab_id: int,
    problem_data: ProblemAdd,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    lab = session.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    cohort = session.get(Cohort, lab.cohort_id)
    if user.role != "admin" and getattr(cohort, "faculty_id", None) != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    problem = session.get(Problem, problem_data.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    link = session.exec(select(LabProblemLink).where(
        LabProblemLink.lab_id == lab_id, 
        LabProblemLink.problem_id == problem.id
    )).first()
    
    if link:
        return {"message": "Problem already in lab"}
        
    new_link = LabProblemLink(lab_id=lab_id, problem_id=problem.id)
    session.add(new_link)
    session.commit()
    return {"message": f"Added problem {problem.id} to lab."}


@router.delete("/{lab_id}/problems/{problem_id}")
def remove_problem_from_lab(
    lab_id: int,
    problem_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    lab = session.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    cohort = session.get(Cohort, lab.cohort_id)
    if user.role != "admin" and getattr(cohort, "faculty_id", None) != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    link = session.exec(select(LabProblemLink).where(
        LabProblemLink.lab_id == lab_id, 
        LabProblemLink.problem_id == problem_id
    )).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Problem not found in lab")
        
    session.delete(link)
    session.commit()
    return {"message": f"Removed problem from lab."}


@router.delete("/{lab_id}")
def delete_lab(
    lab_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    lab = session.get(Lab, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    cohort = session.get(Cohort, lab.cohort_id)
    if user.role != "admin" and getattr(cohort, "faculty_id", None) != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    links = session.exec(select(LabProblemLink).where(LabProblemLink.lab_id == lab_id)).all()
    for link in links:
        session.delete(link)
        
    session.delete(lab)
    session.commit()
    return {"message": "Lab permanently deleted."}

