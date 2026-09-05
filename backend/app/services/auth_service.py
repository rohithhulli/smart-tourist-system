"""
Authentication and user management business logic.
"""
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.favorite import Favorite
from app.models.trip import Trip
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, UserResponse, UserUpdateRequest


class AuthService:
    @staticmethod
    def signup(db: Session, req: SignupRequest) -> Tuple[User, str]:
        existing = db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user = User(
            name=req.name.strip(),
            email=req.email.lower(),
            password_hash=hash_password(req.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(user.id)
        return user, token

    @staticmethod
    def login(db: Session, req: LoginRequest) -> Tuple[User, str]:
        user = db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(user.id)
        return user, token

    @staticmethod
    def update_profile(db: Session, user: User, req: UserUpdateRequest) -> User:
        if req.email and req.email.lower() != user.email:
            existing = (
                db.query(User)
                .filter(User.email == req.email.lower(), User.id != user.id)
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists",
                )
            user.email = req.email.lower()

        if req.name is not None:
            user.name = req.name.strip()

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def build_user_response(db: Session, user: User) -> UserResponse:
        trips_count = db.query(Trip).filter(Trip.user_id == user.id).count()
        favorites_count = db.query(Favorite).filter(Favorite.user_id == user.id).count()
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at,
            trips_count=trips_count,
            favorites_count=favorites_count,
        )
