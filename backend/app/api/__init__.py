"""API package compatibility shim."""
from app.routers import (
    auth_router,
    favorites_router,
    meta_router,
    nearby_router,
    places_router,
    planner_router,
    trips_router,
)

__all__ = [
    "auth_router",
    "favorites_router",
    "meta_router",
    "nearby_router",
    "places_router",
    "planner_router",
    "trips_router",
]
