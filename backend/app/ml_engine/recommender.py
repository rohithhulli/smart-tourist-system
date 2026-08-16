"""
Content-based tourist-place recommendation engine.

Pipeline
--------
    User preferences (destination, interests, categories, activities,
    budget, duration, travelers)
        -> feature extraction (TF-IDF over textual place features)
        -> content-based cosine similarity
        -> quality signal (normalised rating + popularity)
        -> budget-aware scoring (per-day per-person cost fit)
        -> distance-aware scoring (proximity to destination)
        -> weighted final score (explainable breakdown)
        -> top-N ranking

The final score is deterministic and explainable - every recommendation
carries a `score_breakdown` and a human-readable `match_reason`. No random
scores are ever produced.
"""
import math
import re
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import (
    DEFAULT_DURATION_DAYS,
    DEFAULT_TOP_N,
    DISTANCE_DECAY,
    LOCATION_RADIUS_KM,
    LOCATION_TOP_N,
    MAX_PLACES_PER_DAY,
    MIN_PLACES_PER_DAY,
    WEIGHTS,
)
from app.core.geocode import haversine_km, resolve_coords

_STOPWORDS = {
    "the", "and", "for", "with", "from", "your", "into", "along", "about",
    "over", "under", "through", "within", "when", "where", "what", "best",
    "good", "great", "a", "an", "of", "to", "in", "on", "at", "is", "it",
}


def _ordered_tokens(text: str) -> List[str]:
    """Tokens in the order they first appear in the text (used for reasons)."""
    raw = re.findall(r"[a-z0-9]+", text.lower())
    seen = set()
    out = []
    for t in raw:
        if t not in _STOPWORDS and len(t) > 2 and t not in seen:
            seen.add(t)
            out.append(t)
    return out


class ContentBasedRecommender:
    """Recommends tourist places using TF-IDF content similarity plus
    quality, budget and distance signals."""

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
        self._place_tokens = [_ordered_tokens(t) for t in corpus]

        ratings = np.array([p["rating"] for p in self.places], dtype=float)
        pops = np.array([p["popularity"] for p in self.places], dtype=float)
        self._rating_norm = self._minmax(ratings)
        self._pop_norm = self._minmax(pops)

    @staticmethod
    def _minmax(values: np.ndarray) -> np.ndarray:
        lo, hi = values.min(), values.max()
        if hi - lo < 1e-9:
            return np.zeros_like(values)
        return (values - lo) / (hi - lo)

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

    # ------------------------------------------------------------------
    # Preference vector
    # ------------------------------------------------------------------
    def _preference_text(self, interests, categories, activities) -> str:
        return " ".join([*interests, *categories, *activities])

    def _preference_vector(self, interests, categories, activities):
        query = self._preference_text(interests, categories, activities).strip()
        if not query:
            return None
        return self._vectorizer.transform([query])

    # ------------------------------------------------------------------
    # Scoring signals
    # ------------------------------------------------------------------
    def _quality_scores(self) -> np.ndarray:
        return 0.5 * self._rating_norm + 0.5 * self._pop_norm

    @staticmethod
    def _budget_scores(costs: np.ndarray, daily_budget: float) -> np.ndarray:
        """Budget fit: full score well below budget, decaying above it."""
        if daily_budget <= 0:
            return np.zeros_like(costs)
        ratio = costs / daily_budget
        return np.clip(1.25 - ratio, 0.0, 1.0)

    @staticmethod
    def _distance_scores(dists_km: List[Optional[float]]) -> np.ndarray:
        """Neutral (0.5) when destination is unknown."""
        if not dists_km:
            return np.array([])
        out = []
        for d in dists_km:
            if d is None:
                out.append(0.5)
            else:
                out.append(math.exp(-d / DISTANCE_DECAY))
        return np.array(out, dtype=float)

    # ------------------------------------------------------------------
    # Explainability
    # ------------------------------------------------------------------
    def _match_reason(
        self,
        place: dict,
        interests: List[str],
        categories: List[str],
        activities: List[str],
        budget_score: float,
        dist_km: Optional[float],
        destination: str,
    ) -> str:
        user_terms = _ordered_tokens(self._preference_text(interests, categories, activities))
        place_tokens = self._place_tokens[self.places.index(place)]
        matched = [t for t in user_terms if t in place_tokens]

        reasons = []
        if matched:
            top = ", ".join(matched[:3])
            reasons.append(f"Matches your interest in {top}")
        elif not user_terms:
            reasons.append("No specific interests selected; ranked by quality, budget and proximity")
        else:
            reasons.append("Partial match based on your overall profile")

        if budget_score >= 0.9:
            reasons.append("fits within your budget")
        if dist_km is not None and dist_km <= 40:
            reasons.append(f"close to {destination}")

        return "; ".join(reasons)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
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
    ) -> Tuple[List[dict], dict]:
        """
        Rank a subset of the catalogue (given by `indices`) against a profile.

        Every signal (content, quality, budget, distance-to-`dest_coords`) is
        computed only for the candidate subset, keeping the scoring identical
        to the full-catalogue path used by `recommend()`.
        """
        w = WEIGHTS
        n = len(indices)
        idx_arr = np.array(indices, dtype=int)

        quality = self._quality_scores()[idx_arr]
        costs = np.array([self.places[i]["estimated_cost"] for i in indices], dtype=float)
        budget_scores = self._budget_scores(costs, daily_budget)

        dists_km = []
        for i in indices:
            p = self.places[i]
            if dest_coords:
                dists_km.append(haversine_km(dest_coords[0], dest_coords[1], p["latitude"], p["longitude"]))
            else:
                dists_km.append(None)
        distance = self._distance_scores(dists_km)

        pref_vec = self._preference_vector(interests, categories, activities)
        if pref_vec is not None and n > 0:
            content = cosine_similarity(pref_vec, self._place_matrix[idx_arr]).flatten()
        else:
            content = np.zeros(n)

        final = (
            w["content"] * content
            + w["quality"] * quality
            + w["budget"] * budget_scores
            + w["distance"] * distance
        )

        order = np.argsort(-final, kind="stable")
        results = []
        for pos in order:
            if len(results) >= top_n:
                break
            i = int(idx_arr[int(pos)])
            place = self.places[i]
            dist_km = dists_km[int(pos)]
            budget_score = float(budget_scores[int(pos)])
            breakdown = {
                "content": round(float(content[int(pos)]), 3),
                "quality": round(float(quality[int(pos)]), 3),
                "budget": round(budget_score, 3),
                "distance": round(float(distance[int(pos)]), 3),
            }
            results.append({
                "place": place,
                "recommendation_score": round(float(final[int(pos)]), 3),
                "match_reason": self._match_reason(
                    place, interests, categories, activities,
                    budget_score, dist_km, destination,
                ),
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
    ) -> Tuple[List[dict], dict]:
        """
        Rank the full place catalogue against a user profile.

        Returns (recommendations, meta) where each recommendation is:
            {place, recommendation_score, match_reason, distance_km,
             score_breakdown: {content, quality, budget, distance}}
        """
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
    ) -> Tuple[List[dict], dict]:
        """
        Rank places that are relevant to ONE trip location (start, stop or
        destination).

        A place is relevant when its dataset `city` matches the location, or it
        lies within `radius_km` of the resolved location coordinates. Places are
        then ranked with the same weighted content-based engine, using distance
        to THIS location. Locations that cannot be resolved simply fall back to
        a city-name match so the API never fabricates results.
        """
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


