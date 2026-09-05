"""Schemas compatibility shim."""
from app.schemas.recommendation import (
    ItineraryDay,
    ItineraryPlace,
    ItineraryRequest,
    ItineraryResponse,
    LocationRecommendations,
    RecommendRequest,
    RecommendResponse,
    RecommendedPlace,
)

__all__ = [
    "RecommendRequest",
    "ItineraryRequest",
    "RecommendedPlace",
    "LocationRecommendations",
    "RecommendResponse",
    "ItineraryPlace",
    "ItineraryDay",
    "ItineraryResponse",
]
