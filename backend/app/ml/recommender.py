"""
Content-based tourist-place recommendation engine and itinerary generator.

Pipeline (v2 — hybrid scoring)
------------------------------
    User preferences (destination, interests, categories, activities,
    budget, duration, travelers, traveler_type)
        -> feature extraction (TF-IDF over textual place features)
        -> content-based cosine similarity
        -> category match      (interests vs dataset categories/tags)
        -> quality signal      (normalised rating + popularity)
        -> budget-aware scoring (per-day per-person cost fit)
        -> distance-aware scoring (proximity to destination)
        -> traveler-type fit   (solo/couple/family/friends/adventure)
        -> personalization     (deterministic profile from favorites/trips)
        -> weighted final score (explainable breakdown)
        -> top-N ranking

Weights live in app.core.config.WEIGHTS and sum to 1.0.
"""
import math
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple, TypedDict

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import (
    DEFAULT_DURATION_DAYS,
    DEFAULT_TOP_N,
    LOCATION_RADIUS_KM,
    LOCATION_TOP_N,
    MAX_PLACES_PER_DAY,
    MIN_PLACES_PER_DAY,
    WEIGHTS,
)
from app.ml.preferences import (
    NEUTRAL_PREFERENCE_SCORE,
    matched_preference_labels,
    preference_score,
)
from app.ml.scoring import (
    budget_scores,
    compute_duration,
    distance_scores,
    minmax_scale,
    ordered_tokens,
)
from app.ml.signals import (
    NEUTRAL_TRAVELER_SCORE,
    category_match_score,
    matched_interest_labels,
    matched_traveler_markers,
    normalize_traveler_type,
    resolve_interests,
    traveler_match_score,
)
from app.utils.distance import haversine_km, resolve_coords

# Minimum TF-IDF similarity before we claim an interest-based reason.
_CONTENT_REASON_THRESHOLD = 0.20
# Distance (km) below which we claim proximity.
_PROXIMITY_KM = 40


