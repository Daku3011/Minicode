from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select, func
from typing import List, Optional
from pydantic import BaseModel
import logging
import json
import os
from datetime import datetime, timezone
from google import genai

from core.database import get_session
from core.models import User, Stream, Milestone, UserMilestoneProgress, Notification
from services.auth import get_current_user
from services.sync_xp import calculate_unlocked_level_from_xp
from services.ai_generator import generate_content_with_retry, extract_text_from_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


class ChatRequest(BaseModel):
    query: str


@router.get("/streams")
def list_streams(session: Session = Depends(get_session)):
    streams = session.exec(
        select(Stream).where(Stream.is_active == True).order_by(Stream.name)
    ).all()

    if not streams:
        logger.info("No streams found, auto-seeding roadmap data...")
        _seed_roadmap_data(session)
        streams = session.exec(
            select(Stream).where(Stream.is_active == True).order_by(Stream.name)
        ).all()

    return [
        {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "description": s.description,
            "icon": s.icon,
            "color": s.color,
            "milestone_count": len(s.milestones),
        }
        for s in streams
    ]


@router.get("/streams/{stream_id}")
def get_stream(
    stream_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    stream = session.get(Stream, stream_id)
    if not stream or not stream.is_active:
        raise HTTPException(status_code=404, detail="Stream not found")

    milestones = session.exec(
        select(Milestone)
        .where(Milestone.stream_id == stream_id)
        .order_by(Milestone.order)
    ).all()

    milestone_ids = [m.id for m in milestones]
    progress_entries = []
    if milestone_ids:
        progress_entries = session.exec(
            select(UserMilestoneProgress).where(
                UserMilestoneProgress.user_id == user.id,
                UserMilestoneProgress.milestone_id.in_(milestone_ids),
            )
        ).all()

    progress_map = {p.milestone_id: p for p in progress_entries}

    result_milestones = []
    all_completed_before = True
    for m in milestones:
        prog = progress_map.get(m.id)
        if prog:
            status = prog.status
        else:
            status = "in_progress" if all_completed_before else "locked"

        result_milestones.append(
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "order": m.order,
                "xp_reward": m.xp_reward,
                "content": m.content,
                "status": status,
                "completed_at": prog.completed_at.isoformat() if prog and prog.completed_at else None,
                "rewarded_at": prog.rewarded_at.isoformat() if prog and prog.rewarded_at else None,
            }
        )

        if status != "completed" and status != "rewarded":
            all_completed_before = False

    return {
        "id": stream.id,
        "name": stream.name,
        "slug": stream.slug,
        "description": stream.description,
        "icon": stream.icon,
        "color": stream.color,
        "milestones": result_milestones,
    }


@router.post("/milestones/{milestone_id}/start")
def start_milestone(
    milestone_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    milestone = session.get(Milestone, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    existing = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id,
            UserMilestoneProgress.milestone_id == milestone_id,
        )
    ).first()

    if existing:
        if existing.status in ("completed", "rewarded"):
            raise HTTPException(status_code=400, detail="Milestone already completed")
        return {"status": "already_in_progress", "milestone_id": milestone_id}

    progress = UserMilestoneProgress(
        user_id=user.id,
        milestone_id=milestone_id,
        status="in_progress",
    )
    session.add(progress)
    session.commit()

    return {"status": "started", "milestone_id": milestone_id}


