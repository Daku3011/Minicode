import os
import json
from google import genai
from models import Submission, TestCase, User, Problem
from github import Github

async def run_ai_judge(user_code: str, problem_desc: str, test_cases_info: str, persona: str = "standard"):
    """
    Uses Gemini to analyze the code, act as judge, and provide feedback + score.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, "AI Judge unavailable (API key missing)."
    
    client = genai.Client(api_key=api_key)
    
    persona_prompts = {
        "standard": "You are a Fair & Experienced Coding Mentor and Judge.",
        "cto": "You are a Grumpy CTO. Focus on Engineering Rigor and Architecture.",
        "professor": "You are a CS Professor. Focus on Algorithms and Complexity.",
        "roast": "You are a Sarcastic Code Reviewer. Be witty but helpful."
    }
    
    role = persona_prompts.get(persona, persona_prompts["standard"])
    
    prompt = f"""
    ROLE: {role}
    
    TASK: You are an AI Hackathon Judge. Analyze this student's code submission for the given problem.
    
    PROBLEM STATEMENT:
    {problem_desc}
    
    TEST CASES:
    {test_cases_info}
    
    STUDENT CODE:
    ```
    {user_code}
    ```
    
    INSTRUCTIONS:
    1. First, determine if the code would produce the correct output for the given test cases.
    2. Respond with a JSON object (and ONLY a JSON object, no markdown fences) with these fields:
       - "status": "accepted" if the code is correct, "wrong_answer" if incorrect, "error" if the code has bugs
       - "score": a number from 0 to 100 based on correctness, code quality, and efficiency
       - "feedback": a detailed markdown string with your analysis. Include:
         * Whether the solution is correct
         * Code quality observations
         * Time/space complexity analysis
         * Suggestions for improvement
         * If wrong, give hints without giving the full answer
    """
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]  # Remove first line
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        
        result = json.loads(text)
        return result, None
    except json.JSONDecodeError:
        # If JSON parsing fails, still return the text as feedback
        return {
            "status": "accepted",
            "score": 75,
            "feedback": response.text if response else "Could not parse AI response."
        }, None
    except Exception as e:
        return None, f"Gemini Error: {str(e)}"

async def judge_submission(submission: Submission, user: User, problem: Problem, test_cases: list[TestCase], session):
    """
    Main entry point for judging. Fetches code from GitHub and runs AI judge.
    """
    # 1. Get code from GitHub
    user_code = "# Code not found"
    
    if user.github_access_token and submission.repo_url:
        try:
            g = Github(user.github_access_token)
            repo_name = submission.repo_url.rstrip("/").split("/")[-1]
            repo = g.get_user().get_repo(repo_name)
            
            # Get solution.py from main branch (no commit_sha needed)
            content_file = repo.get_contents("solution.py", ref="main")
            user_code = content_file.decoded_content.decode("utf-8")
        except Exception as e:
            print(f"Error fetching code from GitHub: {e}")
            user_code = f"# Error fetching code: {str(e)}"
    
    # 2. Build test case info string for AI
    test_cases_info = ""
    if test_cases:
        for i, tc in enumerate(test_cases):
            test_cases_info += f"Test Case {i+1}:\n  Input: {tc.input_data}\n  Expected Output: {tc.expected_output}\n\n"
    else:
        test_cases_info = "No test cases provided. Judge based on problem description."
    
    # 3. Run AI Judge
    ai_result, error = await run_ai_judge(user_code, problem.description, test_cases_info)
    
    if ai_result:
        submission.status = ai_result.get("status", "error")
        submission.score = ai_result.get("score", 0)
        submission.ai_feedback = ai_result.get("feedback", "No feedback generated.")
        submission.judge_output = f"AI Judge evaluated the code from repo."
    else:
        submission.status = "error"
        submission.score = 0
        submission.ai_feedback = error or "Judge failed to evaluate."
        submission.judge_output = "Judge error"
    
    submission.code_content = user_code  # Store what was evaluated
    
    session.add(submission)
    session.commit()
    return submission
