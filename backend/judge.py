"""
Production-grade Judge System for Minicode.

Architecture:
    judge_submission (orchestrator)
        ├── fetch_code()             ← async-safe GitHub with robust URL parsing
        ├── run_code_against_tests() ← REAL subprocess execution
        ├── compute_score()          ← 70% correctness + 30% AI quality
        └── run_ai_feedback()        ← AI for explanation ONLY
"""

import os
import re
import json
import asyncio
import logging
import subprocess
import tempfile
import resource
import time
from typing import Optional, Dict, Any, List, Tuple
from urllib.parse import urlparse
from google import genai 
from github import Github
from models import Submission, TestCase, User, Problem 

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CODE_EXEC_TIMEOUT = 10        # seconds per test case
AI_TIMEOUT = 15               # seconds for Gemini call
MAX_MEMORY_BYTES = 256 * 1024 * 1024  # 256 MB
CODE_FILE_EXTENSIONS = (".py", ".js", ".java", ".cpp", ".c", ".go", ".rs")

LANGUAGE_COMMANDS = {
    ".py":   lambda path: ["python3", path],
    ".js":   lambda path: ["node", path],
    ".java": lambda path: ["java", path],
    ".cpp":  lambda path: ["./a.out"],       # needs compile step
    ".c":    lambda path: ["./a.out"],       # needs compile step
    ".go":   lambda path: ["go", "run", path],
}

# ---------------------------------------------------------------------------
# 1. Safe JSON Parsing
# ---------------------------------------------------------------------------
def safe_json_parse(text: str) -> Optional[Dict[str, Any]]:
    """Parse JSON safely. Returns None on failure."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
    cleaned = re.sub(r"\n?```\s*$", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        return None

# ---------------------------------------------------------------------------
# 2. Robust GitHub URL Parsing
# ---------------------------------------------------------------------------
def extract_repo_info(repo_url: str) -> Tuple[str, str]:
    """Extract (owner, repo_name) from GitHub URL."""
    parsed = urlparse(repo_url)
    path = parsed.path.strip("/")
    path = path.removesuffix(".git")
    parts = path.split("/")
    if len(parts) >= 2:
        return parts[0], parts[1]
    raise ValueError(f"Cannot extract owner/repo from URL: {repo_url}")

# ---------------------------------------------------------------------------
# 3. Dynamic File Search
# ---------------------------------------------------------------------------
def find_code_file(repo: Any, language_hint: Optional[str] = None) -> Optional[str]:
    """Search repo root for a code file."""
    try:
        contents = repo.get_contents("")
    except Exception:
        return None

    preferred = []
    fallback = []

    for item in contents:
        if item.type != "file":
            continue
        name_lower = item.name.lower()
        _, ext = os.path.splitext(name_lower)
        if ext not in CODE_FILE_EXTENSIONS:
            continue
        if language_hint and ext != f".{language_hint}":
            continue
        if name_lower.startswith(("solution", "main")):
            preferred.append(item.path)
        else:
            fallback.append(item.path)

    return (preferred or fallback or [None])[0]

# ---------------------------------------------------------------------------
# 4. Fetch Code from GitHub (async-safe)
# ---------------------------------------------------------------------------
def _fetch_github_worker(token: str, repo_url: str, lang: Optional[str]) -> Tuple[str, Optional[str]]:
    """Blocking worker for GitHub API."""
    g = Github(token)
    owner, repo_name = extract_repo_info(repo_url)
    repo = g.get_repo(f"{owner}/{repo_name}")

    file_path = find_code_file(repo, lang)
    if not file_path:
        raise FileNotFoundError("No code file found in repo root")

    content_file = repo.get_contents(file_path, ref="main")
    code = content_file.decoded_content.decode("utf-8")
    _, ext = os.path.splitext(file_path)
    return code, ext

async def fetch_code_from_github(
    user: User, submission: Submission
) -> Tuple[str, Optional[str]]:
    """Fetch code from GitHub asynchronously."""
    if not user.github_access_token or not submission.repo_url:
        return "# Code not found — no token or repo URL", None

    try:
        loop = asyncio.get_running_loop()
        code, ext = await loop.run_in_executor(
            None, 
            _fetch_github_worker,
            user.github_access_token,
            submission.repo_url,
            submission.language
        )
        logger.info("Fetched code from GitHub (%s)", submission.repo_url)
        return code, ext
    except Exception as e:
        logger.error("GitHub fetch failed: %s", e)
        return f"# Error fetching code: {e}", None

# ---------------------------------------------------------------------------
# 5. Sandbox Resources
# ---------------------------------------------------------------------------
def _set_resource_limits():
    """Enforce subprocess memory limits."""
    resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY_BYTES, MAX_MEMORY_BYTES))

def run_code_in_sandbox(
    code: str, input_data: str, lang_ext: str = ".py"
) -> Dict[str, Any]:
    """Execute code in a sandbox."""
    cmd_fn = LANGUAGE_COMMANDS.get(lang_ext)
    if not cmd_fn:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {lang_ext}",
            "timed_out": False,
            "exit_code": 1,
            "time_taken": 0.0,
        }

    with tempfile.NamedTemporaryFile(mode="w", suffix=lang_ext, delete=False, dir="/tmp") as f:
        f.write(code)
        tmp_path = f.name

    try:
        start_time = time.monotonic()
        result = subprocess.run(
            cmd_fn(tmp_path),
            input=input_data,
            capture_output=True,
            text=True,
            timeout=CODE_EXEC_TIMEOUT,
            preexec_fn=_set_resource_limits,
        )
        elapsed = time.monotonic() - start_time
        return {
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "timed_out": False,
            "exit_code": result.returncode,
            "time_taken": float(f"{elapsed:.3f}"),
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Time Limit Exceeded",
            "timed_out": True,
            "exit_code": -1,
            "time_taken": float(CODE_EXEC_TIMEOUT),
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "timed_out": False,
            "exit_code": 1,
            "time_taken": 0.0,
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    
    return { # Catch-all to satisfy lint
        "stdout": "",
        "stderr": "Unknown error in sandbox",
        "timed_out": False,
        "exit_code": 1,
        "time_taken": 0.0,
    }

# ---------------------------------------------------------------------------
# 6. Test Suite execution
# ---------------------------------------------------------------------------
async def run_code_against_tests(
    code: str, test_cases: List[TestCase], lang_ext: str = ".py"
) -> Dict[str, Any]:
    """Execute code against all test cases."""
    if not test_cases:
        return {"passed": 0, "total": 0, "results": [], "overall_time": 0.0}

    results = []
    total_time = 0.0
    for i, tc in enumerate(test_cases):
        loop = asyncio.get_running_loop()
        res = await loop.run_in_executor(
            None,
            run_code_in_sandbox,
            code,
            tc.input_data,
            lang_ext
        )
        
        passed = res["stdout"] == tc.expected_output.strip()
        total_time += res["time_taken"]

        status = "passed"
        if res["timed_out"]: status = "tle"
        elif res["exit_code"] != 0: status = "runtime_error"
        elif not passed: status = "wrong_answer"

        results.append({
            "test_case": i + 1,
            "status": status,
            "expected": tc.expected_output.strip(),
            "actual": res["stdout"],
            "stderr": res["stderr"][:500],
            "time": res["time_taken"],
        })

    passed_count = sum(1 for r in results if r["status"] == "passed")
    return {
        "passed": passed_count,
        "total": len(test_cases),
        "results": results,
        "overall_time": float(f"{total_time:.3f}"),
    }

# ---------------------------------------------------------------------------
# 7. AI Feedback
# ---------------------------------------------------------------------------
async def run_ai_feedback(
    user_code: str,
    problem_desc: str,
    test_results: Dict[str, Any],
    persona: str = "standard",
) -> Dict[str, Any]:
    """Gemini-powered feedback."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"quality_score": 0, "feedback": "AI feedback unavailable."}

    client = genai.Client(api_key=api_key)
    persona_prompts = {
        "standard": "You are a Fair & Experienced Coding Mentor.",
        "cto": "You are a Grumpy CTO. Focus on Engineering Rigor.",
        "professor": "You are a CS Professor.",
        "roast": "You are a Sarcastic Code Reviewer.",
    }
    role = persona_prompts.get(persona, persona_prompts["standard"])
    test_summary = json.dumps(test_results.get("results", []), indent=2)

    prompt = f"ROLE: {role}\nPROBLEM: {problem_desc}\nRESULTS: {test_summary}\nCODE:\n{user_code}\nReturn JSON: {{quality_score, feedback}}"

    try:
        response = await asyncio.wait_for(
            client.aio.models.generate_content(model="gemini-1.5-flash", contents=prompt),
            timeout=AI_TIMEOUT,
        )
        parsed = safe_json_parse(response.text)
        if parsed and "feedback" in parsed:
            return {
                "quality_score": int(parsed.get("quality_score", 0)),
                "feedback": parsed["feedback"],
            }
        return {"quality_score": 0, "feedback": response.text.strip()}
    except Exception as e:
        logger.error("AI error: %s", e)
        return {"quality_score": 0, "feedback": f"AI feedback error: {e}"}

