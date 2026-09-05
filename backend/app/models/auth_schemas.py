"""Auth schemas compatibility shim."""
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
    UserUpdateRequest,
)

__all__ = [
    "AuthResponse",
    "LoginRequest",
    "SignupRequest",
    "UserResponse",
    "UserUpdateRequest",
]
