import os
import sys
# Add parent directory to path to allow importing database.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, func
from database import engine
from models import User, Submission
from models_events import EventParticipant
from utils_cache import invalidate_leaderboard_cache

def sync_all_users_xp():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Syncing XP for {len(users)} users...")
        
        for user in users:
            # 1. Calculate Problem XP (sum of max scores for each accepted problem)
            # We fetch max score per problem then sum them up
            from sqlmodel import text
            # Using raw SQL for the nested aggregation which can be tricky in SQLModel sometimes
            query = text("""
                SELECT SUM(max_score) FROM (
                    SELECT MAX(score) as max_score 
                    FROM submission 
                    WHERE user_id = :user_id AND status = 'accepted'
                    GROUP BY problem_id
                ) as sub
            """)
            problem_xp = session.execute(query, {"user_id": user.id}).scalar() or 0
            
            # 2. Calculate Event XP (sum of xp_awarded in event_participants)
            event_xp = session.exec(
                select(func.sum(EventParticipant.xp_awarded))
                .where(EventParticipant.user_id == user.id)
            ).first() or 0
            
            new_total_xp = int(problem_xp or 0) + int(event_xp or 0)
            
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
