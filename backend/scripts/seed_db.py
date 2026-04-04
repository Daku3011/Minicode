import sys
import os
from sqlmodel import Session, select
from datetime import datetime

# Add the parent directory to sys.path to allow importing from database and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import User, Problem, TestCase
from auth import get_password_hash

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
                xp=0
            )
            session.add(admin)
        
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
                xp=0
            )
            session.add(faculty)
            
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
                xp=100
            )
            session.add(student)
        
        session.commit()
        session.refresh(admin)
        session.refresh(faculty)
        
        # Check for problems
        problem_statement = select(Problem).where(Problem.title == "Two Sum")
        problem = session.exec(problem_statement).first()
        if not problem:
            print("Creating sample problem...")
            problem = Problem(
                title="Two Sum",
                description="""
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
**Input:** `nums = [2,7,11,15], target = 9`
**Output:** `[0,1]`
**Explanation:** Because `nums[0] + nums[1] == 9`, we return `[0, 1]`.

### Constraints:
* `2 <= nums.length <= 10^4`
* `-10^9 <= nums[i] <= 10^9`
* `-10^9 <= target <= 10^9`
                """,
                difficulty="Easy",
                level=1,
                subject="algorithms",
                author_id=faculty.id,
                input_format="List of integers `nums` and an integer `target`",
                output_format="List of two integers",
                constraints="O(n^2) or better complexity",
                hints="Use a hash map for O(n) complexity!"
            )
            session.add(problem)
            session.commit()
            session.refresh(problem)
            
            # Add Test Cases
            test_cases = [
                TestCase(problem_id=problem.id, input_data="[2, 7, 11, 15], 9", expected_output="[0, 1]", is_sample=True),
                TestCase(problem_id=problem.id, input_data="[3, 2, 4], 6", expected_output="[1, 2]", is_sample=True),
                TestCase(problem_id=problem.id, input_data="[3, 3], 6", expected_output="[0, 1]", is_sample=False),
            ]
            for tc in test_cases:
                session.add(tc)
            session.commit()

        print("Seeding process completed.")

if __name__ == "__main__":
    seed_database()
