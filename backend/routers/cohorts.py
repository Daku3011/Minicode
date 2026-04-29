from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timezone

from core.database import get_session
from core.models import User, Cohort, UserCohortLink, CohortJoinRequest
from services.auth import require_faculty, get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/cohorts", tags=["cohorts"])

class CohortCreate(BaseModel):
    name: str
    description: Optional[str] = None
    notes: Optional[str] = None

class CohortUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

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
        notes=cohort_data.notes,
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

    # Also get pending requests for this user
    pending_requests = session.exec(
        select(CohortJoinRequest)
        .where(CohortJoinRequest.user_id == user.id)
        .where(CohortJoinRequest.status == "pending")
    ).all()

    results = []
    for c in cohorts:
        c_dict = c.model_dump()
        c_dict["faculty_name"] = c.faculty.full_name or c.faculty.username if c.faculty else "Unknown"
        results.append(c_dict)

    # Add pending requests info
    pending_cohort_ids = [req.cohort_id for req in pending_requests]

    return {"enrolled": results, "pending_requests": pending_cohort_ids}

@router.post("/join")
def join_cohort(
    req: JoinCohortReq,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, req.cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Invalid Cohort ID (Invite Code)")

    # Check if already an approved member
    existing_link = session.exec(select(UserCohortLink).where(
        UserCohortLink.user_id == user.id,
        UserCohortLink.cohort_id == req.cohort_id
    )).first()

    if existing_link:
        return {"message": "Already enrolled in this cohort", "cohort": {"id": cohort.id, "name": cohort.name}}

    # Check if there's already a pending request
    existing_request = session.exec(select(CohortJoinRequest).where(
        CohortJoinRequest.user_id == user.id,
        CohortJoinRequest.cohort_id == req.cohort_id,
        CohortJoinRequest.status == "pending"
    )).first()

    if existing_request:
        return {"message": "Join request already pending approval", "status": "pending"}

    # Create a new join request
    new_request = CohortJoinRequest(
        cohort_id=req.cohort_id,
        user_id=user.id,
        status="pending"
    )
    session.add(new_request)
    session.commit()
    return {"message": "Join request submitted. Waiting for faculty approval.", "status": "pending"}

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

class JoinRequestAction(BaseModel):
    faculty_note: Optional[str] = None

@router.get("/{cohort_id}/requests")
def get_join_requests(
    cohort_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    requests = session.exec(
        select(CohortJoinRequest)
        .where(CohortJoinRequest.cohort_id == cohort_id)
        .where(CohortJoinRequest.status == "pending")
    ).all()

    result = []
    for req in requests:
        req_dict = req.model_dump()
        req_dict["student_username"] = req.user.username if req.user else "Unknown"
        req_dict["student_full_name"] = req.user.full_name if req.user else "Unknown"
        result.append(req_dict)

    return result


@router.post("/{cohort_id}/requests/{request_id}/approve")
def approve_join_request(
    cohort_id: int,
    request_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    join_request = session.get(CohortJoinRequest, request_id)
    if not join_request or join_request.cohort_id != cohort_id:
        raise HTTPException(status_code=404, detail="Join request not found")

    if join_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    # Create the cohort link
    new_link = UserCohortLink(user_id=join_request.user_id, cohort_id=cohort_id)
    session.add(new_link)

    # Update request status
    join_request.status = "approved"
    join_request.responded_at = datetime.now(timezone.utc)
    session.add(join_request)
    session.commit()

    return {"message": "Student approved and added to cohort"}


@router.post("/{cohort_id}/requests/{request_id}/reject")
def reject_join_request(
    cohort_id: int,
    request_id: int,
    action: JoinRequestAction = JoinRequestAction(),
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    join_request = session.get(CohortJoinRequest, request_id)
    if not join_request or join_request.cohort_id != cohort_id:
        raise HTTPException(status_code=404, detail="Join request not found")

    if join_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    # Update request status
    join_request.status = "rejected"
    join_request.responded_at = datetime.now(timezone.utc)
    join_request.faculty_note = action.faculty_note
    session.add(join_request)
    session.commit()

    return {"message": "Join request rejected"}


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
    from core.models import Lab, LabProblemLink
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

@router.patch("/{cohort_id}")
def update_cohort(
    cohort_id: int,
    data: CohortUpdate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session)
):
    cohort = session.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if user.role != "admin" and cohort.faculty_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if data.name is not None:
        cohort.name = data.name
    if data.description is not None:
        cohort.description = data.description
    if data.notes is not None:
        cohort.notes = data.notes
        
    session.add(cohort)
    session.commit()
    session.refresh(cohort)
    return cohort