class ContentBasedRecommender:
    """Recommends tourist places using TF-IDF content similarity plus
    quality, budget, and distance signals."""

    def __init__(self, places: List[dict]):
        self.places = list(places)
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=2500,
            min_df=1,
        )
        corpus = [self._text_features(p) for p in self.places]
        self._place_matrix = self._vectorizer.fit_transform(corpus)
        self._place_tokens = [ordered_tokens(t) for t in corpus]

        ratings = np.array([p["rating"] for p in self.places], dtype=float)
        pops = np.array([p["popularity"] for p in self.places], dtype=float)
        self._rating_norm = minmax_scale(ratings)
        self._pop_norm = minmax_scale(pops)

    @staticmethod
    def _text_features(place: dict) -> str:
        parts = [
            place.get("category", ""),
            " ".join(place.get("tags", [])),
            " ".join(place.get("activities", [])),
            place.get("description", ""),
            place.get("best_time", ""),
            place.get("city", ""),
        ]
        return " ".join(parts).lower()

    def _preference_text(self, interests, categories, activities) -> str:
        return " ".join([*interests, *categories, *activities])

    def _preference_vector(self, interests, categories, activities):
        query = self._preference_text(interests, categories, activities).strip()
        if not query:
            return None
        return self._vectorizer.transform([query])

    def _quality_scores(self) -> np.ndarray:
        return 0.5 * self._rating_norm + 0.5 * self._pop_norm

    def _explain(
        self,
        place: dict,
        *,
        content: float,
        quality: float,
        budget_score: float,
        dist_km: Optional[float],
        destination: str,
        interests: List[str],
        traveler_type: Optional[str],
        traveler: float,
        personalization: float,
        profile: Dict[str, float],
        history_source: str,
    ) -> List[str]:
        """Build structured reasons. Each reason is emitted only when its
        underlying scoring condition is genuinely true."""
        reasons: List[str] = []

        # 1. Explicit interest -> category/tag match (Feature 1 signal).
        labels = matched_interest_labels(place, interests)
        if labels:
            pretty = ", ".join(labels[:3])
            reasons.append(f"Fits your {pretty} interest(s)")
        elif content >= _CONTENT_REASON_THRESHOLD:
            user_terms = ordered_tokens(self._preference_text(interests, [], []))
            place_tokens = self._place_tokens[self.places.index(place)]
            matched = [t for t in user_terms if t in place_tokens]
            if matched:
                reasons.append(f"Matches your selected interests ({', '.join(matched[:3])})")

        # 2. Traveler-type fit (Feature 2 signal).
        if normalize_traveler_type(traveler_type) and traveler >= 0.8:
            markers = matched_traveler_markers(place, traveler_type, limit=2)
            if markers:
                reasons.append(
                    f"Suits {traveler_type} travelers — known for {', '.join(markers)}"
                )
            else:
                reasons.append(f"Suits {traveler_type} travelers")

        # 3. Personal history match (Feature 3 signal; only real data).
        if profile and personalization >= 0.6:
            pref_labels = matched_preference_labels(place, profile)
            source = history_source or "favorited or saved"
            if pref_labels:
                reasons.append(
                    f"Similar to places you have {source} "
                    f"({', '.join(pref_labels[:2])})"
                )
            else:
                reasons.append(f"Similar to places you have {source} before")

        # 4. Quality signal.
        if quality >= 0.8:
            rating = place.get("rating")
            if isinstance(rating, (int, float)) and rating > 0:
                reasons.append(f"Highly rated ({rating}/5)")
            else:
                reasons.append("Highly rated and popular")

        # 5. Budget signal.
        if budget_score >= 0.9:
            reasons.append("Fits within your budget")

        # 6. Proximity signal.
        if dist_km is not None and dist_km <= _PROXIMITY_KM:
            reasons.append(f"Close to {destination}")

        if not reasons:
            if not interests:
                reasons.append("Ranked by quality, budget and proximity")
            else:
                reasons.append("Partial match based on your overall profile")

        return reasons

    def _rank_places(
        self,
        indices: List[int],
        dest_coords: Optional[Tuple[float, float]],
        destination: str,
        interests: List[str],
        categories: List[str],
        activities: List[str],
        daily_budget: float,
        top_n: int,
        traveler_type: Optional[str] = None,
        preference_profile: Optional[Dict[str, float]] = None,
        history_source: str = "",
    ) -> List[dict]:
        w = WEIGHTS
        n = len(indices)
        if n == 0:
            return []

        idx_arr = np.array(indices, dtype=int)
        quality = self._quality_scores()[idx_arr]
        costs = np.array([self.places[i]["estimated_cost"] for i in indices], dtype=float)
        b_scores = budget_scores(costs, daily_budget)

        dists_km = []
        for i in indices:
            p = self.places[i]
            if dest_coords:
                dists_km.append(haversine_km(dest_coords[0], dest_coords[1], p["latitude"], p["longitude"]))
            else:
                dists_km.append(None)
        distance = distance_scores(dists_km)

        pref_vec = self._preference_vector(interests, categories, activities)
        if pref_vec is not None and n > 0:
            content = cosine_similarity(pref_vec, self._place_matrix[idx_arr]).flatten()
        else:
            content = np.zeros(n)

        resolved_interests = resolve_interests(interests)
        category = np.array(
            [category_match_score(self.places[i], resolved_interests) for i in indices],
            dtype=float,
        )

        if normalize_traveler_type(traveler_type):
            traveler = np.array(
                [traveler_match_score(self.places[i], traveler_type) for i in indices],
                dtype=float,
            )
        else:
            traveler = np.full(n, NEUTRAL_TRAVELER_SCORE)

        profile = preference_profile or {}
        if profile:
            personalization = np.array(
                [preference_score(self.places[i], profile) for i in indices],
                dtype=float,
            )
        else:
            personalization = np.full(n, NEUTRAL_PREFERENCE_SCORE)

        final = (
            w["content"] * content
            + w["quality"] * quality
            + w["budget"] * b_scores
            + w["distance"] * distance
            + w["category"] * category
            + w["traveler"] * traveler
            + w["personalization"] * personalization
        )

        order = np.argsort(-final, kind="stable")
        results = []
        for pos in order:
            if len(results) >= top_n:
                break
            i = int(idx_arr[int(pos)])
            place = self.places[i]
            dist_km = dists_km[int(pos)]
            b_score = float(b_scores[int(pos)])
            c_val = float(content[int(pos)])
            q_val = float(quality[int(pos)])
            t_val = float(traveler[int(pos)])
            p_val = float(personalization[int(pos)])

            breakdown = {
                "content": round(c_val, 3),
                "quality": round(q_val, 3),
                "budget": round(b_score, 3),
                "distance": round(float(distance[int(pos)]), 3),
                "category": round(float(category[int(pos)]), 3),
                "traveler": round(t_val, 3),
                "personalization": round(p_val, 3),
            }
            reasons = self._explain(
                place,
                content=c_val,
                quality=q_val,
                budget_score=b_score,
                dist_km=dist_km,
                destination=destination,
                interests=interests or [],
                traveler_type=normalize_traveler_type(traveler_type),
                traveler=t_val,
                personalization=p_val,
                profile=profile,
                history_source=history_source,
            )
            results.append({
                "place": place,
                "recommendation_score": round(float(final[int(pos)]), 3),
                "match_reason": "; ".join(reasons),
                "reasons": reasons,
                "distance_km": dist_km,
                "score_breakdown": breakdown,
            })

        return results

    def recommend(
        self,
        destination: str,
        interests: List[str],
        categories: List[str],
        activities: List[str],
        budget: float,
        duration_days: int,
        travelers: int,
        top_n: int = DEFAULT_TOP_N,
        traveler_type: Optional[str] = None,
        preference_profile: Optional[Dict[str, float]] = None,
        history_source: str = "",
    ) -> Tuple[List[dict], dict]:
        dest_coords = resolve_coords(destination)
        daily_budget = budget / max(int(duration_days or 1), 1) / max(int(travelers or 1), 1)

        results = self._rank_places(
            indices=list(range(len(self.places))),
            dest_coords=dest_coords,
            destination=destination,
            interests=interests,
            categories=categories,
            activities=activities,
            daily_budget=daily_budget,
            top_n=top_n,
            traveler_type=traveler_type,
            preference_profile=preference_profile,
            history_source=history_source,
        )

        meta = {
            "destination_coords": list(dest_coords) if dest_coords else None,
            "daily_budget_per_person": round(daily_budget, 2),
            "destination_resolved": dest_coords is not None,
        }
        return results, meta

    def recommend_for_location(
        self,
        location: str,
        interests: List[str],
        categories: List[str],
        activities: List[str],
        budget: float,
        duration_days: int,
        travelers: int,
        top_n: int = LOCATION_TOP_N,
        radius_km: float = LOCATION_RADIUS_KM,
        traveler_type: Optional[str] = None,
        preference_profile: Optional[Dict[str, float]] = None,
        history_source: str = "",
    ) -> Tuple[List[dict], dict]:
        location = (location or "").strip()
        coords = resolve_coords(location) if location else None

        candidates: List[int] = []
        seen: set = set()
        city_key = location.lower()
        for i, p in enumerate(self.places):
            if p["city"].lower() == city_key:
                if i not in seen:
                    candidates.append(i)
                    seen.add(i)
                continue
            if coords:
                d = haversine_km(coords[0], coords[1], p["latitude"], p["longitude"])
                if d is not None and d <= radius_km and i not in seen:
                    candidates.append(i)
                    seen.add(i)

        daily_budget = budget / max(int(duration_days or 1), 1) / max(int(travelers or 1), 1)

        results = self._rank_places(
            indices=candidates,
            dest_coords=coords,
            destination=location,
            interests=interests,
            categories=categories,
            activities=activities,
            daily_budget=daily_budget,
            top_n=top_n,
            traveler_type=traveler_type,
            preference_profile=preference_profile,
            history_source=history_source,
        )

        meta = {
            "destination_coords": list(coords) if coords else None,
            "daily_budget_per_person": round(daily_budget, 2),
            "destination_resolved": coords is not None,
            "candidates": len(candidates),
        }
        return results, meta


