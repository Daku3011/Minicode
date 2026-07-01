import os
import logging
import json
from google import genai
from core.models import Submission, TestCase, User, Problem
from github import Github
from services.auth import decrypt_token
from utils.utils_cache import invalidate_leaderboard_cache
from services.sync_xp import calculate_unlocked_level_from_xp
from tenacity import retry, stop_after_attempt, wait_exponential
from services.ai_generator import generate_content_with_retry
from sqlmodel import Session

logger = logging.getLogger(__name__)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def run_ai_judge(
    user_code: str,
    problem_desc: str,
    test_cases_info: str,
    commit_history_info: str = "",
    persona: str = "standard",
):
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
        "roast": "You are a Sarcastic Code Reviewer. Be witty but helpful.",
    }

    role = persona_prompts.get(persona, persona_prompts["standard"])

    prompt = f"""
    ROLE: {role}
    
    TASK: You are an AI Hackathon Judge. Analyze this student's code submission for the given problem. You are also performing a STRICT AI-plagiarism detection check.
    
    PROBLEM STATEMENT:
    {problem_desc}
    
    TEST CASES:
    {test_cases_info}
    
    COMMIT HISTORY:
    {commit_history_info}
    
    STUDENT CODE:
    ```
    {user_code}
    ```
    
    INSTRUCTIONS:
    1. First, determine if the code would produce the correct output for the given test cases.
    2. Respond with a JSON object (and ONLY a JSON object, no markdown fences) with these fields:
       - "status": "accepted" if the code is correct, "wrong_answer" if incorrect, "error" if the code has bugs
       - "score": a number from 0 to 100 based on correctness, code quality, and efficiency
       - "ai_probability": a number from 0 to 100 representing the probability that this code was AI-generated. Be highly suspicious of generic variable names, standard AI boilerplate, excessive overly-explanatory comments, and suspicious commit histories (e.g., a single massive commit, or AI-like commit messages).
       - "feedback": a detailed markdown string with your analysis. Include:
         * Whether the solution is correct
         * Code quality observations
         * Time/space complexity analysis
         * Suggestions for improvement
         * If wrong, give hints without giving the full answer
         * EXTREMELY IMPORTANT: If ai_probability > 60, you MUST include a brief explanation in the feedback about why you suspect AI generation.
    """

    try:
        from google.genai import types

        text = await generate_content_with_retry(
            client,
            prompt,
            default_model="gemini-3-flash-preview",
            response_mime_type="application/json"
        )

        # text already retrieved
        import re

        # Find JSON object
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if json_match:
            text = json_match.group(1).strip()
        else:
            obj_match = re.search(r"(\{.*\})", text, re.DOTALL)
            if obj_match:
                text = obj_match.group(1).strip()

        result = json.loads(text)

        # Inject warning if AI probability is high
        ai_prob = result.get("ai_probability", 0)
        if isinstance(ai_prob, (int, float)) and ai_prob > 60:
            warning_msg = f"""⚠️ WARNING: This submission has a high likelihood ({ai_prob}%) of being AI-generated based on code patterns and commit history.\n\n"""
            result["feedback"] = warning_msg + result.get("feedback", "")

        return result, None
    except json.JSONDecodeError as e:
        fallback_feedback = "AI Judge failed to format response correctly. Resulting in error."
        if 'text' in locals() and text:
            fallback_feedback += f"\n\nRaw Output: {text}"
        return {"status": "error", "score": 0, "feedback": fallback_feedback}, None
    except Exception as e:
        return None, f"Gemini Error: {str(e)}"


