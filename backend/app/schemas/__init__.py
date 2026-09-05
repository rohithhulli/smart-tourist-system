"""Schemas package exporting all request/response models."""
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.schemas.place import PlaceListResponse, PlaceResponse
from app.schemas.recommendation import (
    ItineraryDay,
    ItineraryPlace,
    ItineraryRequest,
    ItineraryResponse,
    LocationRecommendations,
    RecommendedPlace,
    RecommendRequest,
    RecommendResponse,
)
from app.schemas.trip import TripCreate, TripOut, TripPlaceSchema, TripUpdate

__all__ = [
    "SignupRequest",
    "LoginRequest",
    "UserUpdateRequest",
    "UserResponse",
    "AuthResponse",
    "TripPlaceSchema",
    "TripCreate",
    "TripUpdate",
    "TripOut",
    "PlaceResponse",
    "PlaceListResponse",
    "RecommendRequest",
    "ItineraryRequest",
    "RecommendedPlace",
    "LocationRecommendations",
    "RecommendResponse",
    "ItineraryPlace",
    "ItineraryDay",
    "ItineraryResponse",
]
