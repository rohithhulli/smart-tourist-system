"""
Pydantic schemas for trip planning and saved trips.
"""
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TripPlaceSchema(BaseModel):
    id: Any = None
    name: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    estimated_cost: Optional[float] = None
    tripLocation: Optional[str] = None


class TripCreate(BaseModel):
    title: str = Field(..., max_length=200)
    start_location: Optional[str] = None
    destination: str = Field(..., min_length=1, max_length=200)
    stops: List[str] = Field(default_factory=list)
    dates: Optional[str] = None
    budget: Optional[float] = 0
    selected_places: List[TripPlaceSchema] = Field(default_factory=list)
    cover_image: Optional[str] = None
    status: Optional[str] = "Active"

    # Additional spec fields
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    interests: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    itinerary: Optional[dict] = None
    route: Optional[dict] = None
    duration_days: Optional[int] = None


class TripUpdate(BaseModel):
    title: Optional[str] = None
    start_location: Optional[str] = None
    destination: Optional[str] = None
    stops: Optional[List[str]] = None
    dates: Optional[str] = None
    budget: Optional[float] = None
    selected_places: Optional[List[TripPlaceSchema]] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    interests: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    itinerary: Optional[dict] = None
    route: Optional[dict] = None
    duration_days: Optional[int] = None


class TripOut(TripCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: Any = None
    updated_at: Any = None
