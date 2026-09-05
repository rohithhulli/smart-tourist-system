"""
Deterministic user-preference profiling built ONLY from genuine user actions.

Sources (no fabricated data):
  * Favorite rows          (weight FAVORITE_WEIGHT per place)
  * Trip.selected_places   (weight TRIP_PLACE_WEIGHT per place)
  * TripPlace rows         (same weight, deduped with selected_places)

The profile is a flat {label: score} map where labels are casefolded
dataset category names and tag names. Casefolding makes naturally
co-occurring labels merge (tag "waterfall" reinforces category
"Waterfall"). Scores are normalized to [0, 1] by dividing by the max.

A user without history gets an empty profile; the recommender then uses
NEUTRAL_PREFERENCE_SCORE for every place, so recommendations keep working
normally and the ranking is not distorted.
"""
from collections import defaultdict
from typing import Dict, Optional, Set

from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.trip import Trip
from app.models.user import User

FAVORITE_WEIGHT = 1.0
TRIP_PLACE_WEIGHT = 0.7

MAX_TAGS_PER_PLACE = 5

# Constant used when a user has no history at all.
NEUTRAL_PREFERENCE_SCORE = 0.5

# Threshold above which a profile label counts as a "strong" preference.
STRONG_LABEL_THRESHOLD = 0.5


def _casefold(label) -> str:
    return str(label or "").strip().casefold()


def _collect_points(db: Session, user_id: int):
    """Accumulate raw points per label from favorites and saved trips."""
    points: Dict[str, float] = defaultdict(float)

    def add_place(place_id: str, weight: float, seen: Set[str]) -> None:
        # Lazy import avoids a circular import with app.ml.dataset.
        from app.ml.dataset import get_place_by_id

        key = _casefold(place_id)
        if not key or key in seen:
            return
        seen.add(key)
        place = get_place_by_id(str(place_id))
        if place is None:
            return  # unknown/legacy id — skip silently, never fabricate

        points[_casefold(place.get("category"))] += 2.0 * weight
        for tag in (place.get("tags") or [])[:MAX_TAGS_PER_PLACE]:
            points[_casefold(tag)] += 1.0 * weight

    favorite_ids = {
        row.place_id
        for row in db.query(Favorite).filter(Favorite.user_id == user_id).all()
    }
    seen_favorites: Set[str] = set()
    for pid in sorted(favorite_ids):  # deterministic order
        add_place(pid, FAVORITE_WEIGHT, seen_favorites)

    trips = (
        db.query(Trip)
        .filter(Trip.user_id == user_id)
        .order_by(Trip.id.asc())
        .all()
    )
    seen_trip_places: Set[str] = set()
    for trip in trips:
        for p in trip.selected_places or []:
            pid = p.get("id") or p.get("place_id") or p.get("name")
            add_place(pid, TRIP_PLACE_WEIGHT, seen_trip_places)

    return points


def build_preference_profile(db: Session, user: Optional[User]) -> Dict[str, float]:
    """Normalized {label: score in [0,1]} profile, {} when no history."""
    if user is None:
        return {}
    points = _collect_points(db, user.id)
    if not points:
        return {}
    peak = max(points.values())
    if peak <= 0:
        return {}
    return {label: round(value / peak, 4) for label, value in sorted(points.items())}


def preference_score(place: dict, profile: Dict[str, float]) -> float:
    """Preference fit of one place in [0, 1]; neutral when profile empty."""
    if not profile:
        return NEUTRAL_PREFERENCE_SCORE

    cat = profile.get(_casefold(place.get("category")), 0.0)

    tag_scores = [
        profile.get(_casefold(t), 0.0)
        for t in (place.get("tags") or [])
        if profile.get(_casefold(t), 0.0) > 0
    ]
    tag_component = sum(sorted(tag_scores, reverse=True)[:3]) / 3.0 if tag_scores else 0.0

    return min(1.0, cat + 0.5 * tag_component)


def matched_preference_labels(place: dict, profile: Dict[str, float], limit: int = 3):
    """Strong profile labels this place exhibits (prettified for reasons)."""
    if not profile:
        return []
    hits = set()
    cat_key = _casefold(place.get("category"))
    if profile.get(cat_key, 0.0) >= STRONG_LABEL_THRESHOLD:
        hits.add(cat_key)
    for t in place.get("tags") or []:
        key = _casefold(t)
        if profile.get(key, 0.0) >= STRONG_LABEL_THRESHOLD:
            hits.add(key)
    ranked = sorted(hits, key=lambda k: (-profile[k], k))
    prettified = []
    for label in ranked[:limit]:
        prettified.append(" ".join(w.capitalize() for w in label.split()))
    return prettified


def describe_history(db: Session, user: Optional[User]) -> str:
    """Human description of which genuine sources built the profile."""
    if user is None:
        return ""
    fav_count = db.query(Favorite).filter(Favorite.user_id == user.id).count()
    trip_count = db.query(Trip).filter(Trip.user_id == user.id).count()
    if fav_count and trip_count:
        return "favorited or saved"
    if fav_count:
        return "favorited"
    if trip_count:
        return "saved"
    return ""