@router.post("/milestones/{milestone_id}/submit")
async def submit_milestone(
    milestone_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    milestone = session.get(Milestone, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    progress = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id,
            UserMilestoneProgress.milestone_id == milestone_id,
        )
    ).first()

    if not progress:
        raise HTTPException(status_code=400, detail="Milestone not started yet. Click 'Start' first.")

    if progress.status in ("completed", "rewarded"):
        raise HTTPException(status_code=400, detail="Milestone already completed")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB allowed.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI configuration missing")

    text_content = extract_text_from_file(file_content, file.filename or "upload.txt")
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    client = genai.Client(api_key=api_key)

    stream_name = milestone.stream.name if milestone.stream else "Unknown"

    prompt = f"""
    You are an AI Mentor evaluating a student's milestone submission on the MiniCode platform.

    STREAM: {stream_name}
    MILESTONE TITLE: {milestone.title}
    MILESTONE DESCRIPTION: {milestone.description or "No description provided"}

    STUDENT SUBMISSION:
    \"\"\"
    {text_content[:20000]}
    \"\"\"

    Evaluate the student's work based on:
    1. Relevance to the milestone objectives
    2. Quality and completeness of the work
    3. Technical accuracy and understanding
    4. Effort and depth shown

    Respond with a JSON object (ONLY JSON, no markdown wrappers):
    {{
        "score": <number 0-100>,
        "status": "accepted" or "needs_improvement",
        "feedback": "<detailed markdown feedback with strengths, weaknesses, and suggestions for improvement>",
        "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
    }}

    Scoring guidelines:
    - 80-100: Excellent work, fully meets milestone objectives
    - 60-79: Good work, meets most objectives with minor gaps
    - 40-59: Average work, partially meets objectives
    - 0-39: Needs significant improvement
    """

    try:
        response_text = await generate_content_with_retry(client, prompt, response_mime_type="application/json")
        result = json.loads(response_text)
    except Exception as e:
        logger.error(f"Gemini evaluation failed: {e}")
        result = {
            "score": 50,
            "status": "needs_improvement",
            "feedback": f"AI evaluation encountered an issue: {str(e)}. Please try again.",
            "tips": ["Make sure your submission is relevant to the milestone topic."],
        }

    score = max(0, min(100, result.get("score", 0)))
    is_accepted = result.get("status") == "accepted" and score >= 60

    now = datetime.now(timezone.utc)

    if is_accepted:
        xp_pct = score / 100.0
        xp_award = int(milestone.xp_reward * xp_pct)

        progress.status = "rewarded"
        progress.completed_at = now
        progress.rewarded_at = now
        progress.note = f"Score: {score}/100. {result.get('feedback', '')[:500]}"

        old_xp = user.xp or 0
        user.xp = old_xp + xp_award

        new_level = calculate_unlocked_level_from_xp(user.xp)
        if user.unlocked_level is None or new_level > user.unlocked_level:
            user.unlocked_level = new_level

        notification = Notification(
            user_id=user.id,
            title="Milestone Completed!",
            message=f"You completed '{milestone.title}' with a score of {score}/100 and earned {xp_award} XP!",
            notification_type="achievement",
            created_at=now,
        )
        session.add(notification)
        session.add(user)
        session.add(progress)
        session.commit()

        return {
            "status": "rewarded",
            "milestone_id": milestone_id,
            "score": score,
            "xp_awarded": xp_award,
            "total_xp": user.xp,
            "feedback": result.get("feedback", ""),
            "tips": result.get("tips", []),
            "leveled_up": new_level > (user.unlocked_level or 1),
        }
    else:
        progress.status = "completed"
        progress.completed_at = now
        progress.note = f"Score: {score}/100. Needs improvement."
        session.add(progress)
        session.commit()

        # Give half XP for partial completion
        partial_xp = max(1, int(milestone.xp_reward * 0.2))
        old_xp = user.xp or 0
        user.xp = old_xp + partial_xp
        session.add(user)
        session.commit()

        return {
            "status": "needs_improvement",
            "milestone_id": milestone_id,
            "score": score,
            "xp_awarded": partial_xp,
            "total_xp": user.xp,
            "feedback": result.get("feedback", ""),
            "tips": result.get("tips", []),
        }


