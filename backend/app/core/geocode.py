"""
Geocoding compatibility shim.

Re-exports distance and geocoding utilities from app.utils.distance.
"""
from app.utils.distance import (
    ALIASES,
    CITY_COORDS,
    GEOCODING_USER_AGENT,
    INDIA_BBOX,
    _inside_india,
    _normalise,
    haversine_km,
    resolve_coords,
)

__all__ = [
    "ALIASES",
    "CITY_COORDS",
    "GEOCODING_USER_AGENT",
    "INDIA_BBOX",
    "_inside_india",
    "_normalise",
    "haversine_km",
    "resolve_coords",
]
