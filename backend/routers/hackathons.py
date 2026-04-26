from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import os
import logging
import json
from google import genai
from google.genai import types
import anyio

from core.models import Hackathon, User
from services.auth import get_session, get_current_user
from services.hackathon_scraper import update_hackathons_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hackathons", tags=["hackathons"])

class ChatRequest(BaseModel):
    query: str

class HackathonResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    url: str
    platform: str
    status: str
    cover_image: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    registration_url: Optional[str]

@router.get("", response_model=List[HackathonResponse])
async def get_hackathons(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Get all hackathons from local cache, trigger update if expired or empty."""
    statement = select(Hackathon).order_by(Hackathon.start_date.desc())
    hackathons = session.exec(statement).all()
    
    # Check cache expiration (1 hour) or empty cache
    should_update = False
    if not hackathons:
        should_update = True
    else:
        # Check newest update time
        statement_newest = select(Hackathon).order_by(Hackathon.updated_at.desc())
        newest = session.exec(statement_newest).first()
        if newest and (datetime.now(timezone.utc) - newest.updated_at.replace(tzinfo=timezone.utc) > timedelta(hours=1)):
            should_update = True
            
    if should_update:
        logger.info("Hackathon cache stale or empty. Triggering background update.")
        background_tasks.add_task(update_hackathons_cache, session)
        
    # Return current state
    return hackathons

@router.post("/chat")
async def hackathon_ai_chat(
    chat_req: ChatRequest,
    user: Optional[User] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """AI Help Center chatbot for hackathon participation queries."""
    # Fetch all ongoing and upcoming hackathons to give context to Gemini
    statement = select(Hackathon).where(Hackathon.status != "ENDED")
    active_hackathons = session.exec(statement).all()
    
    context_data = []
    for h in active_hackathons:
        context_data.append({
            "title": h.title,
            "platform": h.platform,
            "status": h.status,
            "url": h.url,
            "start": h.start_date.isoformat() if h.start_date else "Unknown",
            "end": h.end_date.isoformat() if h.end_date else "Unknown",
            "description": h.description
        })
        
    context_str = json.dumps(context_data, indent=2)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI configuration missing (GEMINI_API_KEY).")
        
    prompt = f"""
    You are an AI Hackathon Assistant on the MiniCode platform. Your goal is to help technical students register, discover, and participate in hackathons successfully.
    
    Here is the list of current trending/upcoming hackathons aggregated from HackerEarth and Hack2Skill:
    {context_str}
    
    Guidelines:
    1. Answer the student's questions accurately based on the hackathon details provided.
    2. Provide step-by-step advice on how to register (by following the direct platform URLs).
    3. Be encouraging, helpful, and use professional Markdown for readability.
    4. If the student asks about preparation, recommend DSA and basic software development skills.
    
    Student Query: {chat_req.query}
    """
    
    try:
        client = genai.Client(api_key=api_key)
        response = await anyio.to_thread.run_sync(
            lambda: client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
        )
        return {"response": response.text.strip()}
    except Exception as e:
        logger.error(f"Gemini Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process AI request.")
