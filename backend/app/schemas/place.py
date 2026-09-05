"""
Pydantic schemas for tourist places.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PlaceResponse(BaseModel):
    id: str
    name: str
    city: str
    category: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    rating: Optional[float] = None
    estimated_cost: Optional[float] = None
    tags: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    image: Optional[str] = None
    popularity: Optional[int] = None
    distance_km: Optional[float] = None


class PlaceListResponse(BaseModel):
    status: str
    count: int
    radius: Optional[float] = None
    data: List[Dict[str, Any]]
