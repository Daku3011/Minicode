import json
import logging
from typing import Optional

from sqlmodel import Session

from core.models import Submission, TestCase, Problem, User
from sandbox.runner import run_in_sandbox, SandboxResult, TestResult
from services.judge import run_ai_judge, judge_submission
from utils.sandbox import docker_is_available
from utils.utils_cache import invalidate_leaderboard_cache

logger = logging.getLogger(__name__)


async def judge_with_sandbox(
    submission: Submission,
    user: User,
    problem: Problem,
    test_cases: list[TestCase],
    session: Session,
) -> Submission:
    sandbox_result = None
    sandbox_available = await docker_is_available()

    if sandbox_available:
        test_case_dicts = [
            {"input_data": tc.input_data, "expected_output": tc.expected_output}
            for tc in test_cases
        ]

        language = submission.language or "python"

        sandbox_result = await run_in_sandbox(
            language=language,
            user_code=submission.code_content or "",
            test_cases=test_case_dicts,
        )

        if sandbox_result.success:
            submission.status = "accepted"
        elif sandbox_result.timed_out:
            submission.status = "error"
            submission.judge_output = "Execution timed out"
        elif sandbox_result.test_results is not None:
            submission.status = "wrong_answer"
            submission.judge_output = sandbox_result.output
        else:
            submission.status = "runtime_error"
            submission.judge_output = sandbox_result.error or sandbox_result.output

        if sandbox_result.test_results:
            results_json = json.dumps(sandbox_result.test_results)
            submission.judge_output = results_json
    else:
        logger.warning("Sandbox unavailable, falling back to AI-only evaluation")

    ai_result_data = None
    if problem and hasattr(problem, "description"):
        test_cases_info = _format_test_cases_for_ai(test_cases)
        ai_result_data = await run_ai_judge(
            user_code=submission.code_content or "",
            problem_desc=problem.description,
            test_cases_info=test_cases_info,
        )

    ai_result, ai_error = ai_result_data if ai_result_data else (None, None)

    if sandbox_result is None:
        if ai_result:
            submission.status = ai_result.get("status", "error")
            submission.score = ai_result.get("score", 0)
            submission.ai_feedback = ai_result.get("feedback", "No feedback generated.")
        else:
            submission.status = "error"
            submission.score = 0
            submission.ai_feedback = ai_error or "Judge failed to evaluate."
    elif ai_result:
        submission.ai_feedback = ai_result.get("feedback", "No feedback generated.")
        submission.score = ai_result.get("score", 0)
    else:
        submission.ai_feedback = ai_error or "AI feedback unavailable."

    _update_xp_and_leaderboard(submission, user, problem, session)

    session.add(submission)
    session.commit()

    await _publish_ws_event(submission)

    return submission


async def judge_with_sandbox_only(
    language: str,
    user_code: str,
    test_cases: list[dict],
) -> SandboxResult:
    return await run_in_sandbox(
        language=language,
        user_code=user_code,
        test_cases=test_cases,
    )


async def judge_with_ai_only(
    user_code: str,
    problem_desc: str,
    test_cases_info: str,
) -> tuple[Optional[dict], Optional[str]]:
    return await run_ai_judge(
        user_code=user_code,
        problem_desc=problem_desc,
        test_cases_info=test_cases_info,
    )


def _format_test_cases_for_ai(test_cases: list[TestCase]) -> str:
    if not test_cases:
        return "No test cases provided."
    lines = []
    for i, tc in enumerate(test_cases):
        lines.append(f"Test Case {i + 1}:\n  Input: {tc.input_data}\n  Expected Output: {tc.expected_output}\n")
    return "\n".join(lines)


def _update_xp_and_leaderboard(
    submission: Submission,
    user: User,
    problem: Problem,
    session: Session,
) -> None:
    if submission.status != "accepted":
        return

    from sqlmodel import select, func

    prev_best = (
        session.exec(
            select(func.max(Submission.score))
            .where(Submission.user_id == user.id)
            .where(Submission.problem_id == problem.id)
            .where(Submission.id != submission.id)
        ).first()
        or 0
    )

    new_score = submission.score or 0
    if new_score > prev_best:
        total_bounty = getattr(problem, "xp_reward", 100)
        xp_to_add = int((new_score / 100.0) * total_bounty)
        prev_xp = int((prev_best / 100.0) * total_bounty)
        xp_diff = xp_to_add - prev_xp

        if xp_diff > 0:
            if user.xp is None:
                user.xp = 0
            user.xp += xp_diff
            from services.sync_xp import calculate_unlocked_level_from_xp
            new_level = calculate_unlocked_level_from_xp(user.xp)
            if user.unlocked_level is None or new_level > user.unlocked_level:
                user.unlocked_level = new_level
            session.add(user)

        invalidate_leaderboard_cache()


async def _publish_ws_event(submission: Submission) -> None:
    import os
    try:
        from redis import asyncio as aioredis
        r = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        await r.publish(
            "submission_events",
            json.dumps({
                "submission_id": submission.id,
                "status": submission.status,
            }),
        )
        await r.aclose()
    except Exception as e:
        logger.error("Failed to publish WebSocket event: %s", e)