# ----------------------------------------------------------------------
# Itinerary builder
# ----------------------------------------------------------------------

_SLOTS = [
    "Morning (6 AM - 12 PM)",
    "Afternoon (12 PM - 5 PM)",
    "Evening (5 PM onwards)",
]


class _ItineraryStop(TypedDict):
    place: dict
    time_slot: str
    estimated_cost: float
    distance_from_prev_km: Optional[float]
    travel_time_minutes: Optional[int]


class _ItineraryDay(TypedDict):
    day: int
    date: Optional[str]
    theme: str
    places: List[_ItineraryStop]
    notes: str
    day_budget: float
    day_distance_km: float


def _nearest(places: List[dict], ref: Optional[Tuple[float, float]]) -> int:
    """Index of the place nearest to ref (haversine)."""
    if ref is None:
        return 0
    best_i, best_d = -1, None
    for i, p in enumerate(places):
        d = haversine_km(ref[0], ref[1], p["latitude"], p["longitude"])
        if d is None:
            continue
        if best_d is None or d < best_d:
            best_d, best_i = d, i
    return best_i


def _majority(items: List[str]) -> Optional[str]:
    if not items:
        return None
    counts: Dict[str, int] = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return max(counts, key=lambda key: counts[key])


def build_itinerary(
    selected_places: List[dict],
    destination: str,
    start_location: str,
    budget: float,
    travelers: int,
    duration_days: int,
    start_date: Optional[str] = None,
) -> dict:
    """Arrange selected places into a day-wise itinerary with route estimates."""
    days = max(1, compute_duration(duration_days, start_date, None))
    places = [p for p in selected_places if p]

    anchor = resolve_coords(start_location) or resolve_coords(destination)

    with_coords = [p for p in places if p.get("latitude") is not None and p.get("longitude") is not None]
    no_coords = [p for p in places if p.get("latitude") is None or p.get("longitude") is None]

    per_day = min(MAX_PLACES_PER_DAY, max(MIN_PLACES_PER_DAY, math.ceil(len(places) / days)))

    day_clusters: List[List[dict]] = []
    pool = list(with_coords)
    cur = anchor
    for _ in range(days):
        if not pool:
            break
        chunk = []
        for _ in range(per_day):
            if not pool:
                break
            idx = _nearest(pool, cur)
            chosen = pool.pop(idx)
            chunk.append(chosen)
            cur = (chosen["latitude"], chosen["longitude"])
        day_clusters.append(chunk)

    for i, p in enumerate(no_coords):
        if not day_clusters:
            day_clusters.append([])
        day_clusters[i % len(day_clusters)].append(p)

    itinerary_days: List[_ItineraryDay] = []
    for d in range(1, days + 1):
        cluster = day_clusters[d - 1] if d - 1 < len(day_clusters) else []
        prev_anchor = anchor
        places_out: List[_ItineraryStop] = []
        day_distance = 0.0
        for i, p in enumerate(cluster):
            ref = prev_anchor
            dist = haversine_km(ref[0], ref[1], p["latitude"], p["longitude"]) if ref else None
            travel_min = None
            if dist is not None:
                day_distance += dist
                travel_min = int(dist / 40 * 60)
            places_out.append({
                "place": p,
                "time_slot": _SLOTS[i % len(_SLOTS)],
                "estimated_cost": float(p.get("estimated_cost", 0)),
                "distance_from_prev_km": dist,
                "travel_time_minutes": travel_min,
            })
            prev_anchor = (p["latitude"], p["longitude"]) if p.get("latitude") is not None else prev_anchor

        categories = [p["place"].get("category", "") for p in places_out if p.get("place")]
        theme = _majority([c for c in categories if c]) or "Sightseeing"
        day_date = None
        if start_date:
            try:
                day_date = (date.fromisoformat(start_date) + timedelta(days=d - 1)).isoformat()
            except (TypeError, ValueError):
                day_date = None

        itinerary_days.append({
            "day": d,
            "date": day_date,
            "theme": theme,
            "places": places_out,
            "notes": f"Day {d} focuses on {theme} with {len(places_out)} stop(s).",
            "day_budget": round(sum(p["estimated_cost"] for p in places_out), 2),
            "day_distance_km": round(day_distance, 1),
        })

    total_cost = round(sum(p["estimated_cost"] for day in itinerary_days for p in day["places"]), 2)
    total_distance = round(sum(day["day_distance_km"] for day in itinerary_days), 1)

    return {
        "days": itinerary_days,
        "total_cost": total_cost,
        "total_distance_km": total_distance,
        "total_places": len(places),
    }
