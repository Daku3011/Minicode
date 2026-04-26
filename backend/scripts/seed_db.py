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
                session.refresh(student)

        # Create problems with levels
        problems_data = [
            {
                "title": "Two Sum",
                "description": """Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

### Example 1:
**Input:** `nums = [2,7,11,15], target = 9`
**Output:** `[0,1]`

### Constraints:
* `2 <= nums.length <= 10^4`
* `-10^9 <= nums[i] <= 10^9`""",
                "difficulty": "Easy",
                "level": 1,
                "subject": "algorithms",
                "xp_reward": 100,
                "input_format": "List of integers `nums` and an integer `target`",
                "output_format": "List of two integers",
                "constraints": "O(n) time complexity",
                "hints": "Use a hash map for O(n) complexity!",
                "test_cases": [
                    {
                        "input": "[2, 7, 11, 15], 9",
                        "expected": "[0, 1]",
                        "is_sample": True,
                    },
                    {"input": "[3, 2, 4], 6", "expected": "[1, 2]", "is_sample": True},
                    {"input": "[3, 3], 6", "expected": "[0, 1]", "is_sample": False},
                ],
            },
            {
                "title": "Reverse Linked List",
                "description": """Given the head of a singly linked list, reverse the list, and return the reversed list.

### Example 1:
**Input:** `head = [1,2,3,4,5]`
**Output:** `[5,4,3,2,1]`

### Constraints:
* The number of nodes in the list is in the range `[0, 5000]`.""",
                "difficulty": "Easy",
                "level": 1,
                "subject": "data-structures",
                "xp_reward": 100,
                "input_format": "Head of linked list",
                "output_format": "Reversed linked list",
                "constraints": "O(n) time, O(1) space",
                "hints": "Use three pointers: prev, curr, next",
                "test_cases": [
                    {
                        "input": "[1,2,3,4,5]",
                        "expected": "[5,4,3,2,1]",
                        "is_sample": True,
                    },
                    {"input": "[1,2]", "expected": "[2,1]", "is_sample": True},
                    {"input": "[]", "expected": "[]", "is_sample": False},
                ],
            },
            {
                "title": "Valid Parentheses",
                "description": """Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

### Example 1:
**Input:** `s = "()"`
**Output:** `true`

### Example 2:
**Input:** `s = "()[]{}"`
**Output:** `true`

### Constraints:
* `1 <= s.length <= 10^4`""",
                "difficulty": "Easy",
                "level": 2,
                "subject": "data-structures",
                "xp_reward": 150,
                "input_format": "String of brackets",
                "output_format": "Boolean",
                "constraints": "Use a stack",
                "hints": "Use a stack to track opening brackets",
                "test_cases": [
                    {"input": "()", "expected": "true", "is_sample": True},
                    {"input": "()[]{}", "expected": "true", "is_sample": True},
                    {"input": "(]", "expected": "false", "is_sample": False},
                ],
            },
            {
                "title": "Maximum Subarray",
                "description": """Given an integer array `nums`, find the subarray with the largest sum, and return its sum.

### Example 1:
**Input:** `nums = [-2,1,-3,4,-1,2,1,-5,4]`
**Output:** `6`

### Constraints:
* `1 <= nums.length <= 10^5`
* `-10^4 <= nums[i] <= 10^4`""",
                "difficulty": "Medium",
                "level": 3,
                "subject": "algorithms",
                "xp_reward": 200,
                "input_format": "Array of integers",
                "output_format": "Integer (maximum sum)",
                "constraints": "Kadane's algorithm in O(n)",
                "hints": "Think about Kadane's algorithm",
                "test_cases": [
                    {
                        "input": "[-2,1,-3,4,-1,2,1,-5,4]",
                        "expected": "6",
                        "is_sample": True,
                    },
                    {"input": "[1]", "expected": "1", "is_sample": True},
                    {"input": "[5,4,-1,7,8]", "expected": "23", "is_sample": False},
                ],
            },
            {
                "title": "Merge Intervals",
                "description": """Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals.

### Example 1:
**Input:** `intervals = [[1,3],[2,6],[8,10],[15,18]]`
**Output:** `[[1,6],[8,10],[15,18]]`

### Constraints:
* `1 <= intervals.length <= 10^4`
* `intervals[i].length == 2`""",
                "difficulty": "Medium",
                "level": 4,
                "subject": "algorithms",
                "xp_reward": 250,
                "input_format": "Array of intervals",
                "output_format": "Merged intervals",
                "constraints": "Sort and merge",
                "hints": "Sort intervals by start time",
                "test_cases": [
                    {
                        "input": "[[1,3],[2,6],[8,10],[15,18]]",
                        "expected": "[[1,6],[8,10],[15,18]]",
                        "is_sample": True,
                    },
                    {
                        "input": "[[1,4],[4,5]]",
                        "expected": "[[1,5]]",
                        "is_sample": True,
                    },
                ],
            },
            {
                "title": "Longest Palindromic Substring",
                "description": """Given a string `s`, return the longest palindromic substring in `s`.

### Example 1:
**Input:** `s = "babad"`
**Output:** `"bab"`

### Constraints:
* `1 <= s.length <= 1000`
* `s` consist of only digits and English letters.""",
                "difficulty": "Hard",
                "level": 5,
                "subject": "algorithms",
                "xp_reward": 350,
                "input_format": "String",
                "output_format": "Longest palindrome",
                "constraints": "O(n^2) or better",
                "hints": "Expand around center technique",
                "test_cases": [
                    {"input": "babad", "expected": "bab", "is_sample": True},
                    {"input": "cbbd", "expected": "bb", "is_sample": True},
                ],
            },
        ]

        for prob_data in problems_data:
            problem_statement = select(Problem).where(
                Problem.title == prob_data["title"]
            )
            problem = session.exec(problem_statement).first()

            if not problem:
                print(
                    f"Creating problem: {prob_data['title']} (Level {prob_data['level']})"
                )
                test_cases_data = prob_data.pop("test_cases")
                problem = Problem(**prob_data, author_id=faculty.id)
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