def compute_duration(duration_days, start_date, end_date):
    if duration_days and int(duration_days) > 0:
        return int(duration_days)
    try:
        s = date.fromisoformat(start_date)
        e = date.fromisoformat(end_date)
        days = (e - s).days
        return max(1, days + 1)
    except (TypeError, ValueError):
        return DEFAULT_DURATION_DAYS


def _nearest(places: List[dict], ref: Optional[Tuple[float, float]]):
    """Index of the place nearest to ref (haversine)."""
    if ref is None:
        return 0
    best_i, best_d = -1, None
    for i, p in enumerate(places):
        d = haversine_km(ref[0], ref[1], p["latitude"], p["longitude"])
        if best_d is None or d < best_d:
            best_d, best_i = d, i
    return best_i


def build_itinerary(
    selected_places: List[dict],
    destination: str,
    start_location: str,
    budget: float,
    travelers: int,
    duration_days: int,
    start_date: Optional[str] = None,
) -> dict:
    """
    Arrange the selected places into a practical day-wise itinerary.

    Uses greedy nearest-neighbour routing so that places on the same day are
    geographically close, respecting a sensible places-per-day limit.
    """
    days = max(1, compute_duration(duration_days, start_date, None))
    places = [p for p in selected_places if p]

    # anchor: start location first, else destination, else None
    anchor = resolve_coords(start_location) or resolve_coords(destination)

    with_coords = [p for p in places if p.get("latitude") is not None and p.get("longitude") is not None]
    no_coords = [p for p in places if p.get("latitude") is None or p.get("longitude") is None]

    per_day = min(MAX_PLACES_PER_DAY, max(MIN_PLACES_PER_DAY, math.ceil(len(places) / days)))

    # Greedy nearest-neighbour clustering into day routes
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

    # Spread coordinate-less places across days
    for i, p in enumerate(no_coords):
        if not day_clusters:
            day_clusters.append([])
        day_clusters[i % len(day_clusters)].append(p)

    # Reconstruct the full day list (including empty days beyond what we filled)
    itinerary_days = []
    for d in range(1, days + 1):
        cluster = day_clusters[d - 1] if d - 1 < len(day_clusters) else []
        day_anchor = anchor if d == 1 else None
        prev_anchor = anchor
        places_out = []
        day_distance = 0.0
        for i, p in enumerate(cluster):
            ref = prev_anchor
            dist = haversine_km(ref[0], ref[1], p["latitude"], p["longitude"]) if ref else None
            travel_min = None
            if dist is not None:
                day_distance += dist
                travel_min = int(dist / 40 * 60)  # assume ~40 km/h average
            places_out.append({
                "place": p,
                "time_slot": _SLOTS[i % len(_SLOTS)],
                "estimated_cost": float(p.get("estimated_cost", 0)),
                "distance_from_prev_km": dist,
                "travel_time_minutes": travel_min,
            })
            prev_anchor = (p["latitude"], p["longitude"]) if p.get("latitude") is not None else prev_anchor

        categories = [p["place"]["category"] for p in places_out]
        theme = _majority(categories) or "Sightseeing"
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


def _majority(items: List[str]) -> Optional[str]:
    if not items:
        return None
    counts: Dict[str, int] = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return max(counts, key=counts.get)
