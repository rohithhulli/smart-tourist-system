"""
Pydantic request/response schemas for the recommendation engine.
"""
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    destination: str = Field(..., min_length=1, description="Destination city or region")
    start_location: str = Field("", description="Starting location (optional)")
    stops: List[str] = Field(default_factory=list, description="Intermediate via/stops in order")
    interests: List[str] = Field(default_factory=list, description="e.g. History, Nature, Food")
    categories: List[str] = Field(default_factory=list, description="Preferred place categories")
    activities: List[str] = Field(default_factory=list, description="Preferred activities")
    budget: float = Field(10000, ge=0, description="Total trip budget in INR")
    travelers: int = Field(2, ge=1, description="Number of travelers")
    start_date: Optional[str] = Field(None, description="ISO start date (optional)")
    end_date: Optional[str] = Field(None, description="ISO end date (optional)")
    duration_days: Optional[int] = Field(None, ge=1, description="Trip duration in days")
    top_n: int = Field(12, ge=1, le=50, description="Number of recommendations to return")


class ItineraryRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    start_location: str = Field("")
    interests: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    activities: List[str] = Field(default_factory=list)
    budget: float = Field(10000, ge=0)
    travelers: int = Field(2, ge=1)
    start_date: Optional[str] = Field(None)
    end_date: Optional[str] = Field(None)
    duration_days: Optional[int] = Field(None, ge=1)
    place_ids: List[str] = Field(..., min_length=1, description="Selected place ids (in order)")


class RecommendedPlace(BaseModel):
    place: Dict[str, Any]
    recommendation_score: float
    match_reason: str
    distance_km: Optional[float]
    score_breakdown: Dict[str, float]


class LocationRecommendations(BaseModel):
    """Recommendations grouped under a single trip location."""

    location: str
    location_type: str  # "start" | "stop" | "destination"
    coords: Optional[List[float]]
    resolved: bool
    places_found: int
    recommendations: List[RecommendedPlace]
    message: str


class RecommendResponse(BaseModel):
    status: str
    destination: str
    destination_coords: Optional[List[float]]
    duration_days: int
    travelers: int
    budget: float
    preferences: Dict[str, List[str]]
    total_places_considered: int
    recommendations: List[RecommendedPlace]
    locations: List[LocationRecommendations] = Field(
        default_factory=list,
        description="Recommendations grouped by trip location, in trip order.",
    )
    message: str


class ItineraryPlace(BaseModel):
    place: Dict[str, Any]
    time_slot: str
    estimated_cost: float
    distance_from_prev_km: Optional[float]
    travel_time_minutes: Optional[int]


class ItineraryDay(BaseModel):
    day: int
    date: Optional[str]
    theme: str
    places: List[ItineraryPlace]
    notes: str
    day_budget: float
    day_distance_km: float


class ItineraryResponse(BaseModel):
    status: str
    destination: str
    duration_days: int
    days: List[ItineraryDay]
    total_cost: float
    total_distance_km: float
    total_places: int
    message: str
