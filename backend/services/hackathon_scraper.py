import httpx
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlmodel import Session, select
from core.models import Hackathon

logger = logging.getLogger(__name__)

HACKEREARTH_URL = "https://www.hackerearth.com/chrome-extension/events/"
HACK2SKILL_URL = "https://hack2skill.com/api/v1/innovator/public/event/list?page=1&records=100"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

async def fetch_hackathons_from_hackerearth() -> List[Dict[str, Any]]:
    """Fetch events from HackerEarth API."""
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=30.0) as client:
            response = await client.get(HACKEREARTH_URL)
            if response.status_code != 200:
                logger.error(f"HackerEarth API failed with status {response.status_code}")
                return []
            
            data = response.json()
            items = data.get("response", []) if isinstance(data, dict) else data
            
            hackathons = []
            for item in items:
                # Parse dates
                start_date = None
                end_date = None
                if item.get("start_utc_tz"):
                    try:
                        start_date = datetime.fromisoformat(item.get("start_utc_tz").replace(" ", "T"))
                    except Exception:
                        pass
                if item.get("end_utc_tz"):
                    try:
                        end_date = datetime.fromisoformat(item.get("end_utc_tz").replace(" ", "T"))
                    except Exception:
                        pass
                
                # Determine status
                status = item.get("status", "UPCOMING").upper()
                if status not in ["ONGOING", "UPCOMING", "ENDED"]:
                    status = "UPCOMING"

                hackathons.append({
                    "title": item.get("title", "Untitled Hackathon"),
                    "description": item.get("description", ""),
                    "url": item.get("url"),
                    "platform": "hackerearth",
                    "status": status,
                    "cover_image": item.get("cover_image") or item.get("thumbnail"),
                    "start_date": start_date,
                    "end_date": end_date,
                    "registration_url": item.get("subscribe") or item.get("url")
                })
            return hackathons
    except Exception as e:
        logger.error(f"Error fetching from HackerEarth: {e}")
        return []

async def fetch_hackathons_from_hack2skill() -> List[Dict[str, Any]]:
    """Fetch events from Hack2Skill API."""
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=30.0) as client:
            response = await client.get(HACK2SKILL_URL)
            if response.status_code != 200:
                logger.error(f"Hack2Skill API failed with status {response.status_code}")
                return []
            
            data = response.json()
            events_data = data.get("data", {})
            
            # Collect events from flagship and community sections
            raw_events = []
            if isinstance(events_data, dict):
                raw_events.extend(events_data.get("flagshipEvents", []))
                raw_events.extend(events_data.get("communityEvents", []))
            
            hackathons = []
            now = datetime.now(timezone.utc)
            
            for item in raw_events:
                start_date = None
                end_date = None
                
                # Parse dates
                if item.get("registrationStart"):
                    try:
                        start_date = datetime.fromisoformat(item.get("registrationStart").replace("Z", "+00:00"))
                    except Exception:
                        pass
                if item.get("registrationEnd"):
                    try:
                        end_date = datetime.fromisoformat(item.get("registrationEnd").replace("Z", "+00:00"))
                    except Exception:
                        pass
                
                # Determine status based on dates
                status = "UPCOMING"
                if start_date and end_date:
                    if start_date <= now <= end_date:
                        status = "ONGOING"
                    elif now > end_date:
                        status = "ENDED"
                
                # Construct URL
                event_url = item.get("eventUrl")
                custom_url = item.get("customEventUrl")
                url = custom_url if custom_url else f"https://hack2skill.com/hack/{event_url}"
                
                hackathons.append({
                    "title": item.get("title", "Untitled Hackathon"),
                    "description": "Hackathon hosted on Hack2Skill.",
                    "url": url,
                    "platform": "hack2skill",
                    "status": status,
                    "cover_image": item.get("thumbnail"),
                    "start_date": start_date,
                    "end_date": end_date,
                    "registration_url": url
                })
            return hackathons
    except Exception as e:
        logger.error(f"Error fetching from Hack2Skill: {e}")
        return []

async def update_hackathons_cache(session: Session):
    """Update local DB cache of hackathons."""
    logger.info("Updating hackathons cache...")
    he_events = await fetch_hackathons_from_hackerearth()
    h2s_events = await fetch_hackathons_from_hack2skill()
    
    all_events = he_events + h2s_events
    
    if not all_events:
        logger.warning("No hackathons fetched. Skipping update.")
        return
    
    try:
        # Check existing events to avoid duplicates
        for event_data in all_events:
            statement = select(Hackathon).where(
                Hackathon.title == event_data["title"],
                Hackathon.platform == event_data["platform"]
            )
            existing = session.exec(statement).first()
            
            if existing:
                # Update existing record
                existing.description = event_data["description"]
                existing.url = event_data["url"]
                existing.status = event_data["status"]
                existing.cover_image = event_data["cover_image"]
                existing.start_date = event_data["start_date"]
                existing.end_date = event_data["end_date"]
                existing.registration_url = event_data["registration_url"]
                existing.updated_at = datetime.now(timezone.utc)
                session.add(existing)
            else:
                # Insert new record
                new_hackathon = Hackathon(**event_data)
                session.add(new_hackathon)
        
        session.commit()
        logger.info(f"Successfully cached {len(all_events)} hackathons.")
    except Exception as e:
        logger.error(f"Failed to save hackathons to DB: {e}")
        session.rollback()
