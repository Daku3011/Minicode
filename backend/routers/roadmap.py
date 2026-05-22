from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select, func
from typing import List, Optional
from pydantic import BaseModel
import logging
import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi import Query
from sqlmodel import Session, select, func, SQLModel
from typing import List, Optional
from pydantic import BaseModel
from google import genai

from core.database import get_session, engine
from core.models import User, Stream, Milestone, UserMilestoneProgress, Notification
from services.auth import get_current_user
from services.sync_xp import calculate_unlocked_level_from_xp
from services.ai_generator import generate_content_with_retry, extract_text_from_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


class ChatRequest(BaseModel):
    query: str


class LearningMaterialsRequest(BaseModel):
    context: Optional[str] = None


@router.get("/streams")
def list_streams(session: Session = Depends(get_session)):
    try:
        SQLModel.metadata.create_all(engine, checkfirst=True)
    except Exception:
        pass

    streams = session.exec(
        select(Stream).where(Stream.is_active == True).order_by(Stream.name)
    ).all()

    if not streams:
        logger.info("No streams found, auto-seeding roadmap data...")
        try:
            _seed_roadmap_data(session)
        except Exception as e:
            logger.error(f"Auto-seed failed: {e}")
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
                "hints": m.hints,
                "resources": json.loads(m.resources) if m.resources else [],
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
    files: List[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    milestone = session.get(Milestone, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded")

    progress = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id,
            UserMilestoneProgress.milestone_id == milestone_id,
        )
    ).first()

    if not progress:
        all_prior = session.exec(
            select(Milestone)
            .where(
                Milestone.stream_id == milestone.stream_id,
                Milestone.order < milestone.order,
            )
            .order_by(Milestone.order)
        ).all()

        prior_ids = [m.id for m in all_prior]
        if prior_ids:
            prior_progress = session.exec(
                select(UserMilestoneProgress).where(
                    UserMilestoneProgress.user_id == user.id,
                    UserMilestoneProgress.milestone_id.in_(prior_ids),
                )
            ).all()
            all_prior_done = all(
                p.status in ("completed", "rewarded") for p in prior_progress
            ) and len(prior_progress) == len(prior_ids)
        else:
            all_prior_done = True

        if all_prior_done:
            progress = UserMilestoneProgress(
                user_id=user.id,
                milestone_id=milestone_id,
                status="in_progress",
            )
            session.add(progress)
            session.commit()
        else:
            raise HTTPException(status_code=400, detail="Milestone not started yet. Click 'Start' first.")

    if progress.status in ("completed", "rewarded"):
        raise HTTPException(status_code=400, detail="Milestone already completed")

    combined_text = ""
    total_size = 0
    for f in files:
        content = await f.read()
        if not content:
            continue
        if f.size and f.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File '{f.filename}' exceeds 10MB limit.")
        total_size += len(content)
        if total_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Total upload size exceeds 50MB limit.")
        text = extract_text_from_file(content, f.filename or "upload.txt")
        if text.strip():
            combined_text += f"\n\n--- {f.filename} ---\n\n{text}"

    combined_text = combined_text.strip()
    if not combined_text:
        raise HTTPException(status_code=400, detail="Could not extract text from any uploaded file")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI configuration missing")

    client = genai.Client(api_key=api_key)

    stream_name = milestone.stream.name if milestone.stream else "Unknown"

    prompt = f"""
    You are an AI Mentor evaluating a student's milestone submission on the MiniCode platform.

    STREAM: {stream_name}
    MILESTONE TITLE: {milestone.title}
    MILESTONE DESCRIPTION: {milestone.description or "No description provided"}

    STUDENT SUBMISSION:
    \"\"\"
    {combined_text[:20000]}
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

        # Generate next milestone dynamically
        try:
            await generate_next_milestone(session, milestone)
        except Exception as e:
            logger.error(f"Failed to generate next milestone: {e}")

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


@router.post("/milestones/{milestone_id}/learning-materials")
async def generate_learning_materials(
    milestone_id: int,
    req: LearningMaterialsRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    milestone = session.get(Milestone, milestone_id)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    stream = session.get(Stream, milestone.stream_id)
    all_milestones = session.exec(
        select(Milestone)
        .where(Milestone.stream_id == milestone.stream_id)
        .order_by(Milestone.order)
    ).all()

    milestones_str = "\n".join(
        f"- Milestone {m.order}: {m.title} - {m.description or 'No description'}"
        for m in all_milestones
    )

    progress = session.exec(
        select(UserMilestoneProgress).where(
            UserMilestoneProgress.user_id == user.id,
            UserMilestoneProgress.milestone_id == milestone_id,
        )
    ).first()

    user_context = ""
    if progress and progress.note:
        user_context += f"\nStudent's previous attempt feedback: {progress.note}"
    if req.context:
        user_context += f"\nStudent's specific request: {req.context}"

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI configuration missing")

    prompt = f"""
    You are an AI Learning Assistant on the MiniCode platform. Generate personalized learning materials for a student working on a milestone.

    STREAM: {stream.name if stream else 'Unknown'}
    STREAM DESCRIPTION: {stream.description if stream else 'No description'}

    CURRENT MILESTONE: {milestone.title}
    MILESTONE DESCRIPTION: {milestone.description or 'No description'}
    MILESTONE ORDER: {milestone.order}/{len(all_milestones)}

    ALL MILESTONES IN THIS STREAM:
    {milestones_str}
    {user_context}

    Generate tailored learning materials including:
    1. Hints - practical, actionable guidance to help the student complete this milestone (2-3 paragraphs).
    2. Resources - 3 curated learning resources with real, well-known, freely available URLs.

    Respond with a JSON object (ONLY JSON, no wrappers):
    {{
        "hints": "detailed markdown hints here",
        "resources": [
            {{"title": "...", "url": "...", "description": "..."}},
            {{"title": "...", "url": "...", "description": "..."}},
            {{"title": "...", "url": "...", "description": "..."}}
        ]
    }}

    Make hints specific, actionable, and tailored to this milestone. Choose real resources.
    """

    try:
        client = genai.Client(api_key=api_key)
        response_text = await generate_content_with_retry(client, prompt, response_mime_type="application/json")
        result = json.loads(response_text)
        return {
            "hints": result.get("hints", ""),
            "resources": result.get("resources", []),
        }
    except Exception as e:
        logger.error(f"Gemini learning materials generation failed: {e}")
        return {
            "hints": milestone.hints or "No hints available.",
            "resources": json.loads(milestone.resources) if milestone.resources else [],
        }


async def generate_next_milestone(session: Session, milestone: Milestone):
    stream = session.get(Stream, milestone.stream_id)
    if not stream:
        return None

    existing = session.exec(
        select(Milestone)
        .where(Milestone.stream_id == stream.id)
        .order_by(Milestone.order)
    ).all()

    current_max_order = max((m.order for m in existing), default=0)

    milestones_summary = "\n".join(
        f"- Milestone {m.order}: {m.title} - {m.description or 'No description'} (XP: {m.xp_reward})"
        for m in existing
    )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    prompt = f"""
    You are an AI Curriculum Designer for the MiniCode platform. Generate the next milestone in a learning stream when a student completes the current one.

    STREAM: {stream.name}
    STREAM DESCRIPTION: {stream.description or 'No description'}

    EXISTING MILESTONES ({len(existing)} completed so far):
    {milestones_summary}

    LAST COMPLETED MILESTONE: {milestone.title} - {milestone.description or 'No description'}

    Generate the next milestone (number {current_max_order + 1}) that:
    1. Builds upon previous milestones logically
    2. Is more advanced than the last one
    3. Fits the stream's overall learning path
    4. Has a reasonable XP reward (increase by 20-50% from the previous milestone, max 500)

    Respond with a JSON object (ONLY JSON, no wrappers):
    {{
        "title": "concise milestone title",
        "description": "clear description of what the student will learn/do",
        "xp_reward": <number>,
        "hints": "practical actionable hints for the student (2-3 sentences)",
        "resources": [
            {{"title": "...", "url": "...", "description": "..."}},
            {{"title": "...", "url": "...", "description": "..."}},
            {{"title": "...", "url": "...", "description": "..."}}
        ]
    }}

    Choose real well-known freely available resources. Make the title concise.
    """

    try:
        client = genai.Client(api_key=api_key)
        response_text = await generate_content_with_retry(client, prompt, response_mime_type="application/json")
        result = json.loads(response_text)

        new_milestone = Milestone(
            stream_id=stream.id,
            title=result.get("title", f"Advanced Topic {current_max_order + 1}"),
            description=result.get("description", ""),
            order=current_max_order + 1,
            xp_reward=result.get("xp_reward", 100),
            hints=result.get("hints", ""),
            resources=json.dumps(result.get("resources", [])),
        )
        session.add(new_milestone)
        session.commit()
        logger.info(f"Generated new milestone: {new_milestone.title} (order {new_milestone.order}) for stream {stream.name}")
        return new_milestone
    except Exception as e:
        logger.error(f"Gemini milestone generation failed: {e}")
        return None


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

    streams_data = _get_all_streams_data()

    for s_data in streams_data:
        milestones_data = s_data.pop("milestones")
        stream = Stream(**s_data)
        session.add(stream)
        session.flush()
        for i, m_data in enumerate(milestones_data):
            milestone = Milestone(stream_id=stream.id, order=i + 1, **m_data)
            session.add(milestone)

    session.commit()


def _seed_additional_streams(session: Session):
    """Add any missing streams without wiping existing data."""
    all_streams = _get_all_streams_data()
    added = 0
    for s_data in all_streams:
        milestones_data = s_data.pop("milestones")
        slug = s_data["slug"]
        existing = session.exec(select(Stream).where(Stream.slug == slug)).first()
        if existing:
            # Re-attach milestones list for safety (already popped above)
            s_data["milestones"] = milestones_data
            continue
        stream = Stream(**s_data)
        session.add(stream)
        session.flush()
        for i, m_data in enumerate(milestones_data):
            milestone = Milestone(stream_id=stream.id, order=i + 1, **m_data)
            session.add(milestone)
        added += 1
    session.commit()
    return added


def _get_all_streams_data():
    streams_data = [
        {
            "name": "Cybersecurity",
            "slug": "cybersecurity",
            "description": "Master the art of ethical hacking, network security, and defensive programming.",
            "icon": "shield",
            "color": "#dc2626",
            "milestones": [
                {
                    "title": "Networking Basics",
                    "description": "Understand TCP/IP, DNS, and network protocols.",
                    "xp_reward": 100,
                    "hints": "Focus on the OSI model layers. Understand how data flows from one machine to another. Practice with Wireshark to see packets in action.",
                    "resources": json.dumps([
                        {"title": "Computer Networking Course (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=qiQR5rTSshw", "description": "Full 4-hour networking course covering all fundamentals"},
                        {"title": "Subnetting Practice", "url": "https://subnettingpractice.com/", "description": "Interactive subnetting exercises"},
                        {"title": "Wireshark Tutorial", "url": "https://www.wireshark.org/docs/wsug_html/", "description": "Official Wireshark user guide"}
                    ]),
                },
                {
                    "title": "Web Security Fundamentals",
                    "description": "Learn OWASP Top 10, XSS, and SQL Injection.",
                    "xp_reward": 150,
                    "hints": "Set up a local DVWA or OWASP Juice Shop to practice. Focus on understanding how each vulnerability works at the code level.",
                    "resources": json.dumps([
                        {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "description": "Official OWASP Top 10 web security risks"},
                        {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security", "description": "Free interactive labs for all web security topics"},
                        {"title": "DVWA Setup Guide", "url": "https://github.com/digininja/DVWA", "description": "Damn Vulnerable Web Application for practice"}
                    ]),
                },
                {
                    "title": "Cryptography 101",
                    "description": "Explore encryption, hashing, and digital signatures.",
                    "xp_reward": 150,
                    "hints": "Start with symmetric vs asymmetric encryption. Practice with OpenSSL CLI. Understand why hashing is not encryption.",
                    "resources": json.dumps([
                        {"title": "Cryptography I (Coursera - Stanford)", "url": "https://www.coursera.org/learn/crypto", "description": "Comprehensive cryptography course by Dan Boneh"},
                        {"title": "CryptoPals Challenges", "url": "https://cryptopals.com/", "description": "Hands-on cryptography coding challenges"},
                        {"title": "OpenSSL Cookbook", "url": "https://www.feistyduck.com/openssl-cookbook/", "description": "Practical OpenSSL usage guide"}
                    ]),
                },
                {
                    "title": "Ethical Hacking",
                    "description": "Set up a lab and perform penetration testing.",
                    "xp_reward": 200,
                    "hints": "Build a home lab with VirtualBox. Use Kali Linux as your attack machine. Start with reconnaissance tools like Nmap and enum4linux.",
                    "resources": json.dumps([
                        {"title": "Kali Linux Documentation", "url": "https://www.kali.org/docs/", "description": "Official Kali Linux usage guide"},
                        {"title": "TryHackMe", "url": "https://tryhackme.com/", "description": "Gamified penetration testing rooms"},
                        {"title": "HackTheBox Academy", "url": "https://academy.hackthebox.com/", "description": "Structured pentesting learning paths"}
                    ]),
                },
                {
                    "title": "CTF Challenge Master",
                    "description": "Solve real-world Capture The Flag challenges.",
                    "xp_reward": 300,
                    "hints": "Participate in CTFtime events. Focus on one category at a time (web, crypto, forensics, etc.). Document your methodology.",
                    "resources": json.dumps([
                        {"title": "CTFtime", "url": "https://ctftime.org/", "description": "Find upcoming CTF events worldwide"},
                        {"title": "picoCTF", "url": "https://picoctf.org/", "description": "Beginner-friendly CTF with learning resources"},
                        {"title": "CTF Field Guide", "url": "https://trailofbits.github.io/ctf/", "description": "Comprehensive CTF strategies and tools"}
                    ]),
                },
            ],
        },
        {
            "name": "AI & Machine Learning",
            "slug": "aiml",
            "description": "Build intelligent systems with machine learning, deep learning, and LLMs.",
            "icon": "brain",
            "color": "#7c3aed",
            "milestones": [
                {
                    "title": "Python for ML",
                    "description": "Master NumPy, Pandas, and data visualization.",
                    "xp_reward": 100,
                    "hints": "Focus on NumPy array operations and Pandas DataFrame manipulations. Practice with real datasets from Kaggle.",
                    "resources": json.dumps([
                        {"title": "NumPy Official Guide", "url": "https://numpy.org/doc/stable/", "description": "Complete NumPy documentation with examples"},
                        {"title": "Pandas Getting Started", "url": "https://pandas.pydata.org/docs/getting_started/", "description": "Pandas tutorials for data manipulation"},
                        {"title": "Kaggle Learn Python", "url": "https://www.kaggle.com/learn/python", "description": "Free micro-courses on Python for ML"}
                    ]),
                },
                {
                    "title": "ML Fundamentals",
                    "description": "Understand supervised and unsupervised learning.",
                    "xp_reward": 150,
                    "hints": "Start with linear regression and logistic regression. Understand bias-variance tradeoff. Use scikit-learn for hands-on practice.",
                    "resources": json.dumps([
                        {"title": "Scikit-Learn Tutorials", "url": "https://scikit-learn.org/stable/tutorial/index.html", "description": "Official scikit-learn tutorials"},
                        {"title": "Andrew Ng ML Course", "url": "https://www.coursera.org/learn/machine-learning", "description": "The classic ML course on Coursera"},
                        {"title": "ML Cheatsheets (Stanford)", "url": "https://stanford.edu/~shervine/teaching/cs229/", "description": "Comprehensive ML reference sheets"}
                    ]),
                },
                {
                    "title": "Deep Learning",
                    "description": "Build neural networks with PyTorch/TensorFlow.",
                    "xp_reward": 200,
                    "hints": "Understand backpropagation before using frameworks. Start with simple feedforward networks on MNIST. Use GPU on Colab for free.",
                    "resources": json.dumps([
                        {"title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials/", "description": "Official PyTorch deep learning tutorials"},
                        {"title": "Deep Learning Specialization (deeplearning.ai)", "url": "https://www.coursera.org/specializations/deep-learning", "description": "Comprehensive DL course by Andrew Ng"},
                        {"title": "fast.ai Practical DL", "url": "https://course.fast.ai/", "description": "Top-down approach to deep learning"}
                    ]),
                },
                {
                    "title": "NLP & LLMs",
                    "description": "Work with transformers, RAG, and prompt engineering.",
                    "xp_reward": 200,
                    "hints": "Start with the Hugging Face ecosystem. Understand tokenization and attention mechanisms. Experiment with RAG using LangChain.",
                    "resources": json.dumps([
                        {"title": "Hugging Face Course", "url": "https://huggingface.co/learn/nlp-course", "description": "Free NLP course using Transformers"},
                        {"title": "LangChain Documentation", "url": "https://python.langchain.com/docs/get_started/introduction", "description": "Build LLM applications with LangChain"},
                        {"title": "Prompt Engineering Guide", "url": "https://www.promptingguide.ai/", "description": "Complete guide to prompt engineering techniques"}
                    ]),
                },
                {
                    "title": "MLOps & Deployment",
                    "description": "Deploy models to production with CI/CD.",
                    "xp_reward": 300,
                    "hints": "Containerize your model with Docker. Use FastAPI for model serving. Implement monitoring with Prometheus/Grafana.",
                    "resources": json.dumps([
                        {"title": "MLOps Course (made with ML)", "url": "https://madewithml.com/", "description": "Complete MLOps course with code"},
                        {"title": "Docker for Data Science", "url": "https://www.docker.com/blog/category/data-science/", "description": "Docker guides for ML deployment"},
                        {"title": "MLflow Documentation", "url": "https://mlflow.org/docs/latest/index.html", "description": "Track experiments and manage models"}
                    ]),
                },
            ],
        },
        {
            "name": "Web Development",
            "slug": "web-dev",
            "description": "Build full-stack web applications with modern frameworks.",
            "icon": "code",
            "color": "#2563eb",
            "milestones": [
                {
                    "title": "HTML/CSS Foundations",
                    "description": "Build responsive layouts with modern CSS.",
                    "xp_reward": 80,
                    "hints": "Master Flexbox and Grid first. Build a simple portfolio site. Use browser DevTools to inspect and experiment.",
                    "resources": json.dumps([
                        {"title": "MDN HTML Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "description": "Complete HTML reference by Mozilla"},
                        {"title": "CSS Flexbox Froggy", "url": "https://flexboxfroggy.com/", "description": "Interactive Flexbox learning game"},
                        {"title": "CSS Grid Garden", "url": "https://cssgridgarden.com/", "description": "Interactive Grid layout game"}
                    ]),
                },
                {
                    "title": "JavaScript Mastery",
                    "description": "Master ES6+, async programming, and DOM.",
                    "xp_reward": 120,
                    "hints": "Understand closures, promises, and async/await deeply. Build small interactive widgets to practice DOM manipulation.",
                    "resources": json.dumps([
                        {"title": "JavaScript.info", "url": "https://javascript.info/", "description": "Modern JavaScript tutorial from basics to advanced"},
                        {"title": "You Don't Know JS (Book Series)", "url": "https://github.com/getify/You-Dont-Know-JS", "description": "Deep dive into JavaScript mechanics"},
                        {"title": "FreeCodeCamp JS Course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "description": "Structured JS certification course"}
                    ]),
                },
                {
                    "title": "React/Next.js",
                    "description": "Build SPAs and SSR apps with React ecosystem.",
                    "xp_reward": 200,
                    "hints": "Master hooks and component composition. Understand the difference between CSR and SSR in Next.js. Build a small project to practice.",
                    "resources": json.dumps([
                        {"title": "React Documentation", "url": "https://react.dev/learn", "description": "Official React docs with interactive examples"},
                        {"title": "Next.js Learn", "url": "https://nextjs.org/learn", "description": "Official Next.js tutorial"},
                        {"title": "React TypeScript Cheatsheet", "url": "https://react-typescript-cheatsheet.netlify.app/", "description": "Using React with TypeScript guide"}
                    ]),
                },
                {
                    "title": "Backend with Node.js",
                    "description": "Create REST APIs and GraphQL servers.",
                    "xp_reward": 200,
                    "hints": "Start with Express.js for REST APIs. Understand middleware, authentication (JWT), and database integration (Prisma/Mongoose).",
                    "resources": json.dumps([
                        {"title": "Express.js Guide", "url": "https://expressjs.com/en/guide/routing.html", "description": "Official Express.js routing guide"},
                        {"title": "Prisma Documentation", "url": "https://www.prisma.io/docs", "description": "Next-gen Node.js ORM documentation"},
                        {"title": "JWT Introduction", "url": "https://jwt.io/introduction", "description": "Understanding JSON Web Tokens"}
                    ]),
                },
                {
                    "title": "Full-Stack Project",
                    "description": "Deploy a complete full-stack application.",
                    "xp_reward": 300,
                    "hints": "Plan your project architecture before coding. Use environment variables for configuration. Deploy early, iterate often.",
                    "resources": json.dumps([
                        {"title": "Vercel Deployment Guide", "url": "https://vercel.com/docs/deployments/overview", "description": "Deploy frontend apps with Vercel"},
                        {"title": "Railway.app", "url": "https://railway.app/", "description": "Simple backend deployment platform"},
                        {"title": "Full-Stack Open (University of Helsinki)", "url": "https://fullstackopen.com/en/", "description": "Comprehensive full-stack course"}
                    ]),
                },
            ],
        },
        {
            "name": "Data Science",
            "slug": "data-science",
            "description": "Extract insights from data using statistics, analysis, and visualization.",
            "icon": "chart",
            "color": "#059669",
            "milestones": [
                {
                    "title": "Statistics Fundamentals",
                    "description": "Learn probability, distributions, and hypothesis testing.",
                    "xp_reward": 100,
                    "hints": "Focus on descriptive vs inferential statistics. Understand p-values and confidence intervals. Practice with real datasets.",
                    "resources": json.dumps([
                        {"title": "Statistics by Jim", "url": "https://statisticsbyjim.com/", "description": "Intuitive statistics explanations with examples"},
                        {"title": "Khan Academy Statistics", "url": "https://www.khanacademy.org/math/statistics-probability", "description": "Free statistics course from basics"},
                        {"title": "Seeing Theory", "url": "https://seeing-theory.brown.edu/", "description": "Interactive probability visualizations"}
                    ]),
                },
                {
                    "title": "Data Wrangling",
                    "description": "Clean and transform real-world datasets.",
                    "xp_reward": 150,
                    "hints": "Real data is messy. Focus on handling missing values, outliers, and data type conversions. Practice with the Titanic dataset.",
                    "resources": json.dumps([
                        {"title": "Pandas Data Wrangling Guide", "url": "https://pandas.pydata.org/docs/user_guide/", "description": "Official Pandas user guide"},
                        {"title": "Kaggle Data Cleaning Course", "url": "https://www.kaggle.com/learn/data-cleaning", "description": "Free data cleaning micro-course"},
                        {"title": "Tidy Data (Hadley Wickham)", "url": "https://vita.had.co.nz/papers/tidy-data.pdf", "description": "Foundational paper on data tidying"}
                    ]),
                },
                {
                    "title": "Data Visualization",
                    "description": "Create compelling visualizations with Matplotlib/Seaborn.",
                    "xp_reward": 150,
                    "hints": "Know your audience and choose the right chart type. Use color effectively. Tell a story with your data.",
                    "resources": json.dumps([
                        {"title": "From Data to Viz", "url": "https://www.data-to-viz.com/", "description": "Find the right chart for your data"},
                        {"title": "Seaborn Tutorial", "url": "https://seaborn.pydata.org/tutorial.html", "description": "Statistical data visualization guide"},
                        {"title": "The Data Visualization Catalogue", "url": "https://datavizcatalogue.com/", "description": "Chart type reference with use cases"}
                    ]),
                },
                {
                    "title": "SQL & Databases",
                    "description": "Query and analyze data with advanced SQL.",
                    "xp_reward": 150,
                    "hints": "Master JOINs and window functions. Use CTEs for complex queries. Practice with online SQL playgrounds.",
                    "resources": json.dumps([
                        {"title": "SQL Tutorial (Mode Analytics)", "url": "https://mode.com/sql-tutorial/", "description": "Excellent SQL tutorial from basics to advanced"},
                        {"title": "SQLZoo", "url": "https://sqlzoo.net/", "description": "Interactive SQL practice exercises"},
                        {"title": "LeetCode SQL Problems", "url": "https://leetcode.com/problemset/database/", "description": "Practice SQL with real interview questions"}
                    ]),
                },
                {
                    "title": "End-to-End Analysis",
                    "description": "Complete a full data analysis project.",
                    "xp_reward": 300,
                    "hints": "Pick a dataset you're passionate about. Start with a clear question. Document your process. Share your findings on GitHub.",
                    "resources": json.dumps([
                        {"title": "Kaggle Datasets", "url": "https://www.kaggle.com/datasets", "description": "Thousands of free datasets for practice"},
                        {"title": "Data Analysis with Python (freeCodeCamp)", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "description": "Full data analysis certification course"},
                        {"title": "Towards Data Science (Medium)", "url": "https://towardsdatascience.com/", "description": "Articles and tutorials from data science practitioners"}
                    ]),
                },
            ],
        },
        {
            "name": "Cloud & DevOps",
            "slug": "cloud-devops",
            "description": "Master cloud platforms, infrastructure-as-code, CI/CD pipelines, and container orchestration.",
            "icon": "cloud",
            "color": "#0891b2",
            "milestones": [
                {
                    "title": "Linux & Shell Scripting",
                    "description": "Master the command line, bash scripting, and Linux administration.",
                    "xp_reward": 100,
                    "hints": "Practice daily in a Linux VM. Learn cron jobs, file permissions, and process management. Write scripts to automate repetitive tasks.",
                    "resources": json.dumps([
                        {"title": "The Linux Command Line (free book)", "url": "https://linuxcommand.org/tlcl.php", "description": "Comprehensive free book on Linux CLI"},
                        {"title": "Bash Scripting Tutorial", "url": "https://www.shellscript.sh/", "description": "Practical shell scripting guide"},
                        {"title": "OverTheWire: Bandit", "url": "https://overthewire.org/wargames/bandit/", "description": "Gamified Linux command-line challenges"}
                    ]),
                },
                {
                    "title": "Docker & Containers",
                    "description": "Containerize applications and manage Docker images and networks.",
                    "xp_reward": 150,
                    "hints": "Build multi-stage Dockerfiles for smaller images. Understand volumes vs bind mounts. Use docker-compose for multi-container apps.",
                    "resources": json.dumps([
                        {"title": "Docker Official Get Started", "url": "https://docs.docker.com/get-started/", "description": "Official Docker beginner guide"},
                        {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/", "description": "Free browser-based Docker playground"},
                        {"title": "Docker Curriculum", "url": "https://docker-curriculum.com/", "description": "Comprehensive Docker tutorial from scratch"}
                    ]),
                },
                {
                    "title": "CI/CD Pipelines",
                    "description": "Build automated testing, building, and deployment pipelines.",
                    "xp_reward": 150,
                    "hints": "Start with GitHub Actions — it's free and widely used. Automate tests first, then builds, then deployments. Understand branch strategies.",
                    "resources": json.dumps([
                        {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "description": "Official GitHub Actions guide"},
                        {"title": "CI/CD Pipeline Tutorial", "url": "https://www.youtube.com/watch?v=R8_veQiYBjI", "description": "Full CI/CD crash course by TechWorld with Nana"},
                        {"title": "GitLab CI/CD Docs", "url": "https://docs.gitlab.com/ee/ci/", "description": "GitLab's comprehensive CI/CD documentation"}
                    ]),
                },
                {
                    "title": "Kubernetes Fundamentals",
                    "description": "Deploy and manage containerized apps with Kubernetes.",
                    "xp_reward": 200,
                    "hints": "Use Minikube or Kind for local clusters. Understand Pods, Services, Deployments, and ConfigMaps before touching Helm. Learn kubectl deeply.",
                    "resources": json.dumps([
                        {"title": "Kubernetes Documentation", "url": "https://kubernetes.io/docs/home/", "description": "Official Kubernetes docs and tutorials"},
                        {"title": "Kubernetes the Hard Way", "url": "https://github.com/kelseyhightower/kubernetes-the-hard-way", "description": "Learn K8s internals by building from scratch"},
                        {"title": "KodeKloud Kubernetes Course", "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/", "description": "Hands-on beginner Kubernetes course"}
                    ]),
                },
                {
                    "title": "Infrastructure as Code",
                    "description": "Provision and manage cloud resources with Terraform and Ansible.",
                    "xp_reward": 250,
                    "hints": "Start with Terraform on a free-tier AWS/GCP account. Understand state management. Use modules for reusability. Practice destroy and recreate.",
                    "resources": json.dumps([
                        {"title": "Terraform Getting Started (AWS)", "url": "https://developer.hashicorp.com/terraform/tutorials/aws-get-started", "description": "Official Terraform AWS quickstart"},
                        {"title": "Ansible Documentation", "url": "https://docs.ansible.com/ansible/latest/index.html", "description": "Official Ansible configuration management docs"},
                        {"title": "FreeCodeCamp Terraform Tutorial", "url": "https://www.youtube.com/watch?v=SLB_c_ayRMo", "description": "Full Terraform course for beginners"}
                    ]),
                },
            ],
        },
        {
            "name": "Mobile Development",
            "slug": "mobile-dev",
            "description": "Build cross-platform mobile apps for iOS and Android with Flutter and React Native.",
            "icon": "smartphone",
            "color": "#ea580c",
            "milestones": [
                {
                    "title": "Mobile Design Principles",
                    "description": "Learn UI/UX patterns, navigation, and platform guidelines for mobile.",
                    "xp_reward": 80,
                    "hints": "Study Apple HIG and Material Design guidelines. Focus on touch targets, gestures, and responsive layouts. Prototype in Figma first.",
                    "resources": json.dumps([
                        {"title": "Material Design Guidelines", "url": "https://m3.material.io/", "description": "Google's Material Design 3 system"},
                        {"title": "Apple Human Interface Guidelines", "url": "https://developer.apple.com/design/human-interface-guidelines/", "description": "Apple's official iOS design standards"},
                        {"title": "Figma Mobile Design Tutorial", "url": "https://www.youtube.com/watch?v=FTFaQWZBqQ8", "description": "Design mobile apps in Figma from scratch"}
                    ]),
                },
                {
                    "title": "Dart & Flutter Basics",
                    "description": "Build your first Flutter app with widgets, state, and navigation.",
                    "xp_reward": 130,
                    "hints": "Everything in Flutter is a widget. Master StatelessWidget vs StatefulWidget first. Use the Flutter inspector in VS Code for debugging layouts.",
                    "resources": json.dumps([
                        {"title": "Flutter Official Docs", "url": "https://flutter.dev/docs", "description": "Comprehensive Flutter documentation"},
                        {"title": "Dart Language Tour", "url": "https://dart.dev/language", "description": "Official Dart programming language reference"},
                        {"title": "Flutter Crash Course (Traversy Media)", "url": "https://www.youtube.com/watch?v=1gDhl4leEzA", "description": "Beginner Flutter app build along"}
                    ]),
                },
                {
                    "title": "State Management",
                    "description": "Master Flutter state management with Riverpod or BLoC.",
                    "xp_reward": 180,
                    "hints": "Start with Provider, then move to Riverpod for more scalable apps. Understand when to use local vs global state. Avoid setState for complex apps.",
                    "resources": json.dumps([
                        {"title": "Riverpod Documentation", "url": "https://riverpod.dev/", "description": "Official Riverpod state management docs"},
                        {"title": "Flutter BLoC Tutorial", "url": "https://bloclibrary.dev/#/gettingstarted", "description": "Official BLoC library guide"},
                        {"title": "State Management Comparison", "url": "https://flutter.dev/docs/development/data-and-backend/state-mgmt/options", "description": "Flutter's state management options overview"}
                    ]),
                },
                {
                    "title": "APIs & Backend Integration",
                    "description": "Connect your app to REST APIs, Firebase, and local storage.",
                    "xp_reward": 200,
                    "hints": "Use http or dio packages for REST APIs. Implement proper error handling and loading states. Cache API responses with Hive for offline support.",
                    "resources": json.dumps([
                        {"title": "Firebase for Flutter", "url": "https://firebase.google.com/docs/flutter/setup", "description": "Set up Firebase in a Flutter app"},
                        {"title": "Dio HTTP Client", "url": "https://pub.dev/packages/dio", "description": "Powerful HTTP client for Dart/Flutter"},
                        {"title": "Flutter Cookbook", "url": "https://flutter.dev/docs/cookbook", "description": "Common Flutter patterns and recipes"}
                    ]),
                },
                {
                    "title": "App Store Deployment",
                    "description": "Build, sign, and publish your app to Google Play and the App Store.",
                    "xp_reward": 280,
                    "hints": "Configure proper app icons and splash screens early. Understand code signing for iOS. Set up Android keystore securely. Test on real devices before release.",
                    "resources": json.dumps([
                        {"title": "Flutter Build & Release Android", "url": "https://flutter.dev/docs/deployment/android", "description": "Official Android deployment guide"},
                        {"title": "Flutter Build & Release iOS", "url": "https://flutter.dev/docs/deployment/ios", "description": "Official iOS deployment guide"},
                        {"title": "App Launch Checklist", "url": "https://github.com/Temidtech/flutter-app-store-checklist", "description": "Community Flutter store submission checklist"}
                    ]),
                },
            ],
        },
        {
            "name": "Blockchain & Web3",
            "slug": "blockchain-web3",
            "description": "Build decentralized applications, smart contracts, and understand the future of the internet.",
            "icon": "layers",
            "color": "#7c3aed",
            "milestones": [
                {
                    "title": "Blockchain Fundamentals",
                    "description": "Understand distributed ledgers, consensus mechanisms, and crypto basics.",
                    "xp_reward": 100,
                    "hints": "Study Bitcoin whitepaper first for the core concept. Understand proof-of-work vs proof-of-stake. Use Etherscan to explore real transactions.",
                    "resources": json.dumps([
                        {"title": "Bitcoin Whitepaper", "url": "https://bitcoin.org/bitcoin.pdf", "description": "Satoshi Nakamoto's original Bitcoin paper"},
                        {"title": "Blockchain Basics (Coursera)", "url": "https://www.coursera.org/learn/blockchain-basics", "description": "University at Buffalo blockchain fundamentals course"},
                        {"title": "Etherscan Block Explorer", "url": "https://etherscan.io/", "description": "Explore Ethereum blockchain transactions"}
                    ]),
                },
                {
                    "title": "Solidity & Smart Contracts",
                    "description": "Write, test, and deploy smart contracts on Ethereum.",
                    "xp_reward": 200,
                    "hints": "Use Remix IDE for quick experiments. Understand gas costs early. Always check for reentrancy vulnerabilities. Test on testnets before mainnet.",
                    "resources": json.dumps([
                        {"title": "Solidity Documentation", "url": "https://docs.soliditylang.org/", "description": "Official Solidity programming language docs"},
                        {"title": "CryptoZombies", "url": "https://cryptozombies.io/", "description": "Learn Solidity by building a zombie game"},
                        {"title": "Remix IDE", "url": "https://remix.ethereum.org/", "description": "Browser-based Solidity development environment"}
                    ]),
                },
                {
                    "title": "DeFi & Protocols",
                    "description": "Explore decentralized finance protocols like Uniswap and Aave.",
                    "xp_reward": 200,
                    "hints": "Interact with DeFi protocols on testnets first. Understand AMMs, liquidity pools, and yield farming. Analyze protocol TVL with DeFi Llama.",
                    "resources": json.dumps([
                        {"title": "DeFi Llama", "url": "https://defillama.com/", "description": "Track DeFi protocol analytics and TVL"},
                        {"title": "Uniswap Docs", "url": "https://docs.uniswap.org/", "description": "Uniswap v3 protocol documentation"},
                        {"title": "Finematics YouTube", "url": "https://www.youtube.com/@Finematics", "description": "Excellent DeFi educational videos"}
                    ]),
                },
                {
                    "title": "Web3 Frontend Integration",
                    "description": "Connect React apps to wallets and blockchains using ethers.js.",
                    "xp_reward": 200,
                    "hints": "Use wagmi and RainbowKit for easier wallet integration. Understand provider vs signer. Handle chain switching and transaction confirmations gracefully.",
                    "resources": json.dumps([
                        {"title": "wagmi Documentation", "url": "https://wagmi.sh/", "description": "React Hooks for Ethereum — the standard"},
                        {"title": "ethers.js Documentation", "url": "https://docs.ethers.io/v6/", "description": "The most popular Ethereum JavaScript library"},
                        {"title": "RainbowKit", "url": "https://www.rainbowkit.com/docs/introduction", "description": "Beautiful wallet connection UI components"}
                    ]),
                },
                {
                    "title": "NFT & dApp Project",
                    "description": "Build and deploy a complete decentralized application end-to-end.",
                    "xp_reward": 350,
                    "hints": "Build an NFT minting dApp using ERC-721 standard. Deploy contracts with Hardhat. Use IPFS for metadata storage. Test thoroughly on Sepolia testnet.",
                    "resources": json.dumps([
                        {"title": "Hardhat Documentation", "url": "https://hardhat.org/docs", "description": "Professional Ethereum development environment"},
                        {"title": "OpenZeppelin Contracts", "url": "https://docs.openzeppelin.com/contracts/", "description": "Secure, audited smart contract library"},
                        {"title": "NFT School", "url": "https://nftschool.dev/", "description": "Practical NFT development tutorials"}
                    ]),
                },
            ],
        },
        {
            "name": "System Design",
            "slug": "system-design",
            "description": "Design scalable, fault-tolerant distributed systems used by millions of users.",
            "icon": "server",
            "color": "#0f766e",
            "milestones": [
                {
                    "title": "Fundamentals of Scale",
                    "description": "Understand load balancers, caching, CDNs, and database replication.",
                    "xp_reward": 120,
                    "hints": "Study how Netflix, Twitter, and Uber handle scale. Understand horizontal vs vertical scaling trade-offs. Start with the CAP theorem.",
                    "resources": json.dumps([
                        {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "description": "The most comprehensive system design guide on GitHub"},
                        {"title": "High Scalability Blog", "url": "http://highscalability.com/", "description": "Real-world architecture case studies"},
                        {"title": "Designing Data-Intensive Applications (DDIA)", "url": "https://dataintensive.net/", "description": "The bible of distributed systems engineering"}
                    ]),
                },
                {
                    "title": "Databases at Scale",
                    "description": "Choose between SQL/NoSQL, sharding, and consistency models.",
                    "xp_reward": 150,
                    "hints": "Understand ACID vs BASE consistency. Learn when to use NoSQL (Cassandra, MongoDB) vs relational. Study indexing strategies and query optimization.",
                    "resources": json.dumps([
                        {"title": "Use The Index, Luke", "url": "https://use-the-index-luke.com/", "description": "SQL indexing and tuning guide for developers"},
                        {"title": "MongoDB Architecture Guide", "url": "https://www.mongodb.com/nosql-explained", "description": "NoSQL and MongoDB architecture explained"},
                        {"title": "Cassandra vs DynamoDB Comparison", "url": "https://aws.amazon.com/nosql/", "description": "AWS NoSQL database selection guide"}
                    ]),
                },
                {
                    "title": "Microservices & APIs",
                    "description": "Design service-oriented architectures with API gateways and service meshes.",
                    "xp_reward": 180,
                    "hints": "Understand bounded contexts from DDD. Design for failure — implement circuit breakers and retries. Use asynchronous messaging (Kafka/RabbitMQ) for decoupling.",
                    "resources": json.dumps([
                        {"title": "Microservices.io Patterns", "url": "https://microservices.io/patterns/", "description": "Catalogue of microservice architecture patterns"},
                        {"title": "Martin Fowler — Microservices", "url": "https://martinfowler.com/articles/microservices.html", "description": "The definitive microservices article"},
                        {"title": "gRPC Documentation", "url": "https://grpc.io/docs/", "description": "High-performance RPC framework for microservices"}
                    ]),
                },
                {
                    "title": "Message Queues & Streaming",
                    "description": "Build event-driven systems with Kafka, RabbitMQ, and Redis Streams.",
                    "xp_reward": 200,
                    "hints": "Understand producer-consumer patterns. Study at-least-once vs exactly-once delivery. Use Kafka for high-throughput streaming, RabbitMQ for task queues.",
                    "resources": json.dumps([
                        {"title": "Apache Kafka Documentation", "url": "https://kafka.apache.org/documentation/", "description": "Official Kafka distributed streaming platform docs"},
                        {"title": "RabbitMQ Tutorials", "url": "https://www.rabbitmq.com/getstarted.html", "description": "RabbitMQ getting started tutorials"},
                        {"title": "Kafka: The Definitive Guide (free)", "url": "https://www.confluent.io/resources/kafka-the-definitive-guide/", "description": "Free O'Reilly Kafka book by Confluent"}
                    ]),
                },
                {
                    "title": "Real System Design Interview",
                    "description": "Practice designing YouTube, Twitter, Uber, and WhatsApp at scale.",
                    "xp_reward": 350,
                    "hints": "For every system: clarify requirements → estimate scale → design data model → design components → identify bottlenecks. Time yourself to 45 minutes.",
                    "resources": json.dumps([
                        {"title": "Grokking the System Design Interview", "url": "https://www.designgurus.io/course/grokking-the-system-design-interview", "description": "The most popular system design interview prep course"},
                        {"title": "Exponent System Design", "url": "https://www.youtube.com/@tryExponent", "description": "YouTube channel with mock system design interviews"},
                        {"title": "ByteByteGo Newsletter", "url": "https://blog.bytebytego.com/", "description": "Alex Xu's system design newsletter and visual guides"}
                    ]),
                },
            ],
        },
        {
            "name": "Open Source Contribution",
            "slug": "open-source",
            "description": "Learn to contribute to real-world open source projects, build your GitHub profile, and collaborate globally.",
            "icon": "git-branch",
            "color": "#16a34a",
            "milestones": [
                {
                    "title": "Git Mastery",
                    "description": "Master Git workflows, branching strategies, and conflict resolution.",
                    "xp_reward": 90,
                    "hints": "Practice rebasing over merging for cleaner history. Learn git bisect for debugging. Understand detached HEAD state. Use git stash for context switching.",
                    "resources": json.dumps([
                        {"title": "Pro Git Book (free)", "url": "https://git-scm.com/book/en/v2", "description": "Complete free Git reference book"},
                        {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "description": "Interactive visual Git branching tutorial"},
                        {"title": "Git Workflows (Atlassian)", "url": "https://www.atlassian.com/git/tutorials/comparing-workflows", "description": "Comparing popular Git branching workflows"}
                    ]),
                },
                {
                    "title": "First Contribution",
                    "description": "Submit your first pull request to a real open source project.",
                    "xp_reward": 150,
                    "hints": "Start with 'good first issue' and 'help wanted' labels. Read CONTRIBUTING.md carefully. Make small, focused PRs. Write clear commit messages.",
                    "resources": json.dumps([
                        {"title": "First Contributions", "url": "https://firstcontributions.github.io/", "description": "Step-by-step guide to your first open source PR"},
                        {"title": "Good First Issues", "url": "https://goodfirstissue.dev/", "description": "Curated list of beginner-friendly OSS issues"},
                        {"title": "GitHub Open Source Guide", "url": "https://opensource.guide/how-to-contribute/", "description": "GitHub's official contributing to open source guide"}
                    ]),
                },
                {
                    "title": "Code Review Culture",
                    "description": "Learn to give and receive effective code reviews in OSS projects.",
                    "xp_reward": 130,
                    "hints": "Focus code reviews on correctness, readability, and tests — not style. Be specific, kind, and constructive. Respond to feedback promptly and gracefully.",
                    "resources": json.dumps([
                        {"title": "Code Review Best Practices (Google)", "url": "https://google.github.io/eng-practices/review/", "description": "Google's engineering code review guidelines"},
                        {"title": "How to Make Your Code Reviewer Fall in Love with You", "url": "https://mtlynch.io/code-review-love/", "description": "Writing great code review submissions"},
                        {"title": "Conventional Commits", "url": "https://www.conventionalcommits.org/", "description": "Standardized commit message specification"}
                    ]),
                },
                {
                    "title": "Own a Feature End-to-End",
                    "description": "Design, implement, and get merged a significant feature in a real project.",
                    "xp_reward": 250,
                    "hints": "Open an issue before starting significant work. Discuss your approach with maintainers. Write tests and update documentation. Be patient with review cycles.",
                    "resources": json.dumps([
                        {"title": "GitHub Skills", "url": "https://skills.github.com/", "description": "Interactive courses using real GitHub repos"},
                        {"title": "Open Source Friday", "url": "https://opensourcefriday.com/", "description": "Contribute to the world's software, every Friday"},
                        {"title": "CNCF Contributing Guide", "url": "https://contribute.cncf.io/", "description": "How to contribute to cloud-native projects"}
                    ]),
                },
                {
                    "title": "Start Your Own Project",
                    "description": "Create, document, and grow an open source project from scratch.",
                    "xp_reward": 350,
                    "hints": "Write an excellent README with clear install instructions and a demo. Add a CONTRIBUTING.md and CODE_OF_CONDUCT.md. Use GitHub Issues and Discussions for community.",
                    "resources": json.dumps([
                        {"title": "Make a README", "url": "https://www.makeareadme.com/", "description": "Template and guide for writing great READMEs"},
                        {"title": "Choose a License", "url": "https://choosealicense.com/", "description": "GitHub's guide to choosing an open source license"},
                        {"title": "Open Source Guides", "url": "https://opensource.guide/starting-a-project/", "description": "How to launch and grow an open source project"}
                    ]),
                },
            ],
        },
    ]
    return streams_data


@router.get("/seed")
def seed_roadmap_data(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    _seed_roadmap_data(session)
    count = session.exec(select(func.count(Stream.id))).one()
    return {"message": f"Seeded {count} streams with milestones"}


@router.get("/seed-additional")
def seed_additional_streams(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Add new streams that aren't already in the database. Admin only."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    added = _seed_additional_streams(session)
    count = session.exec(select(func.count(Stream.id))).one()
    return {"message": f"Added {added} new streams. Total: {count} streams."}
