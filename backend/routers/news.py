from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from core.models import User, NewsItem
from services.auth import require_faculty, get_session

router = APIRouter(prefix="/news", tags=["news"])


class NewsItemCreate(BaseModel):
    title: str
    content: str
    news_type: str = "announcement"
    link: Optional[str] = None
    priority: int = 0
    expires_at: Optional[datetime] = None


class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    link: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


@router.get("")
def get_news(
    news_type: Optional[str] = None,
    session: Session = Depends(get_session),
):
    statement = select(NewsItem).where(NewsItem.is_active == True)
    if news_type:
        statement = statement.where(NewsItem.news_type == news_type)
    statement = statement.order_by(NewsItem.priority.desc(), NewsItem.created_at.desc())
    items = session.exec(statement).all()
    return [
        {
            "id": item.id,
            "title": item.title,
            "content": item.content,
            "news_type": item.news_type,
            "link": item.link,
            "priority": item.priority,
            "created_at": item.created_at.isoformat(),
            "expires_at": item.expires_at.isoformat() if item.expires_at else None,
        }
        for item in items
    ]


@router.post("")
def create_news(
    news_data: NewsItemCreate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    item = NewsItem(
        title=news_data.title,
        content=news_data.content,
        news_type=news_data.news_type,
        link=news_data.link,
        priority=news_data.priority,
        expires_at=news_data.expires_at,
        created_by=user.id,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"id": item.id, "message": "News item created"}


@router.put("/{news_id}")
def update_news(
    news_id: int,
    news_data: NewsItemUpdate,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    item = session.get(NewsItem, news_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    if news_data.title is not None:
        item.title = news_data.title
    if news_data.content is not None:
        item.content = news_data.content
    if news_data.link is not None:
        item.link = news_data.link
    if news_data.priority is not None:
        item.priority = news_data.priority
    if news_data.is_active is not None:
        item.is_active = news_data.is_active
    if news_data.expires_at is not None:
        item.expires_at = news_data.expires_at
        
    session.add(item)
    session.commit()
    return {"message": "News item updated"}


@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    user: User = Depends(require_faculty),
    session: Session = Depends(get_session),
):
    item = session.get(NewsItem, news_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    session.delete(item)
    session.commit()
    return {"message": "News item deleted"}
