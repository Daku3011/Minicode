import os
import asyncio
import logging
from typing import Optional, Dict, Any, List

import httpx
import anyio
from pypdf import PdfReader
from fastapi import UploadFile

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = float(os.getenv("AI_REQUEST_TIMEOUT", "90"))
ATTEMPTS_PER_MODEL = int(os.getenv("AI_ATTEMPTS_PER_MODEL", "3"))


def _csv_env(name: str, default: List[str]) -> List[str]:
    raw = os.getenv(name, "")
    items = [x.strip() for x in raw.split(",") if x.strip()]
    return items or default


def _provider_chain() -> List[Dict[str, Any]]:
    """
    Builds the ordered provider chain from environment configuration.

    Env vars:
      AI_PROVIDER_ORDER   comma list, e.g. "openrouter,nvidia,gemini" (default order below)
      OPENROUTER_API_KEY  https://openrouter.ai/keys          (free tier models available)
      OPENROUTER_MODELS   e.g. "deepseek/deepseek-chat-v3-0324:free,meta-llama/llama-3.3-70b-instruct:free"
      NVIDIA_API_KEY      https://build.nvidia.com            (free credits, fast NIM endpoints)
      NVIDIA_MODELS       e.g. "meta/llama-3.3-70b-instruct,nvidia/llama-3.3-nemotron-super-49b-v1"
      ZEN_API_KEY         https://opencode.ai/zen             (code-focused gateway)
      ZEN_BASE_URL        default https://opencode.ai/zen/v1
      ZEN_MODELS          e.g. "grok-code"
      GEMINI_API_KEY      Google AI Studio (kept as a fallback provider)
      GEMINI_MODELS       default "gemini-2.5-flash,gemini-2.0-flash"
    """
    default_order = ["openrouter", "nvidia", "zen", "gemini"]
    order = [p.strip().lower() for p in os.getenv("AI_PROVIDER_ORDER", ",".join(default_order)).split(",") if p.strip()]
    chain: List[Dict[str, Any]] = []

    for name in order:
        if name == "openrouter" and os.getenv("OPENROUTER_API_KEY"):
            chain.append({
                "name": "openrouter",
                "kind": "openai",
                "base_url": "https://openrouter.ai/api/v1",
                "api_key": os.getenv("OPENROUTER_API_KEY"),
                "models": _csv_env("OPENROUTER_MODELS", [
                    "deepseek/deepseek-chat-v3-0324:free",
                    "meta-llama/llama-3.3-70b-instruct:free",
                ]),
            })
        elif name == "nvidia" and os.getenv("NVIDIA_API_KEY"):
            chain.append({
                "name": "nvidia",
                "kind": "openai",
                "base_url": "https://integrate.api.nvidia.com/v1",
                "api_key": os.getenv("NVIDIA_API_KEY"),
                "models": _csv_env("NVIDIA_MODELS", [
                    "meta/llama-3.3-70b-instruct",
                    "nvidia/llama-3.3-nemotron-super-49b-v1",
                ]),
            })
        elif name == "zen" and os.getenv("ZEN_API_KEY"):
            chain.append({
                "name": "zen",
                "kind": "openai",
                "base_url": os.getenv("ZEN_BASE_URL", "https://opencode.ai/zen/v1").rstrip("/"),
                "api_key": os.getenv("ZEN_API_KEY"),
                "models": _csv_env("ZEN_MODELS", ["grok-code"]),
            })
        elif name == "gemini" and os.getenv("GEMINI_API_KEY"):
            chain.append({
                "name": "gemini",
                "kind": "gemini",
                "api_key": os.getenv("GEMINI_API_KEY"),
                "models": _csv_env("GEMINI_MODELS", ["gemini-2.5-flash", "gemini-2.0-flash"]),
            })

    return chain


def has_ai_provider() -> bool:
    """True when at least one AI provider API key is configured."""
    return len(_provider_chain()) > 0


async def _call_openai_compatible(provider: Dict[str, Any], model: str, prompt: str, json_mode: bool) -> str:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "Authorization": f"Bearer {provider['api_key']}",
        "Content-Type": "application/json",
    }
    if provider["name"] == "openrouter":
        headers["X-Title"] = "MiniCode"

    async def _post(use_json_mode: bool) -> httpx.Response:
        body = dict(payload)
        if use_json_mode:
            body["response_format"] = {"type": "json_object"}
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            return await client.post(
                f"{provider['base_url']}/chat/completions",
                json=body,
                headers=headers,
            )

    response = await _post(json_mode)
    # Some models reject response_format — retry once without it.
    if json_mode and response.status_code == 400:
        response = await _post(False)
    response.raise_for_status()
    data = response.json()
    content = data["choices"][0]["message"]["content"]
    return (content or "").strip()


