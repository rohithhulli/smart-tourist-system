"""Recommender compatibility shim."""
from app.ml.recommender import ContentBasedRecommender, build_itinerary
from app.ml.scoring import compute_duration

__all__ = ["ContentBasedRecommender", "build_itinerary", "compute_duration"]
