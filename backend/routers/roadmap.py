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
