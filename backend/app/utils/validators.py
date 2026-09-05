"""
Input and domain validators.
"""
from typing import Optional


def validate_coordinates(lat: Optional[float], lng: Optional[float]) -> bool:
    """Check if lat/lng are within standard geographic bounds."""
    if lat is None or lng is None:
        return False
    return -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0


def validate_radius(radius: float, max_radius: float = 80.0) -> float:
    """Clamp radius between 1.0 km and max_radius."""
    return max(1.0, min(radius, max_radius))
