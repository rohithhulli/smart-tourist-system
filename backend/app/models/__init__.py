"""Models package exporting all ORM entities and base."""
from app.core.database import Base
from app.models.destination import Destination, DestinationGallery, Event, PlaceGallery, Review
from app.models.favorite import Favorite
from app.models.tourist_place import TouristPlace
from app.models.trip import Trip, TripPlace
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "Trip",
    "TripPlace",
    "Favorite",
    "TouristPlace",
    "Destination",
    "Event",
    "DestinationGallery",
    "PlaceGallery",
    "Review",
]
