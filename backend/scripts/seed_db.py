import sys
import os
from sqlmodel import Session, select
from datetime import datetime, timezone

# Add the parent directory to sys.path to allow importing from core.database and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from core.models import User, Problem, TestCase
from services.auth import get_password_hash


def seed_database():
    with Session(engine) as session:
        print("Checking database for default users...")

        # Ensure Admin exists
        admin_statement = select(User).where(User.username == "admin")
        admin = session.exec(admin_statement).first()
        if not admin:
            print("Creating default admin...")
            admin = User(
                username="admin",
                email="admin@minicode.ai",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                xp=0,
                unlocked_level=99,
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)

        # Ensure Faculty exists
        faculty_statement = select(User).where(User.username == "faculty")
        faculty = session.exec(faculty_statement).first()
        if not faculty:
            print("Creating default faculty...")
            faculty = User(
                username="faculty",
                email="faculty@minicode.ai",
                full_name="Lead Professor",
                hashed_password=get_password_hash("faculty123"),
                role="faculty",
                xp=0,
                unlocked_level=99,
            )
            session.add(faculty)
            session.commit()
            session.refresh(faculty)
        else:
            faculty.unlocked_level = 99
            session.add(faculty)
            session.commit()
            session.refresh(faculty)

        # Ensure Student exists
        student_statement = select(User).where(User.username == "student")
        student = session.exec(student_statement).first()
        if not student:
            print("Creating default student...")
            student = User(
                username="student",
                email="student@minicode.ai",
                full_name="Early Adopter Student",
                hashed_password=get_password_hash("student123"),
                role="student",
                xp=0,
                unlocked_level=1,
            )
            session.add(student)
            session.commit()
            session.refresh(student)
        else:
            # Update student unlocked_level if not set
            if student.unlocked_level is None or student.unlocked_level < 1:
                student.unlocked_level = 1
                session.add(student)
                session.commit()

        # Ensure Alumni exists
        alumni_statement = select(User).where(User.username == "alumni")
        alumni = session.exec(alumni_statement).first()
        if not alumni:
            print("Creating default alumni...")
            alumni = User(
                username="alumni",
                email="alumni@minicode.ai",
                full_name="Alumni Graduate",
                hashed_password=get_password_hash("alumni123"),
                role="alumni",
                xp=0,
                unlocked_level=99,
            )
            session.add(alumni)
            session.commit()
            session.refresh(alumni)
        else:
            alumni.unlocked_level = 99
            session.add(alumni)
            session.commit()
            session.refresh(alumni)

        # Create problems with levels
        from scripts.problems_data import problems_data

        for prob_data in problems_data:
            problem_statement = select(Problem).where(
                Problem.title == prob_data["title"]
            )
            problem = session.exec(problem_statement).first()

            if not problem:
                print(
                    f"Creating problem: {prob_data['title']} (Level {prob_data['level']})"
                )
                test_cases_data = prob_data.get("test_cases", [])
                prob_fields = {k: v for k, v in prob_data.items() if k != "test_cases"}
                problem = Problem(**prob_fields, author_id=faculty.id)
                session.add(problem)
                session.commit()
                session.refresh(problem)


                for tc_data in test_cases_data:
                    tc = TestCase(
                        problem_id=problem.id,
                        input_data=tc_data["input"],
                        expected_output=tc_data["expected"],
                        is_sample=tc_data["is_sample"],
                    )
                    session.add(tc)
                session.commit()

        print("Seeding process completed.")


if __name__ == "__main__":
    seed_database()
