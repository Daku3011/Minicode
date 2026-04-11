from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import logging
from email_service import send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])

FEEDBACK_RECIPIENT = "minicode.scet@gmail.com"

@router.post("")
async def submit_feedback(
    email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    try:
        attachments = []
        if image:
            content = await image.read()
            attachments.append({
                "filename": image.filename,
                "content": content,
                "mime_type": image.content_type
            })

        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">New Feedback Received</h2>
            <p><strong>From:</strong> {email}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <p style="white-space: pre-wrap;">{message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This feedback was submitted via the MiniCode Feedback Form.
            </p>
        </div>
        """

        success = send_email(
            to_email=FEEDBACK_RECIPIENT,
            subject=f"Feedback: {subject}",
            html_content=html_content,
            attachments=attachments
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to send feedback email")

        return {"message": "Feedback submitted successfully"}

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))
