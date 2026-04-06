import logging
from sqlmodel import Session, select, func
from database import engine
from models import User, Submission, Problem
from utils_cache import invalidate_leaderboard_cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

XP_TO_LEVEL = {
    0: 1,
    100: 2,
    300: 3,
    600: 4,
    1000: 5,
    1500: 6,
}


def calculate_unlocked_level_from_xp(xp: int) -> int:
    unlocked = 1
    for threshold, lvl in sorted(XP_TO_LEVEL.items(), key=lambda x: x[0], reverse=True):
        if xp >= threshold:
            unlocked = lvl
            break
    return unlocked


def sync_all_users_xp():
    """
    Recalculates XP for all students based on their highest accepted submission score per problem.
    Also updates unlocked levels based on XP thresholds.
    """
    with Session(engine) as session:
        students = session.exec(select(User).where(User.role == "student")).all()
        logger.info(f"Synchronizing XP for {len(students)} students...")

        total_updated = 0
        for student in students:
            statement = (
                select(
                    Submission.problem_id, func.max(Submission.score).label("max_score")
                )
                .where(Submission.user_id == student.id)
                .where(Submission.status == "accepted")
                .group_by(Submission.problem_id)
            )
            best_scores = session.exec(statement).all()

            new_total_xp = 0
            for problem_id, max_score in best_scores:
                problem = session.get(Problem, problem_id)
                if problem:
                    xp_reward = getattr(problem, "xp_reward", 100)
                    xp_earned = int((max_score / 100.0) * xp_reward)
                    new_total_xp += xp_earned

            needs_commit = False
            if student.xp != new_total_xp:
                logger.info(
                    f"Updating {student.username}: {student.xp} -> {new_total_xp} XP"
                )
                student.xp = new_total_xp
                session.add(student)
                needs_commit = True

            new_level = calculate_unlocked_level_from_xp(new_total_xp)
            current_level = student.unlocked_level or 1
            if new_level > current_level:
                logger.info(
                    f"Leveling up {student.username}: Level {current_level} -> Level {new_level}"
                )
                student.unlocked_level = new_level
                session.add(student)
                needs_commit = True
                if new_level > current_level:
                    from models import Notification
                    from datetime import datetime, UTC

                    notification = Notification(
                        user_id=student.id,
                        title="Level Up!",
                        message=f"Congratulations! You've reached Level {new_level}!",
                        notification_type="achievement",
                        created_at=datetime.now(UTC),
                    )
                    session.add(notification)

            if needs_commit:
                total_updated += 1

        session.commit()
        logger.info(f"Successfully synchronized XP for {total_updated} users.")

        invalidate_leaderboard_cache()
        return total_updated


if __name__ == "__main__":
    sync_all_users_xp()
