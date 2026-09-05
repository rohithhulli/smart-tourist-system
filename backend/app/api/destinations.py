"""
API router compatibility shim. Re-exports app.routers.destinations.
"""
from app.routers.destinations import router

__all__ = ["router"]
