"""
Explicit recommendation signals derived from the canonical dataset vocabulary.

This module is the SINGLE source of truth for:

1. Interest -> category/tag matching (Feature 1: category match score).
2. Traveler-type normalization and matching (Feature 2).

Design rules
------------
* Only categories/tags/activities that actually exist in `app.ml.dataset`
  are referenced here. No tourist-place facts are invented.
* Every score is normalized to [0, 1].
* A missing input (no interests, no traveler type) yields a documented
  neutral value so ranking stays stable for new users.
"""
import re
from typing import Dict, FrozenSet, List, Optional, Tuple

# ----------------------------------------------------------------------
# Feature 1 — interest -> dataset category mapping
# ----------------------------------------------------------------------

# User-facing interest labels (frontend PlanTrip chip options) mapped to the
# 16 canonical dataset categories plus tag hints that genuinely exist in the
# dataset. Tags are matched case-insensitively against a place's own tags.
INTEREST_CATEGORY_MAP: Dict[str, Dict[str, FrozenSet[str]]] = {
    "history": {
        "categories": frozenset({"Heritage", "Monument", "Museum"}),
        "tags": frozenset({"history", "fort", "palace", "monument", "ruins",
                           "ancient", "archaeology", "royal", "unesco"}),
    },
    "heritage": {
        "categories": frozenset({"Heritage", "Monument"}),
        "tags": frozenset({"heritage", "architecture", "sculpture", "ancient",
                           "unesco", "royal", "history"}),
    },
    "nature": {
        "categories": frozenset({"Nature", "Garden", "Waterfall", "Wildlife",
                                 "Hill Station"}),
        "tags": frozenset({"nature", "waterfall", "mountain", "wildlife",
                           "garden", "lake", "river", "forest", "park",
                           "scenic", "green", "biodiversity"}),
    },
    "waterfalls": {
        "categories": frozenset({"Waterfall"}),
        "tags": frozenset({"waterfall", "river", "scenic", "monsoon"}),
    },
    "temples": {
        "categories": frozenset({"Temple"}),
        "tags": frozenset({"temple", "spiritual", "pilgrimage", "gopuram",
                           "shiva", "krishna", "goddess", "mythology"}),
    },
    "beaches": {
        "categories": frozenset({"Beach"}),
        "tags": frozenset({"beach", "coastal", "island", "sea", "water sports"}),
    },
    "trekking": {
        "categories": frozenset({"Trekking", "Adventure"}),
        "tags": frozenset({"trekking", "treks", "mountain", "summit", "hill",
                           "cliff", "caves", "forest", "adventure"}),
    },
    "wildlife": {
        "categories": frozenset({"Wildlife"}),
        "tags": frozenset({"wildlife", "safari", "zoo", "tiger", "elephants",
                           "birds", "jungle", "sanctuary", "animals",
                           "conservation"}),
    },
    "food": {
        "categories": frozenset({"Food"}),
        "tags": frozenset({"food", "street food", "local cuisine", "cafe",
                           "dosa", "vegetarian", "brewery", "nightlife",
                           "spices", "fine dining"}),
    },
    "shopping": {
        "categories": frozenset({"Shopping"}),
        "tags": frozenset({"shopping", "market", "mall", "souvenirs",
                           "fashion", "bargaining", "street"}),
    },
    "adventure": {
        "categories": frozenset({"Adventure", "Trekking"}),
        "tags": frozenset({"adventure", "water sports", "kayaking",
                           "river rafting", "camping", "safari", "rides",
                           "amusement", "fun", "trekking"}),
    },
    "museums": {
        "categories": frozenset({"Museum"}),
        "tags": frozenset({"museum", "art", "gallery", "paintings",
                           "history", "culture", "science"}),
    },
    "spiritual": {
        "categories": frozenset({"Temple", "Monument"}),
        "tags": frozenset({"temple", "spiritual", "pilgrimage", "sacred",
                           "meditation", "peace", "monastery", "church",
                           "mosque", "ritual", "mythology", "buddhist",
                           "jain", "charity", "goddess", "shiva"}),
    },
    "hill stations": {
        "categories": frozenset({"Hill Station"}),
        "tags": frozenset({"hill station", "hilltop", "hills", "mountain",
                           "viewpoint", "panorama", "sunrise", "sunset"}),
    },
}

_TOKEN_RE = re.compile(r"[^a-z0-9 ]+")


def normalize_interest(label: str) -> str:
    """Casefold + strip punctuation so 'Hill Stations' == 'hill stations'."""
    return _TOKEN_RE.sub("", (label or "").strip().casefold()).strip()


def resolve_interests(interests: List[str]) -> List[Dict[str, FrozenSet[str]]]:
    """Map raw interest labels to their category/tag hint sets.

    Unrecognized labels are kept with empty hints (they still flow into the
    TF-IDF content signal as before).
    """
    resolved = []
    for raw in interests or []:
        key = normalize_interest(raw)
        resolved.append(INTEREST_CATEGORY_MAP.get(key, {"categories": frozenset(), "tags": frozenset()}))
    return resolved


