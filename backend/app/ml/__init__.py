"""ML and Recommendation package."""
from app.ml.dataset import (
    PLACE_COUNT,
    TOURIST_PLACES,
    get_all_places,
    get_place_by_id,
    get_places_by_city,
)
from app.ml.recommender import ContentBasedRecommender, build_itinerary
from app.ml.scoring import compute_duration

__all__ = [
    "TOURIST_PLACES",
    "PLACE_COUNT",
    "get_all_places",
    "get_place_by_id",
    "get_places_by_city",
    "ContentBasedRecommender",
    "build_itinerary",
    "compute_duration",
]