@router.post("/streams/{stream_id}/chat")
async def stream_chat(
    stream_id: int,
    chat_req: ChatRequest,
    user: Optional[User] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    stream = session.get(Stream, stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    milestones = session.exec(
        select(Milestone)
        .where(Milestone.stream_id == stream_id)
        .order_by(Milestone.order)
    ).all()

    milestones_str = "\n".join(
        f"- {m.title}: {m.description or 'No description'} (XP: {m.xp_reward})"
        for m in milestones
    )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI configuration missing")

    prompt = f"""
    You are an AI Stream Assistant on the MiniCode platform. You ONLY provide information about the specific stream the user is in.

    STREAM NAME: {stream.name}
    STREAM DESCRIPTION: {stream.description or "No description"}

    AVAILABLE MILESTONES:
    {milestones_str}

    Guidelines:
    1. ONLY answer questions related to this specific stream ({stream.name}). If asked about anything else, politely redirect.
    2. Help students understand what each milestone involves and how to approach it.
    3. Provide learning resources, tips, and study suggestions relevant to this stream.
    4. Be encouraging and use professional Markdown for readability.
    5. If asked about topics outside this stream, say "I can only assist with questions about {stream.name}."

    Student Query: {chat_req.query}
    """

    try:
        client = genai.Client(api_key=api_key)
        response_text = await generate_content_with_retry(client, prompt)
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Gemini Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process AI request.")


@router.get("/progress")
def get_user_progress(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    progress = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id
        )
    ).all()

    total_xp_earned = sum(
        p.milestone.xp_reward
        for p in progress
        if p.status == "rewarded" and p.milestone
    )

    return {
        "total_milestones": len(progress),
        "completed": sum(1 for p in progress if p.status == "rewarded"),
        "in_progress": sum(1 for p in progress if p.status == "in_progress"),
        "total_xp_earned": total_xp_earned,
    }


def _seed_roadmap_data(session: Session):
    existing = session.exec(select(Stream).limit(1)).first()
    if existing:
        return

    streams_data = [
        {
            "name": "Cybersecurity",
            "slug": "cybersecurity",
            "description": "Master the art of ethical hacking, network security, and defensive programming.",
            "icon": "shield",
            "color": "#dc2626",
            "milestones": [
                {"title": "Networking Basics", "description": "Understand TCP/IP, DNS, and network protocols.", "xp_reward": 100},
                {"title": "Web Security Fundamentals", "description": "Learn OWASP Top 10, XSS, and SQL Injection.", "xp_reward": 150},
                {"title": "Cryptography 101", "description": "Explore encryption, hashing, and digital signatures.", "xp_reward": 150},
                {"title": "Ethical Hacking", "description": "Set up a lab and perform penetration testing.", "xp_reward": 200},
                {"title": "CTF Challenge Master", "description": "Solve real-world Capture The Flag challenges.", "xp_reward": 300},
            ],
        },
        {
            "name": "AI & Machine Learning",
            "slug": "aiml",
            "description": "Build intelligent systems with machine learning, deep learning, and LLMs.",
            "icon": "brain",
            "color": "#7c3aed",
            "milestones": [
                {"title": "Python for ML", "description": "Master NumPy, Pandas, and data visualization.", "xp_reward": 100},
                {"title": "ML Fundamentals", "description": "Understand supervised and unsupervised learning.", "xp_reward": 150},
                {"title": "Deep Learning", "description": "Build neural networks with PyTorch/TensorFlow.", "xp_reward": 200},
                {"title": "NLP & LLMs", "description": "Work with transformers, RAG, and prompt engineering.", "xp_reward": 200},
                {"title": "MLOps & Deployment", "description": "Deploy models to production with CI/CD.", "xp_reward": 300},
            ],
        },
        {
            "name": "Web Development",
            "slug": "web-dev",
            "description": "Build full-stack web applications with modern frameworks.",
            "icon": "code",
            "color": "#2563eb",
            "milestones": [
                {"title": "HTML/CSS Foundations", "description": "Build responsive layouts with modern CSS.", "xp_reward": 80},
                {"title": "JavaScript Mastery", "description": "Master ES6+, async programming, and DOM.", "xp_reward": 120},
                {"title": "React/Next.js", "description": "Build SPAs and SSR apps with React ecosystem.", "xp_reward": 200},
                {"title": "Backend with Node.js", "description": "Create REST APIs and GraphQL servers.", "xp_reward": 200},
                {"title": "Full-Stack Project", "description": "Deploy a complete full-stack application.", "xp_reward": 300},
            ],
        },
        {
            "name": "Data Science",
            "slug": "data-science",
            "description": "Extract insights from data using statistics, analysis, and visualization.",
            "icon": "chart",
            "color": "#059669",
            "milestones": [
                {"title": "Statistics Fundamentals", "description": "Learn probability, distributions, and hypothesis testing.", "xp_reward": 100},
                {"title": "Data Wrangling", "description": "Clean and transform real-world datasets.", "xp_reward": 150},
                {"title": "Data Visualization", "description": "Create compelling visualizations with Matplotlib/Seaborn.", "xp_reward": 150},
                {"title": "SQL & Databases", "description": "Query and analyze data with advanced SQL.", "xp_reward": 150},
                {"title": "End-to-End Analysis", "description": "Complete a full data analysis project.", "xp_reward": 300},
            ],
        },
    ]

    for s_data in streams_data:
        milestones_data = s_data.pop("milestones")
        stream = Stream(**s_data)
        session.add(stream)
        session.flush()
        for i, m_data in enumerate(milestones_data):
            milestone = Milestone(stream_id=stream.id, order=i + 1, **m_data)
            session.add(milestone)

    session.commit()


@router.get("/seed")
def seed_roadmap_data(session: Session = Depends(get_session)):
    _seed_roadmap_data(session)
    count = session.exec(select(func.count(Stream.id))).one()
    return {"message": f"Seeded {count} streams with milestones"}