def category_match_score(place: dict, resolved_interests) -> float:
    """Fraction of the user's interests that this place structurally matches.

    A place matches one interest when its own category is in that interest's
    category set OR any of its tags hits the interest's tag set.
    Returns 0.0 when the user selected no interests (ranking then falls back
    to quality/budget/distance exactly as before).
    """
    if not resolved_interests:
        return 0.0

    place_category = (place.get("category") or "").strip().casefold()
    place_tags = {
        _TOKEN_RE.sub("", t.casefold()).strip()
        for t in (place.get("tags") or [])
    }

    hits = 0
    for hints in resolved_interests:
        wanted_categories = {c.casefold() for c in hints["categories"]}
        wanted_tags = {_TOKEN_RE.sub("", t).strip() for t in hints["tags"]}
        if place_category in wanted_categories or (place_tags & wanted_tags):
            hits += 1

    return hits / len(resolved_interests)


def matched_interest_labels(place: dict, interests: List[str]) -> List[str]:
    """Pretty labels of the user's interests this place matches (for reasons)."""
    resolved = resolve_interests(interests)
    place_category = (place.get("category") or "").strip().casefold()
    place_tags = {
        _TOKEN_RE.sub("", t.casefold()).strip()
        for t in (place.get("tags") or [])
    }
    out = []
    for raw, hints in zip(interests or [], resolved):
        wanted_categories = {c.casefold() for c in hints["categories"]}
        wanted_tags = {_TOKEN_RE.sub("", t).strip() for t in hints["tags"]}
        if place_category in wanted_categories or (place_tags & wanted_tags):
            out.append(str(raw).strip())
    return out


# ----------------------------------------------------------------------
# Feature 2 — traveler type matching
# ----------------------------------------------------------------------

TRAVELER_TYPES: Tuple[str, ...] = (
    "solo",
    "couple",
    "family",
    "friends",
    "adventure",
    "cultural",
    "relaxed",
    "nature",
    "spiritual",
    "budget",
    "luxury",
    "group",
)

TRAVELER_ALIASES: Dict[str, str] = {
    "group": "friends",
    "romantic": "couple",
    "honeymoon": "couple",
    "individual": "solo",
    "culture": "cultural",
}

# Neutral score used when the user does not pick a traveler type. It is a
# constant for every place, so it never distorts the ranking.
NEUTRAL_TRAVELER_SCORE = 0.5

