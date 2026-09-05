"""
Scoring and ranking helper functions for the recommendation engine.
"""
import math
import re
from datetime import date
from typing import List, Optional
import numpy as np

from app.core.config import DEFAULT_DURATION_DAYS, DISTANCE_DECAY

_STOPWORDS = {
    "the", "and", "for", "with", "from", "your", "into", "along", "about",
    "over", "under", "through", "within", "when", "where", "what", "best",
    "good", "great", "a", "an", "of", "to", "in", "on", "at", "is", "it",
}


def ordered_tokens(text: str) -> List[str]:
    """Extract informative lowercase tokens preserving first-appearance order."""
    raw = re.findall(r"[a-z0-9]+", text.lower())
    seen = set()
    out = []
    for t in raw:
        if t not in _STOPWORDS and len(t) > 2 and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def minmax_scale(values: np.ndarray) -> np.ndarray:
    """Scale an array to [0, 1]. Returns zeros if range is negligible."""
    lo, hi = values.min(), values.max()
    if hi - lo < 1e-9:
        return np.zeros_like(values)
    return (values - lo) / (hi - lo)


def budget_scores(costs: np.ndarray, daily_budget: float) -> np.ndarray:
    """Budget fit score: full score well below budget, decaying smoothly above."""
    if daily_budget <= 0:
        return np.zeros_like(costs)
    ratio = costs / daily_budget
    return np.clip(1.25 - ratio, 0.0, 1.0)


def distance_scores(dists_km: List[Optional[float]]) -> np.ndarray:
    """Distance proximity score using exponential decay."""
    if not dists_km:
        return np.array([])
    out = []
    for d in dists_km:
        if d is None:
            out.append(0.5)
        else:
            out.append(math.exp(-d / DISTANCE_DECAY))
    return np.array(out, dtype=float)


def compute_duration(
    duration_days: Optional[int],
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> int:
    """Compute integer trip duration from days or ISO date bounds."""
    if duration_days and int(duration_days) > 0:
        return int(duration_days)
    try:
        if start_date and end_date:
            s = date.fromisoformat(start_date)
            e = date.fromisoformat(end_date)
            days = (e - s).days
            return max(1, days + 1)
    except (TypeError, ValueError):
        pass
    return DEFAULT_DURATION_DAYS
