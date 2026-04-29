from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from core.database import get_session
from core.models import User, AlumniProfile, AlumniNotification, ContactRequest
from services.auth import get_current_user, require_alumni, get_password_hash

router = APIRouter(prefix="/alumni", tags=["alumni"])


@router.post("/create-test-alumni")
def create_test_alumni(session: Session = Depends(get_session)):
    """Debug endpoint to create test alumni user"""
    existing = session.exec(select(User).where(User.username == "alumni")).first()
    if existing:
        existing.role = "alumni"
        if not existing.hashed_password:
            existing.hashed_password = get_password_hash("alumni123")
        session.add(existing)
        session.commit()
        return {"message": "Alumni user updated"}
    
    alumni = User(
        username="alumni",
        email="alumni@minicode.ai",
        full_name="Test Alumni",
        hashed_password=get_password_hash("alumni123"),
        role="alumni",
        xp=0,
        unlocked_level=99
    )
    session.add(alumni)
    session.commit()
    return {"message": "Alumni user created"}


class AlumniProfileUpdate(BaseModel):
    headline: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    bio: Optional[str] = None
    graduation_year: Optional[int] = None
    degree: Optional[str] = None
    skills: Optional[str] = None
    projects: Optional[str] = None
    employment_history: Optional[str] = None
    is_available_for_mentoring: bool = None
    is_available_for_job_referrals: bool = None


class AlumniNotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    related_url: Optional[str] = None


class ContactRequestCreate(BaseModel):
    recipient_id: int
    message: str


class ContactRequestResponse(BaseModel):
    accept: bool
    response_message: Optional[str] = None


class ContactRequestReply(BaseModel):
    message: str


