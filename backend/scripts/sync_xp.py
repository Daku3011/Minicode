import os
import sys
# Add parent directory to path to allow importing main.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, create_engine, select, func
from models import User, Submission, Problem
from models_events import EventParticipant
from main import invalidate_leaderboard_cache

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/minicode")
engine = create_engine(DATABASE_URL)

def sync_all_users_xp():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Syncing XP for {len(users)} users...")
        
        for user in users:
            # 1. Calculate Problem XP (sum of max scores for each accepted problem)
            # Use distinct problem_id to ensure we only take the best score per problem
            subquery = (
                select(
                    Submission.problem_id,
                    func.max(Submission.score).label("max_score")
                )
                .where(Submission.user_id == user.id)
                .where(Submission.status == "accepted")
                .group_by(Submission.problem_id)
                .subquery()
            )
            
            problem_xp = session.exec(select(func.sum(subquery.c.max_score))).first() or 0
            
            # 2. Calculate Event XP (sum of xp_awarded in event_participants)
            event_xp = session.exec(
                select(func.sum(EventParticipant.xp_awarded))
                .where(EventParticipant.user_id == user.id)
            ).first() or 0
            
            new_total_xp = int(problem_xp) + int(event_xp)
            
            print(f"User: {user.username} | Old XP: {user.xp} | Problem XP: {problem_xp} | Event XP: {event_xp} | New Total: {new_total_xp}")
            
            user.xp = new_total_xp
            session.add(user)
        
        session.commit()
        print("XP Synchronization complete!")
        # Trigger leaderboard cache invalidation
        invalidate_leaderboard_cache()
        print("Leaderboard cache invalidated.")

if __name__ == "__main__":
    sync_all_users_xp()