async def _call_gemini(provider: Dict[str, Any], model: str, prompt: str, json_mode: bool) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=provider["api_key"])
    config = types.GenerateContentConfig(response_mime_type="application/json") if json_mode else None
    if hasattr(client, "aio"):
        response = await client.aio.models.generate_content(model=model, contents=prompt, config=config)
    else:
        response = await anyio.to_thread.run_sync(
            lambda: client.models.generate_content(model=model, contents=prompt, config=config)
        )
    return (response.text or "").strip()


async def generate_content_with_retry(prompt: str, response_mime_type: Optional[str] = None) -> str:
    """
    Generates text through the first available configured provider, failing over
    across providers and models with retries (mirrors the previous Gemini-only loop).
    """
    json_mode = response_mime_type == "application/json"
    providers = _provider_chain()
    if not providers:
        raise RuntimeError(
            "No AI provider configured. Set one of OPENROUTER_API_KEY, NVIDIA_API_KEY, "
            "ZEN_API_KEY or GEMINI_API_KEY."
        )

    last_exception: Optional[Exception] = None
    for provider in providers:
        for model in provider["models"]:
            for attempt in range(1, ATTEMPTS_PER_MODEL + 1):
                try:
                    logger.info(f"AI generation via {provider['name']} model={model} attempt={attempt}")
                    if provider["kind"] == "openai":
                        return await _call_openai_compatible(provider, model, prompt, json_mode)
                    return await _call_gemini(provider, model, prompt, json_mode)
                except Exception as e:
                    last_exception = e
                    msg = str(e)
                    logger.warning(f"{provider['name']}:{model} failed (attempt {attempt}): {msg}")
                    if any(code in msg for code in ("503", "429", "quota", "demand", "rate")):
                        await asyncio.sleep(1.5 * attempt)
                        continue
                    break  # non-retryable for this model — move to next model/provider

    raise last_exception if last_exception else RuntimeError("AI generation failed.")


_generate_content_with_retry = generate_content_with_retry


