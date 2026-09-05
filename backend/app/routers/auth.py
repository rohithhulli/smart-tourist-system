"""
Authentication router endpoints (/api/auth).
"""
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import clear_auth_cookie, get_current_user, set_auth_cookie
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Deliberately does NOT issue a session token: signup only creates the
    # account; the client must authenticate explicitly via /login.
    user, _token = AuthService.signup(db, payload)
    return AuthResponse(user=AuthService.build_user_response(db, user))


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest, response: Response, db: Session = Depends(get_db)
):
    user, token = AuthService.login(db, payload)
    set_auth_cookie(response, token)
    return AuthResponse(user=AuthService.build_user_response(db, user))


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService.build_user_response(db, current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = AuthService.update_profile(db, current_user, payload)
    return AuthService.build_user_response(db, updated)


# Legacy alias matching the frontend's PUT /api/auth/me call.
@router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = AuthService.update_profile(db, current_user, payload)
    return AuthService.build_user_response(db, updated)
