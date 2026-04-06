import logging
from sqlmodel import Session, select, func
from database import engine
from models import User, Submission, Problem
from utils_cache import invalidate_leaderboard_cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def sync_all_users_xp():
    """
    Recalculates XP for all students based on their highest accepted submission score per problem.
    """
    with Session(engine) as session:
        # Get all users with 'student' role
        students = session.exec(select(User).where(User.role == "student")).all()
        logger.info(f"Synchronizing XP for {len(students)} students...")

        total_updated = 0
        for student in students:
            # Get best accepted score per problem for this student
            # We subquery to get max score per problem_id for this user
            statement = (
                select(Submission.problem_id, func.max(Submission.score).label("max_score"))
                .where(Submission.user_id == student.id)
                .where(Submission.status == "accepted")
                .group_by(Submission.problem_id)
            )
            best_scores = session.exec(statement).all()

            new_total_xp = 0
            for problem_id, max_score in best_scores:
                problem = session.get(Problem, problem_id)
                if problem:
                    # Calculate XP: (score / 100) * problem.xp_reward
                    xp_reward = getattr(problem, "xp_reward", 100)
                    xp_earned = int((max_score / 100.0) * xp_reward)
                    new_total_xp += xp_earned
            
            if student.xp != new_total_xp:
                logger.info(f"Updating {student.username}: {student.xp} -> {new_total_xp} XP")
                student.xp = new_total_xp
                session.add(student)
                total_updated += 1
        
        session.commit()
        logger.info(f"Successfully synchronized XP for {total_updated} users.")
        
        # Invalidate leaderboard after global sync
        invalidate_leaderboard_cache()
        return total_updated

if __name__ == "__main__":
    sync_all_users_xp()
