from fastapi import APIRouter, Query
from typing import Optional

from app.data.tourist_places import TOURIST_PLACES
from app.core.geocode import haversine_km

router = APIRouter(prefix="/api/places", tags=["places"])

MAX_RADIUS_KM = 35


def _decorate(place: dict, lat: Optional[float] = None, lng: Optional[float] = None) -> dict:
    """Add frontend-friendly aliases and live distance to a canonical place."""
    out = dict(place)
    out["open_time"] = place.get("opening_time")
    out["close_time"] = place.get("closing_time")
    out["snapshots"] = [place["image"]] if place.get("image") else []
    out["reviews_count"] = int(place.get("popularity", 0) * 130)
    if lat is not None and lng is not None:
        out["distance_km"] = haversine_km(lat, lng, place["latitude"], place["longitude"])
    return out


def _filter_by_radius(data, lat, lng, radius):
    """Keep only places whose REAL haversine distance from (lat, lng) is <= radius."""
    out = []
    for p in data:
        dist = p.get("distance_km")
        if dist is not None and dist <= radius:
            out.append(p)
    out.sort(key=lambda p: p["distance_km"])
    return out


@router.get("/")
async def get_canonical_places(
    city: Optional[str] = Query(None, description="Filter by city name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    lat: Optional[float] = Query(None, description="Current latitude for distance"),
    lng: Optional[float] = Query(None, description="Current longitude for distance"),
    radius: float = Query(MAX_RADIUS_KM, ge=1, le=MAX_RADIUS_KM, description=f"Search radius in km (max {MAX_RADIUS_KM})"),
):
    """Return the canonical tourist-place dataset (single source of truth)."""
    results = list(TOURIST_PLACES)

    if city:
        wanted = city.strip().lower()
        results = [p for p in results if p["city"].lower() == wanted]
    if category and category.lower() != "all":
        wanted = category.strip().lower()
        results = [p for p in results if p["category"].lower() == wanted]

    data = [_decorate(p, lat, lng) for p in results]

    # Enforce the 35 km rule using actual geographic distance.
    if lat is not None and lng is not None:
        data = _filter_by_radius(data, lat, lng, radius)

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
    """Text search across the canonical dataset (name, city, category, tags).

    Only returns real catalogue places; never fabricated results.
    """
    needle = q.strip().lower()
    if not needle:
        return {"status": "success", "query": q, "count": 0, "data": []}

    matches = []
    for p in TOURIST_PLACES:
        haystack = " ".join(
            [
                str(p.get("name", "")),
                str(p.get("city", "")),
                str(p.get("category", "")),
                str(p.get("description", ""))[:300],
                " ".join(p.get("tags", []) or []),
            ]
        ).lower()
        if needle in haystack:
            matches.append(_decorate(p))
        if len(matches) >= limit:
            break

    return {
        "status": "success",
        "query": q,
        "count": len(matches),
        "data": matches,
    }


@router.get("/nearby")
async def nearby_places(
    lat: float = Query(..., description="Current latitude (required)"),
    lng: float = Query(..., description="Current longitude (required)"),
    category: str = Query("all", description="Filter by category (e.g. Temple, Heritage)"),
    radius: float = Query(MAX_RADIUS_KM, ge=1, le=MAX_RADIUS_KM, description=f"Search radius in km (max {MAX_RADIUS_KM})"),
):
    """Nearby tourist places around the live GPS coordinates.

    Backend always computes the REAL haversine distance between the user's
    coordinates and each place's coordinates, keeps only places within the
    requested radius (hard-capped at 35 km), and returns them sorted by
    distance ascending. No fabricated distances are ever returned.
    """
    wanted_cat = category.strip().lower()

    data = []
    for p in TOURIST_PLACES:
        if wanted_cat and wanted_cat != "all" and p["category"].lower() != wanted_cat:
            continue
        data.append(_decorate(p, lat, lng))

    data = _filter_by_radius(data, lat, lng, radius)

    return {"status": "success", "count": len(data), "radius": radius, "data": data}
