from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional

from database import get_session
from models import User, Cohort, UserCohortLink
from auth import require_faculty, get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/cohorts", tags=["cohorts"])

class CohortCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StudentAdd(BaseModel):
    username: str

@router.post("")
def create_cohort(
    cohort_data: CohortCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    new_cohort = Cohort(
        name=cohort_data.name,
        description=cohort_data.description,
        faculty_id=user.id
    )
    session.add(new_cohort)
    session.commit()
    session.refresh(new_cohort)
    return new_cohort

@router.get("")
def list_cohorts(
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    if user.role == "admin":
        cohorts = session.exec(select(Cohort)).all()
    else:
        cohorts = session.exec(select(Cohort).where(Cohort.faculty_id == user.id)).all()
    
    results = []
    for c in cohorts:
        c_dict = c.model_dump()
        c_dict["student_count"] = len(c.students)
        results.append(c_dict)
    return results
    
class JoinCohortReq(BaseModel):
    cohort_id: int

@router.get("/my")
def my_cohorts(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    cohorts = session.exec(
        select(Cohort)
        .join(UserCohortLink)
        .where(UserCohortLink.user_id == user.id)
        .where(Cohort.status == "active")
    ).all()

    results = []
    for c in cohorts:
        c_dict = c.model_dump()
        c_dict["faculty_name"] = c.faculty.full_name or c.faculty.username if c.faculty else "Unknown"
        results.append(c_dict)
    return results

@router.post("/join")
def join_cohort(
    req: JoinCohortReq,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, req.cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Invalid Cohort ID (Invite Code)")
        
    # Check if already joined
    existing_link = session.exec(select(UserCohortLink).where(
        UserCohortLink.user_id == user.id,
        UserCohortLink.cohort_id == req.cohort_id
    )).first()
    
    if existing_link:
        return {"message": "Already enrolled in this cohort", "cohort": {"id": cohort.id, "name": cohort.name}}
        
    new_link = UserCohortLink(user_id=user.id, cohort_id=cohort.id)
    session.add(new_link)
    session.commit()
    return {"message": "Successfully joined cohort", "cohort": {"id": cohort.id, "name": cohort.name}}

@router.get("/{cohort_id}")
def get_cohort_detail(
    cohort_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
        
    # Check authorization
    is_member = any(link.user_id == user.id for link in session.exec(select(UserCohortLink).where(UserCohortLink.cohort_id == cohort_id)).all())
    is_faculty = cohort.faculty_id == user.id
    
    if user.role != "admin" and not is_faculty and not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
        
    res = cohort.model_dump()
    res["faculty_name"] = cohort.faculty.full_name or cohort.faculty.username if cohort.faculty else "Unknown"
    res["student_count"] = len(cohort.students)
    res["students"] = [{"id": s.id, "username": s.username, "full_name": s.full_name} for s in cohort.students]
    
    # Add labs
    res["labs"] = [
        {
            "id": lab.id,
            "name": lab.name,
            "description": lab.description,
            "problem_count": len(lab.problems),
            "created_at": lab.created_at
        } for lab in cohort.labs
    ]
    
    return res

@router.post("/{cohort_id}/students")
def add_student_to_cohort(
    cohort_id: int,
    student_data: StudentAdd,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
        
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    student = session.exec(select(User).where(User.username == student_data.username)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    if student.role != "student":
        raise HTTPException(status_code=400, detail="User is not a student")
        
    link = session.exec(select(UserCohortLink).where(
        UserCohortLink.user_id == student.id, 
        UserCohortLink.cohort_id == cohort_id
    )).first()
    
    if link:
        return {"message": "Student already in cohort"}
        
    new_link = UserCohortLink(user_id=student.id, cohort_id=cohort_id)
    session.add(new_link)
    session.commit()
    return {"message": f"Added {student.username} to cohort."}

@router.delete("/{cohort_id}/students/{student_id}")
def remove_student_from_cohort(
    cohort_id: int,
    student_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    link = session.exec(select(UserCohortLink).where(
        UserCohortLink.user_id == student_id,
        UserCohortLink.cohort_id == cohort_id
    )).first()
    if not link:
        raise HTTPException(status_code=404, detail="Student not found in cohort")
        
    session.delete(link)
    session.commit()
    return {"message": "Student removed from cohort."}

@router.delete("/{cohort_id}")
def delete_cohort(
    cohort_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Delete links first
    links = session.exec(select(UserCohortLink).where(UserCohortLink.cohort_id == cohort_id)).all()
    for link in links:
        session.delete(link)
        
    # Later we might also delete associated labs, but we will delete them here
    from models import Lab, LabProblemLink
    labs = session.exec(select(Lab).where(Lab.cohort_id == cohort_id)).all()
    for lab in labs:
        # delete lab problem links
        lab_prob_links = session.exec(select(LabProblemLink).where(LabProblemLink.lab_id == lab.id)).all()
        for lpl in lab_prob_links:
            session.delete(lpl)
        session.delete(lab)
        
    session.delete(cohort)
    session.commit()
    return {"message": "Cohort permanently deleted."}

class CohortStatusUpdate(BaseModel):
    status: str

@router.patch("/{cohort_id}/status")
def update_cohort_status(
    cohort_id: int,
    data: CohortStatusUpdate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if data.status not in ["active", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    cohort.status = data.status
    session.add(cohort)
    session.commit()
    return {"message": f"Cohort status updated to {data.status}."}
