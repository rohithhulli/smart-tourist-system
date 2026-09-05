"""
Security, password hashing, and authentication utilities.

Password hashing uses bcrypt; session tokens are signed JWTs delivered through
an HttpOnly cookie named `access_token` (with Bearer header fallback).
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from jwt import PyJWTError
from sqlalchemy.orm import Session

from app.core import config
from app.core.database import get_db
from app.models.user import User


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (includes salt)."""
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Return True when the plaintext password matches the stored hash."""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except ValueError:
        return False


def create_access_token(user_id: int) -> str:
    """Create a signed JWT for the given user id."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=config.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[int]:
    """Decode a JWT and return the user id, or None when invalid/expired."""
    try:
        payload = jwt.decode(
            token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM]
        )
        return int(payload["sub"])
    except (PyJWTError, KeyError, ValueError):
        return None


def get_current_user(
    request: Request, db: Session = Depends(get_db)
) -> User:
    """FastAPI dependency returning the authenticated user (401 otherwise)."""
    token = request.cookies.get(config.AUTH_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return user


def get_optional_current_user(
    request: Request, db: Session = Depends(get_db)
) -> Optional[User]:
    """Like get_current_user but returns None instead of raising 401.

    Used by endpoints that work for anonymous visitors (e.g. recommendations)
    but can personalise results when a valid session cookie is present.
    """
    try:
        return get_current_user(request, db)
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            return None
        raise


def set_auth_cookie(response, token: str) -> None:
    """Attach the JWT to the response as an HttpOnly cookie."""
    response.set_cookie(
        key=config.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=config.COOKIE_SECURE,
        samesite="lax",
        max_age=config.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )


def clear_auth_cookie(response) -> None:
    """Expire the auth cookie so the client session ends."""
    response.delete_cookie(
        key=config.AUTH_COOKIE_NAME,
        path="/",
    )