# Marker tokens are limited to tags/activities that actually occur in the
# canonical dataset (verified against app.ml.dataset vocabulary).
_TRAVELER_MARKERS: Dict[str, FrozenSet[str]] = {
    # Any place can be visited solo; boost places built around personal,
    # quiet, or skill-based experiences.
    "solo": frozenset({
        "photography", "viewpoint", "museum visit", "art viewing",
        "meditation", "reading", "sunrise watching", "sunrise viewing",
        "sunset viewing", "sunset watching", "nature walk", "trek",
        "trekking", "heritage walk", "walking", "cafe hopping",
        "bookstore visit", "birdwatching", "bird watching", "temple darshan",
    }),
    # Romantic-leaning markers: scenic viewpoints, gardens, beaches,
    # waterfronts, evening shows.
    "couple": frozenset({
        "sunset viewing", "sunset watching", "sunrise viewing",
        "sunrise watching", "beach", "beach walk", "garden", "gardens",
        "garden walk", "lake", "backwaters", "scenic drive", "drive",
        "viewpoint", "panorama", "light show", "fountain show",
        "illumination", "boat ride", "peaceful visit", "night illumination viewing",
    }),
    # Family markers use explicit dataset signals only ("family",
    # "children", "kids-style" attractions like zoos/parks).
    "family": frozenset({
        "family", "children", "zoo", "zoological", "amusement", "water park",
        "water rides", "rides", "family picnic", "family games", "picnic",
        "safari", "elephant ride", "boat ride", "fountain show",
        "educational tour", "educational walk", "aviary visit",
        "butterfly park visit", "animal safari", "farm tour",
    }),
    # Group/friends markers: social food, nightlife, group fun, shopping.
    "friends": frozenset({
        "food", "street food", "food tasting", "local snack sampling",
        "nightlife", "hangout", "brewery", "craft beer tasting",
        "shopping", "street shopping", "bargaining", "festival",
        "beach", "beach hopping", "water sports", "kayaking",
        "river rafting", "camping", "amusement", "rides", "rain dance",
        "cinema", "trekking", "cave exploration",
    }),
    # Adventure markers: physically demanding / thrill activities.
    "adventure": frozenset({
        "adventure", "trekking", "trek", "summit trek", "summit",
        "trek to summit", "forest trek", "railway trek", "kodachadri trek",
        "kumaraparvatha trek", "safari", "jeep safari", "lion safari",
        "jungle safari", "kayaking", "coracle ride", "river rafting",
        "white-water rafting", "camping", "island camping", "cave exploration",
        "cave visit", "climbing 1000 steps", "hill climb", "cycling",
        "water sports", "swimming", "wildlife spotting", "snake spotting",
        "lighthouse climb", "tunnel exploration", "dune walk",
    }),
    # Cultural markers: palaces, museums, art, classical history, heritage.
    "cultural": frozenset({
        "history", "heritage", "palace", "fort", "museum", "temple",
        "monument", "architecture", "art", "sculpture", "ancient",
        "heritage walk", "classical", "tradition", "unesco", "monastery",
        "ruins", "royal", "archaeology",
    }),
    # Relaxed markers: gardens, viewpoints, gentle walks, scenic sunsets.
    "relaxed": frozenset({
        "nature walk", "garden", "gardens", "garden walk", "lake",
        "viewpoint", "sunset viewing", "sunset watching", "sunrise viewing",
        "sunrise watching", "peaceful visit", "scenic drive", "drive",
        "backwaters", "reading", "beach walk",
    }),
    # Spiritual markers: sacred temples, pilgrim trails, quiet reflection.
    "spiritual": frozenset({
        "temple", "temple darshan", "spiritual", "pilgrimage", "sacred",
        "meditation", "peace", "monastery", "church", "mosque", "ritual",
        "mythology", "buddhist", "jain", "shiva", "goddess", "krishna",
    }),
    # Nature markers: waterfalls, peaks, wildlife, greenery.
    "nature": frozenset({
        "nature walk", "garden", "lake", "waterfall", "wildlife", "forest",
        "park", "scenic", "green", "biodiversity", "sanctuary", "river",
        "viewpoint", "hills", "mountain",
    }),
    # Budget markers: public parks, walking trails, free monuments.
    "budget": frozenset({
        "street food", "walking", "public", "viewpoint", "nature walk",
        "heritage walk", "beach", "temple",
    }),
    # Luxury markers: resorts, fine dining, private tours, illuminations.
    "luxury": frozenset({
        "resort", "fine dining", "boat ride", "scenic drive", "safari",
        "nightlife", "craft beer tasting", "illumination",
    }),
    # Group alias points to friends markers.
    "group": frozenset({
        "food", "street food", "food tasting", "local snack sampling",
        "nightlife", "hangout", "brewery", "craft beer tasting",
        "shopping", "street shopping", "bargaining", "festival",
        "beach", "beach hopping", "water sports", "kayaking",
        "river rafting", "camping", "amusement", "rides", "rain dance",
        "cinema", "trekking", "cave exploration",
    }),
}


def normalize_traveler_type(value: Optional[str]) -> Optional[str]:
    """Return the canonical lowercase traveler type or None when absent."""
    if not value:
        return None
    v = str(value).strip().casefold()
    v = TRAVELER_ALIASES.get(v, v)
    return v if v in TRAVELER_TYPES else None


def _place_marker_tokens(place: dict) -> FrozenSet[str]:
    """Lowercased set of a place's category + tags + activities."""
    tokens = set()
    if place.get("category"):
        tokens.add(_TOKEN_RE.sub("", str(place["category"]).casefold()).strip())
    tokens.update(
        _TOKEN_RE.sub("", str(t).casefold()).strip()
        for t in (place.get("tags") or [])
    )
    tokens.update(
        _TOKEN_RE.sub("", str(a).casefold()).strip()
        for a in (place.get("activities") or [])
    )
    return frozenset(t for t in tokens if t)


def traveler_match_score(place: dict, traveler_type: Optional[str]) -> float:
    """How well a place suits the requested traveler type, in [0, 1].

    Conservative scheme (no invented facts):
      * marker hits scale up from a 0.6 base toward 1.0;
      * places with zero markers keep the 0.6 base (weak but positive — most
        dataset places are broadly visitable);
      * unknown/absent traveler type -> NEUTRAL_TRAVELER_SCORE.
    """
    t = normalize_traveler_type(traveler_type)
    if t is None:
        return NEUTRAL_TRAVELER_SCORE

    tokens = _place_marker_tokens(place)
    markers = _TRAVELER_MARKERS[t]
    hits = sum(1 for m in markers if _TOKEN_RE.sub("", m).strip() in tokens)

    if hits == 0:
        base = 0.4 if t == "adventure" else 0.6
        return base
    return min(1.0, 0.6 + 0.2 * hits)


def matched_traveler_markers(place: dict, traveler_type: Optional[str], limit: int = 3) -> List[str]:
    """Which traveler markers this place exhibits (used for explanations)."""
    t = normalize_traveler_type(traveler_type)
    if t is None:
        return []
    tokens = _place_marker_tokens(place)
    hits = [m for m in sorted(_TRAVELER_MARKERS[t]) if _TOKEN_RE.sub("", m).strip() in tokens]
    return hits[:limit]