async def judge_submission(
    submission: Submission,
    user: User,
    problem: Problem,
    test_cases: list[TestCase],
    session: Session,
):
    """
    Main entry point for judging. Fetches code from GitHub and runs AI judge.
    """
    # 1. Get code from GitHub
    user_code = "# Code not found"
    commit_history_info = "No commit history available."

    if user.github_access_token and submission.repo_url:
        try:
            g = None
            repo = None
            decrypted_token = decrypt_token(user.github_access_token)
            if not decrypted_token:
                logger.warning(f"Could not decrypt GitHub token for user {user.username}. Ensure FERNET_KEY is set and consistent.")
                user_code = "# Error: Could not decrypt GitHub access token. Please re-login."
            else:
                g = Github(decrypted_token)
                repo_name = submission.repo_url.rstrip("/").split("/")[-1]
                # GitHub Optimization: Fetch repo by full name instead of hitting /user endpoint first
                repo = g.get_repo(f"{user.username}/{repo_name}")

                # Helper to try multiple branches and extensions
                content_file = None
                branches_to_try = [repo.default_branch, "main", "master"]

                for branch in branches_to_try:
                    try:
                        tree = repo.get_git_tree(branch, recursive=True)
                        for element in tree.tree:
                            if element.type == "blob" and element.path.split('/')[-1].lower().startswith("solution."):
                                content_file = repo.get_contents(element.path, ref=branch)
                                break
                        if content_file:
                            break
                    except Exception as e:
                        continue

                if content_file:
                    # Try multiple encodings to handle different file types (Java, Python, etc.)
                    try:
                        user_code = content_file.decoded_content.decode("utf-8")
                    except UnicodeDecodeError:
                        try:
                            user_code = content_file.decoded_content.decode("latin-1")
                        except UnicodeDecodeError:
                            user_code = content_file.decoded_content.decode("cp1252", errors="ignore")

                    # Remove NULL bytes that PostgreSQL can't handle
                    if isinstance(user_code, str):
                        user_code = user_code.replace('\x00', '')
                else:
                    user_code = f"# Error fetching code: A file named 'solution.*' was not found in repository {repo_name}."

                # Fetch recent commits
                commit_history_info = "Recent Commits:\n"
                try:
                    commits = repo.get_commits()
                    for i, c in enumerate(commits[:5]):
                        commit_history_info += f"- [{c.commit.author.date}] {c.commit.author.name}: {c.commit.message}\n"
                except Exception as e:
                    commit_history_info += f"Could not fetch commits: {str(e)}\n"

        except Exception as e:
            logger.error(f"Error fetching code from GitHub: {e}")
            user_code = f"# Error fetching code: {str(e)}"
            commit_history_info = "No commit history available due to error."

    # 2. Build test case info string for AI
    test_cases_info = ""
    if test_cases:
        for i, tc in enumerate(test_cases):
            test_cases_info += f"Test Case {i + 1}:\n  Input: {tc.input_data}\n  Expected Output: {tc.expected_output}\n\n"
    else:
        test_cases_info = "No test cases provided. Judge based on problem description."

    # 3. Run AI Judge
    ai_result_data = await run_ai_judge(
        user_code, problem.description, test_cases_info, commit_history_info
    )
    ai_result, error = ai_result_data

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

    # Update user's total XP if this is an improvement for this problem
    if submission.status == "accepted":
        from sqlmodel import select, func

        # Get previous highest score for this problem by this user
        prev_best = (
            session.exec(
                select(func.max(Submission.score))
                .where(Submission.user_id == user.id)
                .where(Submission.problem_id == problem.id)
                .where(
                    Submission.id != submission.id
                )  # Exclude current (if already in DB)
            ).first()
            or 0
        )

        new_score = submission.score
        if new_score > prev_best:
            # Calculate XP based on problem's xp_reward scaled by the score percentage
            total_bounty = getattr(problem, 'xp_reward', 100)
            xp_to_add = int((new_score / 100.0) * total_bounty)
            prev_xp_from_this = int((prev_best / 100.0) * total_bounty)
            
            xp_diff = xp_to_add - prev_xp_from_this
            
            if xp_diff > 0:
                if user.xp is None:
                    user.xp = 0
                user.xp += xp_diff
                
                # Update unlocked level immediately
                new_level = calculate_unlocked_level_from_xp(user.xp)
                if user.unlocked_level is None or new_level > user.unlocked_level:
                    logger.info(f"User {user.username} reached Level {new_level}!")
                    user.unlocked_level = new_level
                
                session.add(user)
                logger.info(
                    f"User {user.username} earned {xp_diff} XP (New best: {new_score})"
                )
            # Invalidate leaderboard cache
            invalidate_leaderboard_cache()

    session.add(submission)
    session.commit()
    
    # Broadcast to WebSockets via Redis
    try:
        from redis import asyncio as aioredis
        r = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        await r.publish("submission_events", json.dumps({
            "submission_id": submission.id,
            "status": submission.status
        }))
        await r.aclose()
    except Exception as e:
        logger.error(f"Failed to publish WebSocket event: {e}")

    return submission
