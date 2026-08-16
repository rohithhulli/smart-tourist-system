from typing import List

from fastapi import APIRouter, HTTPException

from app.data.tourist_places import TOURIST_PLACES, get_place_by_id
from app.ml_engine.recommender import (
    ContentBasedRecommender,
    build_itinerary,
    compute_duration,
)
from app.models.schemas import (
    ItineraryRequest,
    ItineraryResponse,
    LocationRecommendations,
    RecommendRequest,
    RecommendResponse,
)

router = APIRouter(prefix="/api/planner", tags=["planner"])

# The recommender is built once at import time (TF-IDF fit is fast and
# deterministic); the vectorizer and matrices are reused across requests.
_recommender = ContentBasedRecommender(TOURIST_PLACES)


@router.get("/status")
async def planner_status():
    return {
        "status": "success",
        "message": "Planner API is available.",
        "engine": "content-based (TF-IDF cosine similarity)",
        "places_loaded": len(TOURIST_PLACES),
    }


def _ordered_trip_locations(request: RecommendRequest) -> List[str]:
    """START + ALL STOPS + DESTINATION, de-duplicated, in trip order."""
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


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    duration = compute_duration(request.duration_days, request.start_date, request.end_date)

    # Legacy destination-wide ranking (kept so existing consumers keep working).
    recommendations, meta = _recommender.recommend(
        destination=request.destination.strip(),
        interests=request.interests,
        categories=request.categories,
        activities=request.activities,
        budget=request.budget,
        duration_days=duration,
        travelers=request.travelers,
        top_n=request.top_n,
    )

    # Grouped ranking: one recommendation set PER trip location, in trip order.
    ordered = _ordered_trip_locations(request)
    locations: List[LocationRecommendations] = []
    last = len(ordered) - 1
    for idx, location in enumerate(ordered):
        if idx == 0:
            location_type = "start"
        elif idx == last:
            location_type = "destination"
        else:
            location_type = "stop"

        loc_recs, loc_meta = _recommender.recommend_for_location(
            location=location,
            interests=request.interests,
            categories=request.categories,
            activities=request.activities,
            budget=request.budget,
            duration_days=duration,
            travelers=request.travelers,
        )

        if not loc_meta["destination_resolved"]:
            loc_message = (
                f"No tourist data matched for {location}. It may be outside the "
                "catalogue or could not be located on the map."
            )
        elif not loc_recs:
            loc_message = (
                f"No tourist places in the catalogue were found for {location} "
                f"within the supported region."
            )
        else:
            loc_message = (
                f"Top {len(loc_recs)} places ranked for {location} using your preferences."
            )

        locations.append(
            LocationRecommendations(
                location=location,
                location_type=location_type,
                coords=loc_meta["destination_coords"],
                resolved=loc_meta["destination_resolved"],
                places_found=loc_meta.get("candidates", len(loc_recs)),
                recommendations=loc_recs,
                message=loc_message,
            )
        )

    if not meta["destination_resolved"]:
        message = (
            "Destination could not be located on the map. Recommendations are ranked "
            "by preference match, quality and budget."
        )
    elif not (request.interests or request.categories or request.activities):
        message = (
            "No interests selected. Recommendations are ranked by quality, budget and "
            "proximity to the destination."
        )
    else:
        message = f"Top {len(recommendations)} recommendations generated from your preferences."

    return RecommendResponse(
        status="success",
        destination=request.destination,
        destination_coords=meta["destination_coords"],
        duration_days=duration,
        travelers=request.travelers,
        budget=request.budget,
        preferences={
            "interests": request.interests,
            "categories": request.categories,
            "activities": request.activities,
        },
        total_places_considered=len(TOURIST_PLACES),
        recommendations=recommendations,
        locations=locations,
        message=message,
    )


@router.post("/itinerary", response_model=ItineraryResponse)
async def itinerary(request: ItineraryRequest):
    places: List[dict] = []
    for place_id in request.place_ids:
        place = get_place_by_id(place_id)
        if place is None:
            raise HTTPException(
                status_code=404,
                detail=f"Place '{place_id}' was not found in the catalogue.",
            )
        places.append(place)

    duration = compute_duration(request.duration_days, request.start_date, request.end_date)

    result = build_itinerary(
        selected_places=places,
        destination=request.destination,
        start_location=request.start_location,
        budget=request.budget,
        travelers=request.travelers,
        duration_days=duration,
        start_date=request.start_date,
    )

    return ItineraryResponse(
        status="success",
        destination=request.destination,
        duration_days=duration,
        days=result["days"],
        total_cost=result["total_cost"],
        total_distance_km=result["total_distance_km"],
        total_places=result["total_places"],
        message=f"Day-wise itinerary built across {duration} day(s) with {result['total_places']} stops.",
    )
