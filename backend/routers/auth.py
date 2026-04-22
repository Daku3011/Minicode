from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import datetime, timezone
import os
import httpx
import logging
from typing import Optional

from database import get_session
from models import User
from auth import (
    verify_password,
    create_access_token,
    get_github_user_info,
    encrypt_token,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/github/callback")
async def github_callback(
    request: Request,
    code: str,
    redirect_uri: Optional[str] = None,
    session: Session = Depends(get_session),
):
    # Exchange code for token
    params = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code": code,
    }
    if redirect_uri:
        params["redirect_uri"] = redirect_uri

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            params=params,
            headers={"Accept": "application/json"},
        )
        token_data = response.json()
        access_token = token_data.get("access_token")

    if not access_token:
        error_desc = token_data.get(
            "error_description", token_data.get("error", "Unknown error")
        )
        logger.error(f"GitHub OAuth error: {token_data}")
        raise HTTPException(
            status_code=400, detail=f"GitHub OAuth failed: {error_desc}"
        )

    # Get user info
    github_user = await get_github_user_info(access_token)

    # Create or update user
    statement = select(User).where(User.github_id == github_user["id"])
    user = session.exec(statement).first()

    if not user:
        user = User(
            username=github_user["login"],
            email=github_user.get("email") or f"{github_user['login']}@github.com",
            full_name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            github_id=github_user["id"],
            github_access_token=encrypt_token(access_token),
        )
        session.add(user)
    else:
        user.github_access_token = encrypt_token(access_token)

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create JWT
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str,
    redirect_uri: Optional[str] = None,
    session: Session = Depends(get_session),
):
    # Exchange code for token
    params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "code": code,
        "grant_type": "authorization_code",
    }
    if redirect_uri:
        params["redirect_uri"] = redirect_uri

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data=params,
            headers={"Accept": "application/json"},
        )
        token_data = response.json()
        access_token = token_data.get("access_token")

    if not access_token:
        error_desc = token_data.get("error_description", token_data.get("error", "Unknown error"))
        logger.error(f"Google OAuth error: {token_data}")
        raise HTTPException(
            status_code=400, detail=f"Google OAuth failed: {error_desc}"
        )

    # Get user info
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        google_user = user_info_resp.json()
        
    google_email = google_user.get("email")
    if not google_email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google.")

    # Prevent student logins (student emails contain numbers)
    if any(char.isdigit() for char in google_email.split('@')[0]):
        raise HTTPException(
            status_code=403,
            detail="Unauthorized: Students must use GitHub login. Google login is reserved for faculty."
        )

    # Only allow @scet.ac.in or existing faculty/admin to login
    statement = select(User).where(User.email == google_email)
    user = session.exec(statement).first()

    if not user:
        if google_email.endswith("@scet.ac.in"):
            # Auto-register faculty
            base_username = google_email.split("@")[0]
            username = base_username
            counter = 1
            while session.exec(select(User).where(User.username == username)).first():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User(
                username=username,
                email=google_email,
                full_name=google_user.get("name") or base_username,
                avatar_url=google_user.get("picture"),
                google_id=google_user.get("id"),
                role="faculty",
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            raise HTTPException(
                status_code=403, 
                detail="Unauthorized: Google login is restricted to @scet.ac.in emails or registered faculty members."
            )
    else:
        if user.role not in ["faculty", "admin"] and not google_email.endswith("@scet.ac.in"):
            raise HTTPException(
                status_code=403, 
                detail="Unauthorized: Google login is restricted to @scet.ac.in emails or registered faculty members."
            )
            
        # Ensure role is faculty if they log in with scet.ac.in (and aren't admin)
        if google_email.endswith("@scet.ac.in") and user.role not in ["faculty", "admin"]:
            user.role = "faculty"

        # Update google_id if this is their first time using Google Login
        if not user.google_id:
            user.google_id = google_user.get("id")

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create JWT
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    # Username mapped to username field
    user = session.exec(select(User).where(User.username == form_data.username)).first()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    session.add(user)
    session.commit()

    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
