import os
import json
import logging
from typing import Optional, Dict, Any
import anyio
from google import genai
from google.genai import types
from pypdf import PdfReader
from fastapi import UploadFile

logger = logging.getLogger(__name__)

async def generate_content_with_retry(client, prompt, default_model='gemini-3-flash-preview', response_mime_type=None) -> str:
    models = [default_model, 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite-preview']
    last_exception = None
    
    unique_models = []
    for m in models:
        if m not in unique_models:
            unique_models.append(m)
            
    for model_name in unique_models:
        for attempt in range(3):
            try:
                logger.info(f"Attempting generation with model={model_name}, attempt={attempt+1}")
                if hasattr(client, 'aio'):
                    response = await client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type=response_mime_type,
                        ) if response_mime_type else None
                    )
                else:
                    response = await anyio.to_thread.run_sync(
                        lambda: client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                response_mime_type=response_mime_type,
                            ) if response_mime_type else None
                        )
                    )
                return response.text.strip()
            except Exception as e:
                last_exception = e
                error_msg = str(e)
                logger.warning(f"Gemini model {model_name} failed (attempt {attempt+1}): {error_msg}")
                if "503" in error_msg or "demand" in error_msg or "quota" in error_msg or "429" in error_msg:
                    await anyio.sleep(1.5 * (attempt + 1))
                    continue
                else:
                    break
    raise last_exception

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
    """Uses Gemini to generate problem content from extracted text."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)
    
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
        # Using robust Gemini failover logic
        response_text = await generate_content_with_retry(client, prompt, response_mime_type="application/json")
        return json.loads(response_text)

    except Exception as e:
        logger.error(f"Gemini Problem Generation Error: {e}")
        raise e

async def improve_problem_content(current_data: Dict[str, Any]) -> Dict[str, Any]:
    """Uses Gemini 2.5 to improve the problem content."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)
    
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
        # Using robust Gemini failover logic
        response_text = await generate_content_with_retry(client, prompt, default_model='gemini-3-flash-preview', response_mime_type="application/json")
        return json.loads(response_text)

    except Exception as e:
        logger.error(f"Gemini Problem Improvement Error: {e}")
        raise e

