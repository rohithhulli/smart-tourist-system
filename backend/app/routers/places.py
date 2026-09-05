"""
Tourist places router endpoints (/api/places).
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.place_service import PlaceService

router = APIRouter(prefix="/api/places", tags=["places"])
MAX_RADIUS_KM = 80


@router.get("/")
async def get_canonical_places(
    city: Optional[str] = Query(None, description="Filter by city name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    lat: Optional[float] = Query(None, description="Current latitude for distance"),
    lng: Optional[float] = Query(None, description="Current longitude for distance"),
    radius: float = Query(MAX_RADIUS_KM, ge=1, le=MAX_RADIUS_KM, description=f"Search radius in km (max {MAX_RADIUS_KM})"),
):
    data = PlaceService.filter_places(
        city=city,
        category=category,
        lat=lat,
        lng=lng,
        radius=radius,
    )
    return {
        "status": "success",
        "count": len(data),
        "radius": radius if lat is not None and lng is not None else None,
        "data": data,
    }


@router.get("/search")
async def search_places(
    q: str = Query(..., min_length=2, max_length=100, description="Search query"),
    limit: int = Query(8, ge=1, le=50, description="Maximum number of results"),
):
    results = PlaceService.search_places(q, limit)
    return {
        "status": "success",
        "query": q,
        "count": len(results),
        "data": results,
    }


@router.get("/{place_id}/nearby")
async def get_place_nearby(
    place_id: str,
    radius: float = Query(80.0, ge=1, le=MAX_RADIUS_KM, description="Nearby radius in km (default 80km, max 80km)"),
    limit: int = Query(10, ge=1, le=50, description="Max nearby attractions to return"),
):
    """Find nearby attractions strictly within radius km of the given place."""
    place = PlaceService.get_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    nearby = PlaceService.get_nearby_for_place(place_id, radius_km=radius, limit=limit)
    return {
        "status": "success",
        "place_id": place["id"],
        "place_name": place["name"],
        "radius_km": radius,
        "count": len(nearby),
        "data": nearby,
    }


@router.get("/{place_id}/gallery")
async def get_place_gallery(place_id: str):
    """Get photo gallery for a place."""
    place = PlaceService.get_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    gallery = PlaceService.get_gallery_for_place(place_id)
    return {
        "status": "success",
        "place_id": place["id"],
        "count": len(gallery),
        "data": gallery,
    }


@router.get("/{place_id}/reviews")
async def get_place_reviews(place_id: str):
    """Get reviews for a place."""
    place = PlaceService.get_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    reviews = PlaceService.get_reviews_for_place(place_id)
    return {
        "status": "success",
        "place_id": place["id"],
        "count": len(reviews),
        "data": reviews,
    }


@router.get("/{place_id}")
async def get_place(place_id: str):
    place = PlaceService.get_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return {"status": "success", "data": place}
