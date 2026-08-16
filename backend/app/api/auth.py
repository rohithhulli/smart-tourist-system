"""
Authentication API (Phase 3).

Signup, login, logout and current-user endpoints. Passwords are hashed with
bcrypt; successful login issues a signed JWT stored in an HttpOnly cookie.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core import security
from app.core.security import get_current_user
from app.database import get_db
from app.models.auth_schemas import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.models.orm import Favorite, Trip, User

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_response(db: Session, user: User) -> UserResponse:
    """Serialize a user plus their trip/favorite counts."""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at,
        trips_count=db.query(Trip).filter(Trip.user_id == user.id).count(),
        favorites_count=db.query(Favorite)
        .filter(Favorite.user_id == user.id)
        .count(),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=security.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue a session cookie so new users are logged in right away.
    token = security.create_access_token(user.id)
    security.set_auth_cookie(response, token)

    return AuthResponse(user=_user_response(db, user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = security.create_access_token(user.id)
    security.set_auth_cookie(response, token)
    return AuthResponse(user=_user_response(db, user))


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    security.clear_auth_cookie(response)
    return {"status": "success", "message": "Logged out"}


@router.get("/me", response_model=AuthResponse)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthResponse(user=_user_response(db, user))


@router.put("/me", response_model=AuthResponse)
def update_me(
    payload: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.email is not None:
        new_email = payload.email.lower()
        conflict = (
            db.query(User)
            .filter(User.email == new_email, User.id != user.id)
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )
        user.email = new_email

    db.commit()
    db.refresh(user)
    return AuthResponse(user=_user_response(db, user))
