"""
Planner and recommendation router endpoints (/api/planner and /api/recommend).
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.user import User
from app.schemas.recommendation import (
    ItineraryRequest,
    ItineraryResponse,
    RecommendRequest,
    RecommendResponse,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/planner", tags=["planner"])


@router.get("/status")
async def planner_status():
    return RecommendationService.get_status()


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(
    request: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    # Works anonymously; personalizes when a valid session cookie exists.
    return RecommendationService.generate_recommendations(
        request, db=db, current_user=current_user
    )


@router.post("/itinerary", response_model=ItineraryResponse)
async def build_itinerary_endpoint(request: ItineraryRequest):
    return RecommendationService.generate_itinerary(request)
