import os
from sqlmodel import Session, select
from models import User, Problem, TestCase
from main import engine, create_db_and_tables
from auth import get_password_hash

def seed_db():
    create_db_and_tables()
    with Session(engine) as session:
        # Check admin
        admin = session.exec(select(User).where(User.username == "admin")).first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@minicode.com",
                full_name="System Admin",
                role="admin",
                hashed_password=get_password_hash("admin")
            )
            session.add(admin)
            
        # Check faculty
        faculty = session.exec(select(User).where(User.username == "facultyname")).first()
        if not faculty:
            faculty = User(
                username="facultyname",
                email="faculty@minicode.com",
                full_name="Faculty Member",
                role="faculty",
                hashed_password=get_password_hash("password")
            )
            session.add(faculty)
        
        session.commit()
        
        # Make sure faculty exists for reference
        faculty = session.exec(select(User).where(User.username == "facultyname")).first()
            
        # Seed sample problems with test cases
        existing = session.exec(select(Problem)).all()
        if not existing:
            # Problem 1: Two Sum
            p1 = Problem(
                title="Two Sum",
                description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
                difficulty="Easy",
                input_format="First line: space-separated integers (nums)\nSecond line: integer (target)",
                output_format="Two space-separated integers (indices)",
                author_id=faculty.id if faculty else None
            )
            session.add(p1)
            session.commit()
            session.refresh(p1)
            
            session.add_all([
                TestCase(problem_id=p1.id, input_data="2 7 11 15\n9", expected_output="0 1", is_sample=True),
                TestCase(problem_id=p1.id, input_data="3 2 4\n6", expected_output="1 2", is_sample=True),
                TestCase(problem_id=p1.id, input_data="3 3\n6", expected_output="0 1", is_sample=True),
            ])
            
            # Problem 2: Hello World
            p2 = Problem(
                title="Hello World",
                description="Write a program that prints 'Hello World' to the standard output.",
                difficulty="Easy",
                input_format="No input",
                output_format="Hello World",
                author_id=faculty.id if faculty else None
            )
            session.add(p2)
            session.commit()
            session.refresh(p2)
            
            session.add_all([
                TestCase(problem_id=p2.id, input_data="", expected_output="Hello World", is_sample=True),
            ])
            
            # Problem 3: FizzBuzz
            p3 = Problem(
                title="FizzBuzz",
                description="Given an integer n, return a list of strings where:\n- For multiples of 3, print 'Fizz'\n- For multiples of 5, print 'Buzz'\n- For multiples of both 3 and 5, print 'FizzBuzz'\n- Otherwise print the number\n\nPrint each result on a new line.",
                difficulty="Easy",
                input_format="Single integer n",
                output_format="n lines of FizzBuzz output",
                author_id=faculty.id if faculty else None
            )
            session.add(p3)
            session.commit()
            session.refresh(p3)
            
            session.add_all([
                TestCase(problem_id=p3.id, input_data="5", expected_output="1\n2\nFizz\n4\nBuzz", is_sample=True),
                TestCase(problem_id=p3.id, input_data="15", expected_output="1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", is_sample=True),
            ])

            # Problem 4: Reverse String
            p4 = Problem(
                title="Reverse String",
                description="Write a function that reverses a string. The input string is given as a single line.",
                difficulty="Easy",
                input_format="A single string",
                output_format="The reversed string",
                author_id=faculty.id if faculty else None
            )
            session.add(p4)
            session.commit()
            session.refresh(p4)

            session.add_all([
                TestCase(problem_id=p4.id, input_data="hello", expected_output="olleh", is_sample=True),
                TestCase(problem_id=p4.id, input_data="Hannah", expected_output="hannaH", is_sample=True),
            ])

            # Problem 5: Maximum Subarray
            p5 = Problem(
                title="Maximum Subarray",
                description="Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
                difficulty="Medium",
                input_format="Space-separated integers",
                output_format="Single integer (maximum subarray sum)",
                author_id=faculty.id if faculty else None
            )
            session.add(p5)
            session.commit()
            session.refresh(p5)

            session.add_all([
                TestCase(problem_id=p5.id, input_data="-2 1 -3 4 -1 2 1 -5 4", expected_output="6", is_sample=True),
                TestCase(problem_id=p5.id, input_data="1", expected_output="1", is_sample=True),
                TestCase(problem_id=p5.id, input_data="5 4 -1 7 8", expected_output="23", is_sample=True),
            ])

            session.commit()
            print("Seeded 5 problems with test cases.")
        else:
            # Add test cases to existing problems if they don't have any
            for p in existing:
                tc_count = len(session.exec(select(TestCase).where(TestCase.problem_id == p.id)).all())
                if tc_count == 0:
                    if "hello" in p.title.lower():
                        session.add(TestCase(problem_id=p.id, input_data="", expected_output="Hello World", is_sample=True))
                    elif "two sum" in p.title.lower():
                        session.add_all([
                            TestCase(problem_id=p.id, input_data="2 7 11 15\n9", expected_output="0 1", is_sample=True),
                            TestCase(problem_id=p.id, input_data="3 2 4\n6", expected_output="1 2", is_sample=True),
                        ])
                    else:
                        session.add(TestCase(problem_id=p.id, input_data="sample input", expected_output="sample output", is_sample=True))
            session.commit()
            print("Added test cases to existing problems.")
        
        print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
