"""
System statistics router endpoints (/api/meta).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.ml.dataset import get_all_places
from app.models.favorite import Favorite
from app.models.trip import Trip
from app.models.user import User

router = APIRouter(prefix="/api/meta", tags=["meta"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    places = get_all_places()
    cities = {p.get("city") for p in places if p.get("city")}
    states = {p.get("state") for p in places if p.get("state")}
    categories = {p.get("category") for p in places if p.get("category")}
    rated: list[float] = [
        float(p["rating"]) for p in places if isinstance(p.get("rating"), (int, float))
    ]
    avg_rating = round(sum(rated) / len(rated), 2) if rated else None

    return {
        "status": "success",
        "data": {
            "total_places": len(places),
            "total_cities": len(cities),
            "total_states": len(states),
            "total_categories": len(categories),
            "avg_rating": avg_rating,
            "users": db.query(User).count(),
            "trips": db.query(Trip).count(),
            "favorites": db.query(Favorite).count(),
        },
    }
