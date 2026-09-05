"""
Pydantic schemas for authentication and user profiles.
"""
from datetime import datetime
from typing import Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    # Accepts "name" (legacy clients) and "full_name" (documented API contract).
    name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        validation_alias=AliasChoices("name", "full_name"),
    )
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime
    trips_count: int = 0
    favorites_count: int = 0


class AuthResponse(BaseModel):
    user: UserResponse