@router.get("/profile/me")
def get_my_profile(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user.role not in ["alumni", "faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only alumni can view profiles")
    
    profile = session.exec(
        select(AlumniProfile).where(AlumniProfile.user_id == user.id)
    ).first()
    
    if not profile:
        return {"exists": False}
    
    result = profile.model_dump()
    result["username"] = user.username
    result["full_name"] = user.full_name
    return result


@router.put("/profile/me")
def update_my_profile(
    profile_data: AlumniProfileUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user.role not in ["alumni", "faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Only alumni can update profiles")
    
    profile = session.exec(
        select(AlumniProfile).where(AlumniProfile.user_id == user.id)
    ).first()
    
    if not profile:
        profile = AlumniProfile(user_id=user.id)
        session.add(profile)
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)
    
    profile.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(profile)
    
    return {"message": "Profile updated successfully"}


@router.get("/profiles")
def list_alumni_profiles(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Students, faculty, admin, and alumni can all view alumni profiles
    if user.role not in ["student", "faculty", "admin", "alumni"]:
        raise HTTPException(status_code=403, detail="Not authorized to view alumni")
    
    # Exclude own profile from the list
    profiles = session.exec(
        select(AlumniProfile)
        .join(User, AlumniProfile.user_id == User.id)
        .where(User.role.in_(["alumni", "faculty", "admin"]))
        .where(AlumniProfile.user_id != user.id)
    ).all()
    
    results = []
    for p in profiles:
        p_dict = p.model_dump()
        p_dict["user_id"] = p.user_id
        u = session.exec(select(User).where(User.id == p.user_id)).first()
        if u:
            p_dict["username"] = u.username
            p_dict["full_name"] = u.full_name
        results.append(p_dict)
    
    return results


@router.get("/students")
def list_students(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Only alumni/faculty/admin can view students
    if user.role not in ["alumni", "faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    students = session.exec(
        select(User).where(User.role == "student")
    ).all()
    
    results = []
    for s in students:
        results.append({
            "id": s.id,
            "username": s.username,
            "full_name": s.full_name,
            "email": s.email,
            "xp": s.xp,
            "current_level": s.current_level,
            "unlocked_level": s.unlocked_level,
        })
    
    return results


@router.get("/profiles/{alumni_id}")
def get_alumni_profile(
    alumni_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    alumnus = session.exec(select(User).where(User.id == alumni_id)).first()
    if not alumnus or alumnus.role not in ["alumni", "faculty", "admin"]:
        raise HTTPException(status_code=404, detail="Alumni not found")
    
    profile = session.exec(
        select(AlumniProfile).where(AlumniProfile.user_id == alumni_id)
    ).first()
    
    if not profile:
        return {"exists": False}
    
    result = profile.model_dump()
    result["exists"] = True
    result["user_id"] = alumni_id
    result["username"] = alumnus.username
    result["full_name"] = alumnus.full_name
    return result


@router.post("/notifications")
def create_notification(
    notif_data: AlumniNotificationCreate,
    user: User = Depends(require_alumni),
    session: Session = Depends(get_session)
):
    notification = AlumniNotification(
        alumni_id=user.id,
        title=notif_data.title,
        message=notif_data.message,
        notification_type=notif_data.notification_type,
        related_url=notif_data.related_url
    )
    session.add(notification)
    session.commit()
    
    return {"message": "Notification created", "id": notification.id}


@router.get("/notifications")
def list_notifications(
    user: User = Depends(require_alumni),
    session: Session = Depends(get_session)
):
    notifications = session.exec(
        select(AlumniNotification)
        .where(AlumniNotification.alumni_id == user.id)
        .order_by(AlumniNotification.created_at.desc())
    ).all()
    
    return [n.model_dump() for n in notifications]


@router.get("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    user: User = Depends(require_alumni),
    session: Session = Depends(get_session)
):
    notif = session.exec(
        select(AlumniNotification)
        .where(AlumniNotification.id == notif_id)
        .where(AlumniNotification.alumni_id == user.id)
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    session.add(notif)
    session.commit()
    
    return {"message": "Marked as read"}


# Contact Request Endpoints

@router.post("/contact-request")
def create_contact_request(
    req_data: ContactRequestCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    recipient = session.exec(
        select(User).where(User.id == req_data.recipient_id)
    ).first()
    
    if not recipient or recipient.role not in ["alumni", "faculty"]:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Check if already exists pending request
    existing = session.exec(
        select(ContactRequest).where(
            ContactRequest.requester_id == user.id,
            ContactRequest.recipient_id == req_data.recipient_id,
            ContactRequest.status == "pending"
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Request already pending")
    
    # Check 24-hour limit - only 1 request per alumni per 24 hours
    recent_request = session.exec(
        select(ContactRequest).where(
            ContactRequest.requester_id == user.id,
            ContactRequest.recipient_id == req_data.recipient_id
        ).where(ContactRequest.requested_at >= datetime.now(timezone.utc) - timedelta(hours=24))
    ).first()
    
    if recent_request:
        raise HTTPException(status_code=400, detail="You can only send 1 request per alumni every 24 hours")
    
    contact_req = ContactRequest(
        requester_id=user.id,
        recipient_id=req_data.recipient_id,
        message=req_data.message
    )
    session.add(contact_req)
    session.commit()
    
    return {"message": "Contact request sent", "id": contact_req.id}


@router.get("/contact-requests")
def list_contact_requests(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get requests where user is the recipient (for alumni/faculty)
    received = session.exec(
        select(ContactRequest)
        .where(ContactRequest.recipient_id == user.id)
        .order_by(ContactRequest.requested_at.desc())
    ).all()
    
    # Get requests where user is the requester (for students)
    sent = session.exec(
        select(ContactRequest)
        .where(ContactRequest.requester_id == user.id)
        .order_by(ContactRequest.requested_at.desc())
    ).all()
    
    def enrich_request(req):
        r = req.model_dump()
        requester = session.exec(select(User).where(User.id == req.requester_id)).first()
        recipient = session.exec(select(User).where(User.id == req.recipient_id)).first()
        if requester:
            r["requester_name"] = requester.full_name or requester.username
            r["requester_username"] = requester.username
            r["requester_email"] = requester.email
            r["requester_xp"] = requester.xp
            r["requester_level"] = requester.current_level
        if recipient:
            r["recipient_name"] = recipient.full_name or recipient.username
        return r
    
    return {
        "received": [enrich_request(r) for r in received],
        "sent": [enrich_request(s) for s in sent]
    }


@router.post("/contact-request/{request_id}/respond")
def respond_contact_request(
    request_id: int,
    response: ContactRequestResponse,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    contact_req = session.exec(
        select(ContactRequest).where(ContactRequest.id == request_id)
    ).first()
    
    if not contact_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if contact_req.recipient_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if contact_req.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    contact_req.status = "accepted" if response.accept else "rejected"
    contact_req.responded_at = datetime.now(timezone.utc)
    if response.response_message:
        contact_req.response_message = response.response_message
    session.add(contact_req)
    session.commit()
    
    return {"message": f"Request {contact_req.status}"}


@router.post("/contact-request/{request_id}/reply")
def reply_to_request(
    request_id: int,
    reply: ContactRequestReply,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    contact_req = session.exec(
        select(ContactRequest).where(ContactRequest.id == request_id)
    ).first()
    
    if not contact_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if contact_req.recipient_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if contact_req.status != "accepted":
        raise HTTPException(status_code=400, detail="Can only reply to accepted requests")
    
    if not reply.message:
        raise HTTPException(status_code=400, detail="Message required")
    
    contact_req.response_message = reply.message
    session.add(contact_req)
    session.commit()
    
    return {"message": "Reply sent"}


@router.post("/contact-request/{request_id}/complete")
def complete_contact_session(
    request_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    contact_req = session.exec(
        select(ContactRequest).where(ContactRequest.id == request_id)
    ).first()
    
    if not contact_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if contact_req.recipient_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if contact_req.status != "accepted":
        raise HTTPException(status_code=400, detail="Request not accepted")
    
    contact_req.status = "completed"
    contact_req.responded_at = datetime.now(timezone.utc)
    session.add(contact_req)
    session.commit()
    
    return {"message": "Session marked as completed"}