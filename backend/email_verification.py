import os
import random
import string
from datetime import datetime, timedelta, timezone
from sqlmodel import SQLModel, Field
from typing import Optional 


class EmailVerification(SQLModel, table=True):
    __tablename__ = "email_verifications"
 
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    email: str = Field(index=True)
    otp: str = Field(max_length=6)
    expires_at: datetime
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def is_expired(self) -> bool:
        now = datetime.now(timezone.utc)
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return now > expires


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_verification_email(to_email: str, otp: str) -> bool:
    from email_service import send_email

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'JetBrains Mono', 'Fira Code', monospace; margin: 0; padding: 0; background: #020617; color: #f8fafc; }}
            .container {{ max-width: 600px; margin: 20px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 48px 24px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 32px; letter-spacing: -0.05em; text-transform: uppercase; }}
            .content {{ padding: 40px 24px; text-align: center; }}
            .otp-code {{ font-size: 48px; font-weight: 800; letter-spacing: 8px; color: #818cf8; background: #1e1b4b; padding: 24px 48px; border-radius: 12px; display: inline-block; margin: 20px 0; }}
            .warning {{ color: #f59e0b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }}
            .footer {{ background: #020617; padding: 32px; text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>MiniCode</h1>
            </div>
            <div class="content">
                <h2 style="color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em;">Verify Your Email</h2>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.7;">
                    Your verification code for email change is:
                </p>
                <div class="otp-code">{otp}</div>
                <p class="warning">⚠️ This code expires in 10 minutes</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2026 MiniCode // Secure Verification</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(to_email, "MiniCode Email Verification Code", html)
