"""
Nearby services proxy router endpoints (/api/nearby).
"""
from fastapi import APIRouter, HTTPException, Query

from app.services.nearby_service import (
    DEFAULT_RADIUS_KM,
    MAX_RADIUS_KM,
    NearbyService,
)

router = APIRouter(prefix="/api/nearby", tags=["nearby"])


@router.get("/services")
@router.get("/places")
async def nearby_services(
    lat: float = Query(..., ge=-90, le=90, description="Current latitude (required)"),
    lng: float = Query(..., ge=-180, le=180, description="Current longitude (required)"),
    category: str = Query("hotels", description="Service category"),
    radius: float = Query(DEFAULT_RADIUS_KM, ge=1, le=MAX_RADIUS_KM, description=f"Search radius in km (max {MAX_RADIUS_KM})"),
):
    if not NearbyService.is_valid_category(category):
        supported = ", ".join(NearbyService.supported_categories())
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported category '{category}'. Supported: {supported}",
        )

    try:
        return NearbyService.get_nearby_services(
            lat=lat, lng=lng, category=category, radius=radius
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Live services are temporarily unavailable ({type(exc).__name__}). Please try again later.",
        )