# Predefined subjects mapping (matching frontend IDs)
def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extracts text from a file based on its extension."""
    if filename.lower().endswith(".pdf"):
        import io
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n\n"
        return text.strip()
    elif filename.lower().endswith(".docx"):
        import io
        import docx
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text.strip()
    else:
        # Assume it's a text file
        try:
            return file_content.decode("utf-8").strip()
        except UnicodeDecodeError:
            return file_content.decode("latin-1").strip()

async def generate_problem_content(text_content: str) -> Dict[str, Any]:
    """Uses the configured AI provider to generate problem content from extracted text."""
    SUBJECTS = [
        "data-structures", "algorithms", "dp", "graphs", "math",
        "strings", "number-theory", "combinatorics", "geometry",
        "game-theory", "blockchain"
    ]

    prompt = f"""
    TASK: You are an elite curriculum designer for a technical coding platform. Your goal is to transform the following material into a professional, high-fidelity coding problem statement AND a set of valid test cases.

    CORE PRINCIPLE:
    - If the source material ALREADY contains a structured problem statement (like a hackathon brief), PRESERVE and REFORMAT it faithfully. Do NOT summarize or lose technical details.
    - If the material is lecture notes/raw text, SYNTHESIZE a new problem around its core concepts.

    AUDIENCE: Undergraduate students who may NOT know common DSA patterns yet. Write so a motivated beginner can understand the task without external help.

    GUIDELINES:
    1. Rich Markdown: Use headings, tables, code blocks, lists, and bold text for visual structure.
    2. Preservation: Keep all technical requirements, function names (e.g. 'init_game', 'sui::random'), and specific numbers (e.g. '60% drop rate') intact.
    3. Structural Sections — the description MUST contain, in this order:
       * "## Overview" — 2-4 paragraphs of story/context explaining WHY this problem exists and WHAT is being asked in plain language.
       * "## Understanding the Problem" — walk through what the input represents and what output is expected, step by step, in simple words.
       * "## Examples" — at least TWO fully worked examples in LeetCode style:
         **Example 1:** Input block, Output block, then "**Explanation:**" — 2-5 sentences walking through exactly HOW the input leads to that output.
         **Example 2:** same structure, ideally an edge case.
       * "## Approach Hints" — name the relevant technique/pattern (e.g. two pointers, prefix sums, BFS, sliding window, DP) with ONE sentence on why it fits. Do NOT give away the full solution.
       * "## Requirements" / "## Constraints" / "## Evaluation Criteria" as applicable.
    4. Form Matching:
       - 'title': Concise (e.g., 'Sui Loot Box System').
       - 'description': The full, professional problem body in Markdown following the section order above.
       - 'subject': Choose EXACTLY one from: [{", ".join(SUBJECTS)}].
       - 'difficulty': "Easy", "Medium", or "Hard".
       - 'input_format': Describe the parameters/data input precisely (types, ranges, ordering).
       - 'output_format': Describe the return values/results precisely.
       - 'constraints': List time/memory limits and tech-specific rules.
       - 'hints': 2-3 short lines separated by newline characters, escalating from gentle nudge to pattern name. Never reveal the full algorithm.
       - 'test_cases': A list of at least 5 objects (min 2 marked 'is_sample': True). Include: 1 Base Case, 1 Simple Varied Case, 1 Large Value Edge Case, 1 Empty/Null Edge Case, 1 Complex Case. Each with 'input_data', 'expected_output', 'explanation' (1-3 sentences: why this input produces this output — shown to students under the sample), and 'is_sample' (boolean).

    PREDEFINED SUBJECTS: Use 'blockchain' for smart contracts, Web3, or crypto-specific challenges.

    MATERIAL SOURCE:
    \"\"\"
    {text_content[:15000]}
    \"\"\"

    RESPONSE: Return JSON only. No wrappers or markdown code blocks.
    """

    try:
        response_text = await generate_content_with_retry(prompt, response_mime_type="application/json")
        return json.loads(response_text)

    except Exception as e:
        logger.error(f"Problem Generation Error: {e}")
        raise e

async def improve_problem_content(current_data: Dict[str, Any]) -> Dict[str, Any]:
    """Uses the configured AI provider to improve the problem content."""
    prompt = f"""
    TASK: You are an elite technical curriculum designer. Your task is to IMPROVE and POLISH the following draft coding problem.

    AUDIENCE: Undergraduate students who may NOT know common DSA patterns yet. The improved problem must be self-explanatory.

    CURRENT DRAFT DATA:
    - Title: {current_data.get('title', '')}
    - Description: {current_data.get('description', '')}
    - Difficulty: {current_data.get('difficulty', 'Easy')}
    - Subject: {current_data.get('subject', '')}
    - Input Format: {current_data.get('input_format', '')}
    - Output Format: {current_data.get('output_format', '')}
    - Constraints: {current_data.get('constraints', '')}
    - Hints: {current_data.get('hints', '')}

    IMPROVEMENT GUIDELINES:
    1. Expand the Description into a complete, LeetCode-style statement with these sections (Markdown headings):
       * "## Overview" — story/context in plain language (2-4 paragraphs).
       * "## Understanding the Problem" — step-by-step plain-words explanation of input → expected output.
       * "## Examples" — at least TWO worked examples, each with an Input block, an Output block, and a "**Explanation:**" paragraph walking through exactly how the output is derived.
       * "## Approach Hints" — name the relevant technique/pattern (two pointers, prefix sums, BFS, DP…) with one sentence on why it fits, without revealing the full solution.
       * Keep/expand any "Requirements" / "Constraints" sections.
    2. Ensure 'input_format' and 'output_format' are precise (types, ranges, ordering).
    3. Provide realistic constraints if missing.
    4. Write 2-3 escalating hints separated by newline characters — gentle nudge first, pattern name later. Never reveal the full algorithm.
    5. Maintain the essence of the original draft; do not change the actual task being asked.

    RESPONSE: Return ONLY a JSON object with matching keys: 'title', 'description', 'input_format', 'output_format', 'constraints', 'hints'. No markdown wrappers around the JSON.
    """

    try:
        response_text = await generate_content_with_retry(prompt, response_mime_type="application/json")
        return json.loads(response_text)

    except Exception as e:
        logger.error(f"Problem Improvement Error: {e}")
        raise e
