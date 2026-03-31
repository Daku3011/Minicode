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
    TASK: You are an elite curriculum designer for a technical coding platform. Your goal is to transform the following material into a professional, high-fidelity coding problem statement.

    CORE PRINCIPLE: 
    - If the source material ALREADY contains a structured problem statement (like a hackathon brief), PRESERVE and REFORMAT it faithfully. Do NOT summarize or lose technical details.
    - If the material is lecture notes/raw text, SYNTHESIZE a new problem around its core concepts.

    GUIDELINES:
    1. Rich Markdown: Use tables, code blocks, lists, and bold text for visual structure. 
    2. Preservation: Keep all technical requirements, function names (e.g. 'init_game', 'sui::random'), and specific numbers (e.g. '60% drop rate') intact.
    3. Structural Sections: Include "Overview", "Requirements", "Constraints", and "Evaluation Criteria" in the description.
    4. Form Matching:
       - 'title': Concise (e.g., 'Sui Loot Box System').
       - 'description': The full, professional problem body in Markdown.
       - 'subject': Choose EXACTLY one from: [{", ".join(SUBJECTS)}].
       - 'difficulty': "Easy", "Medium", or "Hard".
       - 'input_format': Describe the parameters/data input.
       - 'output_format': Describe the return values/results.
       - 'constraints': List time/memory limits and tech-specific rules.
       - 'hint': A small, helpful clue for the student.

    PREDEFINED SUBJECTS: Use 'blockchain' for smart contracts, Web3, or crypto-specific challenges.

    MATERIAL SOURCE:
    \"\"\"
    {text_content[:15000]}  # Increased token limit for better context
    \"\"\"

    RESPONSE: Return JSON only. No wrappers or markdown code blocks.
    """
    
    try:
        # Using the synchronous client wrapped in a thread to avoid aiohttp version conflicts
        # while keeping the FastAPI event loop responsive.
        response = await anyio.to_thread.run_sync(
            lambda: client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
            )
        )
        
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Gemini Problem Generation Error: {e}")
        raise e