# ---------------------------------------------------------------------------
# 8. Scoring & Status
# ---------------------------------------------------------------------------
def compute_score(test_results: Dict[str, Any], ai_quality_score: int) -> int:
    """70% execution, 30% AI."""
    total = test_results.get("total", 0)
    passed = test_results.get("passed", 0)
    correctness = (passed / total * 100) if total > 0 else 0
    return int(correctness * 0.7 + ai_quality_score * 0.3)

def determine_status(test_results: Dict[str, Any]) -> str:
    """Overall submission status."""
    if not test_results.get("results"): return "error"
    statuses = [r["status"] for r in test_results["results"]]
    if all(s == "passed" for s in statuses): return "accepted"
    if any(s == "tle" for s in statuses): return "tle"
    if any(s == "runtime_error" for s in statuses): return "runtime_error"
    return "wrong_answer"

def build_judge_output(test_results: Dict[str, Any]) -> str:
    """Consise text summary."""
    lines = [f"Passed {test_results['passed']}/{test_results['total']} tests"]
    for r in test_results["results"]:
        icon = "✅" if r["status"] == "passed" else "❌"
        lines.append(f"  {icon} Test {r['test_case']}: {r['status']}")
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# 9. Main Orchestrator
# ---------------------------------------------------------------------------
async def judge_submission(
    submission: Submission,
    user: User,
    problem: Problem,
    test_cases: List[TestCase],
    session,
):
    """Main entry point."""
    logger.info("Judging submission #%s", submission.id)

    user_code, lang_ext = await fetch_code_from_github(user, submission)
    lang_ext = lang_ext or ".py"

    test_results = await run_code_against_tests(user_code, test_cases, lang_ext)
    ai_result = await run_ai_feedback(user_code, problem.description, test_results)

    submission.status = determine_status(test_results)
    submission.score = compute_score(test_results, ai_result["quality_score"])
    submission.ai_feedback = ai_result["feedback"]
    submission.judge_output = build_judge_output(test_results)
    submission.code_content = user_code
    submission.time_taken = test_results["overall_time"]

    session.add(submission)
    session.commit()
    logger.info("Submission #%s complete: %s", submission.id, submission.status)
    return submission
