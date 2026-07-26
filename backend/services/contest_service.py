import json
import logging
from datetime import datetime, timezone

from sqlmodel import Session, select

from core.models import Submission, User
from core.models_contests import Contest, ContestParticipant, ContestSubmission

logger = logging.getLogger(__name__)


def create_contest(session: Session, data: dict, user_id: int) -> Contest:
    contest = Contest(
        title=data["title"],
        description=data.get("description", ""),
        start_time=data["start_time"],
        end_time=data["end_time"],
        registration_deadline=data.get("registration_deadline"),
        duration_minutes=data.get("duration_minutes", 120),
        problems_json=json.dumps(data.get("problem_ids"))
        if data.get("problem_ids")
        else None,
        rules=data.get("rules"),
        scoring_type=data.get("scoring_type", "standard"),
        status="draft",
        created_by=user_id,
    )
    session.add(contest)
    session.commit()
    session.refresh(contest)
    return contest


def register_for_contest(session: Session, contest_id: int, user_id: int) -> ContestParticipant:
    contest = session.get(Contest, contest_id)
    if not contest:
        raise ValueError("Contest not found")
    if contest.status not in ("upcoming", "active"):
        raise ValueError("Contest is not open for registration")
    if contest.registration_deadline and datetime.now(timezone.utc) > contest.registration_deadline:
        raise ValueError("Registration deadline has passed")

    existing = session.exec(
        select(ContestParticipant).where(
            ContestParticipant.contest_id == contest_id,
            ContestParticipant.user_id == user_id,
        )
    ).first()
    if existing:
        raise ValueError("Already registered for this contest")

    participant = ContestParticipant(
        contest_id=contest_id,
        user_id=user_id,
    )
    session.add(participant)
    session.commit()
    session.refresh(participant)
    return participant


def start_attempt(session: Session, contest_id: int, user_id: int) -> dict:
    contest = session.get(Contest, contest_id)
    if not contest:
        raise ValueError("Contest not found")
    if contest.status != "active":
        raise ValueError("Contest is not active")

    participant = session.exec(
        select(ContestParticipant).where(
            ContestParticipant.contest_id == contest_id,
            ContestParticipant.user_id == user_id,
        )
    ).first()
    if not participant:
        raise ValueError("Not registered for this contest")
    if participant.started_at:
        elapsed = (datetime.now(timezone.utc) - participant.started_at).total_seconds()
        remaining = contest.duration_minutes * 60 - elapsed
        return {
            "started_at": participant.started_at.isoformat(),
            "remaining_seconds": max(0, int(remaining)),
        }

    participant.started_at = datetime.now(timezone.utc)
    session.add(participant)
    session.commit()

    return {
        "started_at": participant.started_at.isoformat(),
        "remaining_seconds": contest.duration_minutes * 60,
    }


def submit_solution(
    session: Session,
    contest_id: int,
    user_id: int,
    problem_index: str,
    code: str,
    language: str = "python",
) -> dict:
    contest = session.get(Contest, contest_id)
    if not contest:
        raise ValueError("Contest not found")
    if contest.status != "active":
        raise ValueError("Contest is not active")

    participant = session.exec(
        select(ContestParticipant).where(
            ContestParticipant.contest_id == contest_id,
            ContestParticipant.user_id == user_id,
        )
    ).first()
    if not participant:
        raise ValueError("Not registered for this contest")
    if not participant.started_at:
        raise ValueError("Must start the attempt before submitting")

    elapsed = (datetime.now(timezone.utc) - participant.started_at).total_seconds()
    if elapsed > contest.duration_minutes * 60:
        raise ValueError("Time limit exceeded")

    problem_ids = json.loads(contest.problems_json) if contest.problems_json else []
    problem_index_int = ord(problem_index.upper()) - ord("A")
    if problem_index_int < 0 or problem_index_int >= len(problem_ids):
        raise ValueError("Invalid problem index")

    problem_id = problem_ids[problem_index_int]

    submission = Submission(
        user_id=user_id,
        problem_id=problem_id,
        code_content=code,
        language=language,
        status="pending",
    )
    session.add(submission)
    session.flush()

    contest_sub = ContestSubmission(
        contest_id=contest_id,
        user_id=user_id,
        problem_index=problem_index.upper(),
        submission_id=submission.id,
        time_taken_seconds=int(elapsed),
    )
    session.add(contest_sub)
    session.commit()

    return {"submission_id": submission.id, "contest_submission_id": contest_sub.id}


def get_standings(session: Session, contest_id: int) -> list[dict]:
    contest = session.get(Contest, contest_id)
    if not contest:
        raise ValueError("Contest not found")

    participants = session.exec(
        select(ContestParticipant)
        .where(ContestParticipant.contest_id == contest_id)
        .order_by(ContestParticipant.score.desc())
    ).all()

    result = []
    for idx, p in enumerate(participants):
        user = session.get(User, p.user_id)
        submissions = session.exec(
            select(ContestSubmission).where(
                ContestSubmission.contest_id == contest_id,
                ContestSubmission.user_id == p.user_id,
            )
        ).all()

        result.append(
            {
                "rank": idx + 1,
                "user_id": p.user_id,
                "username": user.username if user else "Unknown",
                "full_name": user.full_name if user else None,
                "avatar_url": user.avatar_url if user else None,
                "score": p.score,
                "started_at": p.started_at.isoformat() if p.started_at else None,
                "finished_at": p.finished_at.isoformat() if p.finished_at else None,
                "submissions": [
                    {
                        "problem_index": s.problem_index,
                        "score": s.score,
                        "time_taken_seconds": s.time_taken_seconds,
                        "submitted_at": s.submitted_at.isoformat(),
                    }
                    for s in submissions
                ],
            }
        )

    return result


def end_contest(session: Session, contest_id: int) -> dict:
    contest = session.get(Contest, contest_id)
    if not contest:
        raise ValueError("Contest not found")

    contest.status = "completed"
    contest.updated_at = datetime.now(timezone.utc)

    participants = session.exec(
        select(ContestParticipant)
        .where(ContestParticipant.contest_id == contest_id)
        .order_by(ContestParticipant.score.desc())
    ).all()

    xp_map = {1: 500, 2: 300, 3: 150}
    awarded = []

    for idx, p in enumerate(participants):
        p.rank = idx + 1
        p.finished_at = datetime.now(timezone.utc)

        if idx < 3:
            xp_reward = xp_map.get(idx + 1, 0)
            user = session.get(User, p.user_id)
            if user:
                user.xp = (user.xp or 0) + xp_reward
                session.add(user)
                awarded.append({"user_id": p.user_id, "username": user.username, "xp": xp_reward})

        session.add(p)

    session.add(contest)
    session.commit()

    return {"message": "Contest ended", "top_3_awarded": awarded}
