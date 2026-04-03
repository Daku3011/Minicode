from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from models import User, Notification, NewsItem
from auth import get_current_user, get_session

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"
    related_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


@router.get("")
def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        statement = statement.where(Notification.is_read == False)
    statement = statement.order_by(Notification.created_at.desc()).limit(limit)
    notifications = session.exec(statement).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "related_url": n.related_url,
            "created_at": n.created_at.isoformat(),
            "expires_at": n.expires_at.isoformat() if n.expires_at else None,
        }
        for n in notifications
    ]


@router.post("")
def create_notification(
    notification_data: NotificationCreate,
    user_id: Optional[int] = None,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    target_user_id = user_id or user.id
    # Only allow users to create notifications for themselves unless they're faculty/admin
    if user_id and user_id != user.id and user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    notification = Notification(
        user_id=target_user_id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type,
        related_url=notification_data.related_url,
        expires_at=notification_data.expires_at,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return {"id": notification.id, "message": "Notification created"}


@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    notification_data: NotificationUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = notification_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(notification, key, value)
    session.add(notification)
    session.commit()
    return {"message": "Notification updated"}


@router.get("/unread-count")
def get_unread_count(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # 1. Count personal unread notifications
    notif_statement = select(Notification).where(
        Notification.user_id == user.id, Notification.is_read == False
    )
    personal_unread = len(session.exec(notif_statement).all())

    # 2. Count active news created after last_news_viewed_at
    news_statement = select(NewsItem).where(NewsItem.is_active == True)
    if user.last_news_viewed_at:
        news_statement = news_statement.where(NewsItem.created_at > user.last_news_viewed_at)
    
    # Also ignore news created by the user themselves if they are faculty
    if user.role != "student":
        news_statement = news_statement.where(NewsItem.created_by != user.id)
        
    unread_news = len(session.exec(news_statement).all())

    return {"unread_count": personal_unread + unread_news}


@router.post("/mark-news-read")
def mark_news_as_read(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    user.last_news_viewed_at = datetime.utcnow()
    session.add(user)
    session.commit()
    return {"message": "News marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(notification)
    session.commit()
    return {"message": "Notification deleted"}


@router.post("/mark-all-read")
def mark_all_as_read(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Notification).where(
        Notification.user_id == user.id, Notification.is_read == False
    )
    notifications = session.exec(statement).all()
    for notification in notifications:
        notification.is_read = True
        session.add(notification)
    session.commit()
    return {"message": f"Marked {len(notifications)} notifications as read"}
