from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import datetime, UTC
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

router = APIRouter(tags=["auth"])

@router.get("/auth/github/callback")
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
    user.last_login = datetime.now(UTC)
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
    user.last_login = datetime.now(UTC)
    session.add(user)
    session.commit()

    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
