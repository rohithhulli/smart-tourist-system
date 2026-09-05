"""
Recommendation and itinerary generation business logic.
"""
from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.ml.dataset import TOURIST_PLACES, get_place_by_id
from app.ml.preferences import build_preference_profile, describe_history
from app.ml.recommender import ContentBasedRecommender, build_itinerary
from app.ml.scoring import compute_duration
from app.models.user import User
from app.schemas.recommendation import (
    ItineraryRequest,
    ItineraryResponse,
    LocationRecommendations,
    RecommendRequest,
    RecommendResponse,
)
from app.utils.distance import resolve_coords

_recommender = ContentBasedRecommender(TOURIST_PLACES)


class RecommendationService:
    @staticmethod
    def get_status() -> dict:
        return {
            "status": "success",
            "message": "Planner API is available.",
            "engine": "hybrid content-based (TF-IDF cosine similarity + category, "
                      "traveler-type and personal-history signals)",
            "places_loaded": len(TOURIST_PLACES),
        }

    @staticmethod
    def get_ordered_trip_locations(request: RecommendRequest) -> List[str]:
        ordered: List[str] = []
        for name in [
            request.start_location.strip(),
            *[s.strip() for s in request.stops if s and s.strip()],
            request.destination.strip(),
        ]:
            if not name:
                continue
            if name.lower() not in [o.lower() for o in ordered]:
                ordered.append(name)
        return ordered

    @classmethod
    def generate_recommendations(
        cls,
        request: RecommendRequest,
        db: Optional[Session] = None,
        current_user: Optional[User] = None,
    ) -> RecommendResponse:
        duration = compute_duration(request.duration_days, request.start_date, request.end_date)

        # Deterministic personalization profile from the signed-in user's own
        # favorites and saved trips. Empty (neutral) when anonymous or when
        # the user has no history yet.
        profile: Dict[str, float] = {}
        history_source = ""
        if db is not None and current_user is not None:
            profile = build_preference_profile(db, current_user)
            if profile:
                history_source = describe_history(db, current_user)

        recommendations, meta = _recommender.recommend(
            destination=request.destination.strip(),
            interests=request.interests,
            categories=request.categories,
            activities=request.activities,
            budget=request.budget,
            duration_days=duration,
            travelers=request.travelers,
            top_n=request.top_n,
            traveler_type=request.traveler_type,
            preference_profile=profile,
            history_source=history_source,
        )

        loc_sections: List[LocationRecommendations] = []
        ordered_locations = cls.get_ordered_trip_locations(request)

        for loc_name in ordered_locations:
            if loc_name.lower() == request.start_location.strip().lower():
                loc_type = "start"
            elif loc_name.lower() == request.destination.strip().lower():
                loc_type = "destination"
            else:
                loc_type = "stop"

            loc_recs, loc_meta = _recommender.recommend_for_location(
                location=loc_name,
                interests=request.interests,
                categories=request.categories,
                activities=request.activities,
                budget=request.budget,
                duration_days=duration,
                travelers=request.travelers,
                traveler_type=request.traveler_type,
                preference_profile=profile,
                history_source=history_source,
            )

            resolved = loc_meta.get("destination_resolved", False)
            if resolved:
                msg = f"{len(loc_recs)} places within reach of {loc_name}."
            elif loc_recs:
                msg = f"{len(loc_recs)} places matched in {loc_name}."
            else:
                msg = f"No tourist spots on record directly in {loc_name}."

            loc_sections.append(
                LocationRecommendations(
                    location=loc_name,
                    location_type=loc_type,
                    coords=loc_meta.get("destination_coords"),
                    resolved=resolved,
                    places_found=len(loc_recs),
                    recommendations=loc_recs,
                    message=msg,
                )
            )

        resolved_dest = meta.get("destination_resolved", False)
        if not recommendations:
            msg = f"No tourist places match your filters near {request.destination}."
        elif not resolved_dest:
            msg = (
                f"Generated {len(recommendations)} recommendations for {request.destination}. "
                "Note: destination was not in our Karnataka map so ranking is interest-led."
            )
        else:
            msg = f"Generated {len(recommendations)} recommendations tailored for {request.destination}."

        preferences: Dict[str, Any] = {
            "interests": request.interests,
            "categories": request.categories,
            "activities": request.activities,
        }
        if request.traveler_type:
            preferences["traveler_type"] = [request.traveler_type]
        if profile:
            preferences["personalized"] = ["true"]

        return RecommendResponse(
            status="success",
            destination=request.destination,
            destination_coords=meta.get("destination_coords"),
            duration_days=duration,
            travelers=request.travelers,
            budget=request.budget,
            preferences=preferences,
            total_places_considered=len(TOURIST_PLACES),
            recommendations=recommendations,
            locations=loc_sections,
            message=msg,
        )

    @staticmethod
    def generate_itinerary(request: ItineraryRequest) -> ItineraryResponse:
        resolved_places = []
        for pid in request.place_ids:
            p = get_place_by_id(pid)
            if p:
                resolved_places.append(p)

        if not resolved_places:
            raise HTTPException(
                status_code=400,
                detail="None of the requested place_ids were found in the dataset.",
            )

        duration = compute_duration(request.duration_days, request.start_date, request.end_date)

        itinerary = build_itinerary(
            selected_places=resolved_places,
            destination=request.destination.strip(),
            start_location=request.start_location.strip(),
            budget=request.budget,
            travelers=request.travelers,
            duration_days=duration,
            start_date=request.start_date,
        )

        return ItineraryResponse(
            status="success",
            destination=request.destination,
            duration_days=duration,
            days=itinerary["days"],
            total_cost=itinerary["total_cost"],
            total_distance_km=itinerary["total_distance_km"],
            total_places=itinerary["total_places"],
            message=f"Built a {duration}-day itinerary with {len(resolved_places)} places.",
        )
