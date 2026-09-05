"""Routers package exporting all route handlers."""
from app.routers.auth import router as auth_router
from app.routers.favorites import router as favorites_router
from app.routers.meta import router as meta_router
from app.routers.nearby import router as nearby_router
from app.routers.places import router as places_router
from app.routers.planner import router as planner_router
from app.routers.trips import router as trips_router

__all__ = [
    "auth_router",
    "favorites_router",
    "meta_router",
    "nearby_router",
    "places_router",
    "planner_router",
    "trips_router",
]
