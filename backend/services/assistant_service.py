import logging
import time
from collections import defaultdict

from services.ai_generator import generate_content_with_retry, has_ai_provider

logger = logging.getLogger(__name__)

MAX_HISTORY_PER_USER = 20


class ConversationMemory:
    def __init__(self):
        self.histories: dict[int, list[dict]] = defaultdict(list)

    def add_message(self, user_id: int, role: str, content: str):
        self.histories[user_id].append({"role": role, "content": content, "timestamp": time.time()})
        if len(self.histories[user_id]) > MAX_HISTORY_PER_USER:
            self.histories[user_id] = self.histories[user_id][-MAX_HISTORY_PER_USER:]

    def get_history(self, user_id: int) -> list[dict]:
        return self.histories.get(user_id, [])

    def clear_history(self, user_id: int):
        self.histories.pop(user_id, None)


memory = ConversationMemory()


def _get_user_level_label(level: int | None) -> str:
    if not level:
        return "beginner"
    if level <= 3:
        return "beginner"
    elif level <= 7:
        return "intermediate"
    else:
        return "advanced"


def _build_context_prompt(user_level: int | None, recent_problems: list[str] | None) -> str:
    parts = [f"User skill level: {_get_user_level_label(user_level)}"]
    if recent_problems:
        parts.append(f"Recently attempted problems: {', '.join(recent_problems[:5])}")
    return "\n".join(parts)


async def chat_with_assistant(
    user_id: int,
    query: str,
    user_level: int | None = None,
    recent_problems: list[str] | None = None,
) -> str:
    if not has_ai_provider():
        raise RuntimeError("No AI provider configured")

    context = _build_context_prompt(user_level, recent_problems)
    history = memory.get_history(user_id)

    history_str = ""
    if history:
        history_lines = []
        for msg in history[-6:]:
            history_lines.append(f"{msg['role'].upper()}: {msg['content']}")
        history_str = "\n".join(history_lines)

    prompt = f"""You are an AI Teaching Assistant on the MiniCode coding education platform.
You help students with programming concepts, debugging, and computer science topics.

STUDENT CONTEXT:
{context}

CONVERSATION HISTORY (last messages):
{history_str or "No previous conversation."}

STUDENT QUERY: {query}

Guidelines:
1. Help students understand concepts without giving away complete solutions to coding problems.
2. Use clear explanations with code examples where helpful.
3. When asked about specific problem, provide hints and guidance, not full solutions.
4. Use Markdown formatting for code blocks.
5. Be encouraging and supportive.
6. If the query is off-topic or inappropriate, politely redirect to programming topics."""

    try:
        response_text = await generate_content_with_retry(prompt)
        memory.add_message(user_id, "user", query)
        memory.add_message(user_id, "assistant", response_text)
        return response_text
    except Exception as e:
        logger.error(f"Assistant chat error: {e}")
        raise


async def generate_hint(
    problem_id: int,
    problem_title: str,
    problem_description: str,
    user_level: int | None = None,
) -> str:
    if not has_ai_provider():
        raise RuntimeError("No AI provider configured")

    level_label = _get_user_level_label(user_level)

    prompt = f"""You are a helpful coding tutor on MiniCode. Generate a contextual hint for the following problem.
The hint should guide the student WITHOUT giving away the full solution.

PROBLEM TITLE: {problem_title}
PROBLEM DESCRIPTION: {problem_description[:2000]}
STUDENT LEVEL: {level_label}

Provide 2-3 hints that:
1. Point the student to the right concept or algorithm
2. Suggest what to think about, not what to write
3. Are appropriate for a {level_label} level student
4. Include a small nudge about edge cases or common pitfalls

Respond with a concise hint in Markdown format."""

    try:
        return await generate_content_with_retry(prompt)
    except Exception as e:
        logger.error(f"Hint generation error: {e}")
        raise


async def explain_submission_failure(
    code_content: str,
    problem_title: str,
    problem_description: str,
    judge_output: str | None = None,
    language: str | None = None,
) -> str:
    if not has_ai_provider():
        raise RuntimeError("No AI provider configured")

    prompt = f"""You are a code review assistant on MiniCode. A student's submission failed.
Explain why in a helpful, educational way.

PROBLEM TITLE: {problem_title}
PROBLEM DESCRIPTION: {problem_description[:1500]}
LANGUAGE: {language or "Unknown"}

STUDENT CODE:
```{language or ""}
{code_content[:4000]}
```

JUDGE OUTPUT (error/failure message):
{judge_output or "No additional output provided."}

Provide:
1. What went wrong (in simple terms)
2. Which part of the code caused the issue
3. A hint about how to fix it (not the full solution)
4. A learning resource or concept to review

Format your response in Markdown with code snippets where helpful."""

    try:
        return await generate_content_with_retry(prompt)
    except Exception as e:
        logger.error(f"Submission explanation error: {e}")
        raise
