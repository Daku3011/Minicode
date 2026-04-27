import os
import json
import sys
import asyncio
from google import genai
from google.genai import types
from sqlmodel import Session, select

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.database import engine
from core.models import User, Problem, TestCase

PROBLEMS_TO_GENERATE = [
    # AI / MACHINE LEARNING BASICS
    {"title": "Deepfake Detection System", "category": "AI / Machine Learning Basics", "difficulty": "Hard", "level": 6, "xp_reward": 500},
    {"title": "Real-Time Trend Analyzer", "category": "AI / Machine Learning Basics", "difficulty": "Medium", "level": 4, "xp_reward": 250},
    {"title": "Tamper-Proof Voting", "category": "AI / Machine Learning Basics", "difficulty": "Hard", "level": 5, "xp_reward": 350},
    {"title": "Load Balancer Optimization", "category": "AI / Machine Learning Basics", "difficulty": "Medium", "level": 4, "xp_reward": 250},
    {"title": "Live Ride Matching", "category": "AI / Machine Learning Basics", "difficulty": "Medium", "level": 3, "xp_reward": 200},
    {"title": "Search Engine Ranking", "category": "AI / Machine Learning Basics", "difficulty": "Medium", "level": 3, "xp_reward": 200},

    # ARRAYS & HASHING
    {"title": "Warehouse Inventory Mismatch", "category": "Arrays & Hashing", "difficulty": "Easy", "level": 1, "xp_reward": 100},
    {"title": "Suspicious Transaction Pair", "category": "Arrays & Hashing", "difficulty": "Easy", "level": 1, "xp_reward": 100},
    {"title": "Most Frequent Product", "category": "Arrays & Hashing", "difficulty": "Easy", "level": 1, "xp_reward": 100},
    {"title": "Subarray with Target Sum", "category": "Arrays & Hashing", "difficulty": "Medium", "level": 2, "xp_reward": 150},
    {"title": "Longest Unique Session", "category": "Arrays & Hashing", "difficulty": "Medium", "level": 3, "xp_reward": 200},

    # GRAPH THEORY
    {"title": "City Connectivity", "category": "Graph Theory", "difficulty": "Medium", "level": 3, "xp_reward": 200},
    {"title": "Shortest Delivery Route", "category": "Graph Theory", "difficulty": "Hard", "level": 5, "xp_reward": 350},
    {"title": "Connected Networks", "category": "Graph Theory", "difficulty": "Medium", "level": 4, "xp_reward": 250},
    {"title": "Cycle Detection", "category": "Graph Theory", "difficulty": "Medium", "level": 4, "xp_reward": 250},
    {"title": "Minimum Spanning Cost", "category": "Graph Theory", "difficulty": "Hard", "level": 5, "xp_reward": 350},

    # FINTECH / REAL-TIME
    {"title": "Daily Spending Alert", "category": "Fintech / Real-Time", "difficulty": "Easy", "level": 1, "xp_reward": 100},
    {"title": "Duplicate Transaction", "category": "Fintech / Real-Time", "difficulty": "Easy", "level": 2, "xp_reward": 150},
    {"title": "Average Spike", "category": "Fintech / Real-Time", "difficulty": "Medium", "level": 3, "xp_reward": 200},
    {"title": "Fraud Location Jump", "category": "Fintech / Real-Time", "difficulty": "Hard", "level": 5, "xp_reward": 350},
    {"title": "Real-Time Fraud Score", "category": "Fintech / Real-Time", "difficulty": "Hard", "level": 6, "xp_reward": 500},
]

SUBJECT_MAP = {
    "AI / Machine Learning Basics": "algorithms",
    "Arrays & Hashing": "data-structures",
    "Graph Theory": "graphs",
    "Fintech / Real-Time": "algorithms",
}

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set!")
        return

    client = genai.Client(api_key=api_key)

    with Session(engine) as session:
        faculty = session.exec(select(User).where(User.username == "faculty")).first()
        if not faculty:
            print("Faculty user not found!")
            return

        for p_info in PROBLEMS_TO_GENERATE:
            print(f"Generating: {p_info['title']}")
            subject = SUBJECT_MAP.get(p_info['category'], 'algorithms')
            
            prompt = f"""
            You are an elite curriculum designer for a technical coding platform. 
            Generate a professional, high-fidelity coding problem based on the following details:
            - Title: {p_info['title']}
            - Category: {p_info['category']}
            - Difficulty: {p_info['difficulty']}
            
            Your output MUST be a single valid JSON object with the following keys. No backticks, no ```json wrappers. Just JSON.
            Keys:
            'title': exactly '{p_info['title']}'
            'description': Comprehensive, visually polished problem statement in Markdown (include examples like Example 1, Constraints, etc.).
            'input_format': String describing the inputs.
            'output_format': String describing the output.
            'constraints': Time & space complexity rules.
            'hints': Useful small hint.
            'test_cases': List of at least 3 test case objects. Each must have:
                - 'input': String representation of input (e.g., "[1, 2, 3], 5")
                - 'expected': String representation of expected output (e.g., "[0, 1]")
                - 'is_sample': boolean
            """
            
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                p_data = json.loads(response.text.strip())
                
                # Insert into DB
                existing_problem = session.exec(select(Problem).where(Problem.title == p_data['title'])).first()
                if not existing_problem:
                    print(f"Adding {p_data['title']} to DB...")
                    prob = Problem(
                        title=p_data['title'],
                        description=p_data['description'],
                        difficulty=p_info['difficulty'],
                        level=p_info['level'],
                        subject=subject,
                        xp_reward=p_info['xp_reward'],
                        input_format=p_data['input_format'],
                        output_format=p_data['output_format'],
                        constraints=p_data['constraints'],
                        hints=p_data['hints'],
                        author_id=faculty.id,
                        is_deleted=False
                    )
                    session.add(prob)
                    session.commit()
                    session.refresh(prob)
                    
                    for tc in p_data['test_cases']:
                        test_case = TestCase(
                            problem_id=prob.id,
                            input_data=str(tc['input']),
                            expected_output=str(tc['expected']),
                            is_sample=tc.get('is_sample', False)
                        )
                        session.add(test_case)
                    session.commit()
                    print(f"Successfully added: {p_data['title']}")
                else:
                    print(f"{p_data['title']} already exists.")
                    
            except Exception as e:
                print(f"Failed to generate {p_info['title']}: {e}")
                
        print("All problems processed.")

if __name__ == "__main__":
    asyncio.run(main())
