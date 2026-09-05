"""
Destinations router endpoints (/api/destinations).
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.destination_service import DestinationService

router = APIRouter(prefix="/api/destinations", tags=["destinations"])


@router.get("/")
async def list_destinations(
    search: Optional[str] = Query(None, description="Search destinations by keyword"),
    category: Optional[str] = Query(None, description="Filter by destination category"),
    state: Optional[str] = Query(None, description="Filter by state"),
):
    """Retrieve all curated travel destinations in India."""
    items = DestinationService.list_destinations(
        query=search,
        category=category,
        state=state,
    )
    return {
        "status": "success",
        "count": len(items),
        "data": items,
    }


@router.get("/search")
async def search_destinations(
    q: str = Query(..., min_length=2, max_length=100, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    """Search destinations by name, district, or description."""
    items = DestinationService.list_destinations(query=q)
    return {
        "status": "success",
        "query": q,
        "count": min(len(items), limit),
        "data": items[:limit],
    }


@router.get("/unified-search")
async def unified_search(
    q: str = Query(..., min_length=2, max_length=100, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    """Unified search matching both destinations and tourist places."""
    results = DestinationService.search_all(query=q, limit=limit)
    return {
        "status": "success",
        "data": results,
    }


@router.get("/{slug}/places")
async def get_destination_places(slug: str):
    """Get all curated tourist places belonging to a destination."""
    dest = DestinationService.get_by_slug(slug)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    places = DestinationService.get_places_for_destination(slug)
    return {
        "status": "success",
        "destination_slug": dest["slug"],
        "destination_name": dest["name"],
        "count": len(places),
        "data": places,
    }


@router.get("/{slug}/events")
async def get_destination_events(slug: str):
    """Get cultural events and festivals for a destination."""
    dest = DestinationService.get_by_slug(slug)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    events = DestinationService.get_events_for_destination(slug)
    return {
        "status": "success",
        "destination_slug": dest["slug"],
        "count": len(events),
        "data": events,
    }


@router.get("/{slug}/gallery")
async def get_destination_gallery(slug: str):
    """Get photo gallery for a destination."""
    dest = DestinationService.get_by_slug(slug)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    gallery = DestinationService.get_gallery_for_destination(slug)
    return {
        "status": "success",
        "destination_slug": dest["slug"],
        "count": len(gallery),
        "data": gallery,
    }


@router.get("/{slug}/reviews")
async def get_destination_reviews(slug: str):
    """Get community reviews for a destination."""
    dest = DestinationService.get_by_slug(slug)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")

    reviews = DestinationService.get_reviews_for_destination(slug)
    return {
        "status": "success",
        "destination_slug": dest["slug"],
        "count": len(reviews),
        "data": reviews,
    }


@router.get("/{slug}")
async def get_destination(slug: str):
    """Get destination details by slug or numeric ID."""
    dest = DestinationService.get_by_slug(slug)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return {
        "status": "success",
        "data": dest,
    }
