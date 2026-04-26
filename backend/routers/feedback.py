from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional
import logging
from services.email_service import send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])

FEEDBACK_RECIPIENT = "minicode.scet@gmail.com"

@router.post("")
async def submit_feedback(
    background_tasks: BackgroundTasks,
    email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    try:
        attachments = []
        if image:
            # IMPORTANT: We must read the file content into memory BEFORE the request returns,
            # because the TempFile handle is closed and the file deleted once the request finishes.
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

        # Offload the potentially slow SMTP operation to a background task.
        # This prevents Gunicorn worker timeouts on Render.
        background_tasks.add_task(
            send_email,
            to_email=FEEDBACK_RECIPIENT,
            subject=f"Feedback: {subject}",
            html_content=html_content,
            attachments=attachments
        )

        return {"message": "Feedback received. Transmission initialized."}

    except Exception as e:
        logger.error(f"Error processing feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to process feedback submission")
