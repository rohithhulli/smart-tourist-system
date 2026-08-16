"""
Geocoding helpers.

Uses an authoritative local map of known Karnataka cities first so tests and
offline use are deterministic. Only falls back to the live Nominatim service
when a destination is not in the local map.
"""
import re
import unicodedata
from functools import lru_cache

from geopy.geocoders import Nominatim

from app.core.config import CITY_COORDS, GEOCODING_USER_AGENT

# Extra name aliases that map to a canonical entry in CITY_COORDS
ALIASES = {
    "mysore": "mysuru",
    "bangalore": "bengaluru",
    "chikmagalur": "chikkamagaluru",
    "chikmagaluru": "chikkamagaluru",
    "bijapur": "vijayapura",
    "mangalore": "mangaluru",
    "shimoga": "shivamogga",
    "coorg": "madikeri",
    "jog": "jog falls",
    "hassan": "hassan",
    "nandi hills": "chikkaballapur",
    "mysuru karnataka": "mysuru",
    "bengaluru karnataka": "bengaluru",
    "hubli": "hubballi",
    "hubli-dharwad": "hubballi",
    "honnavara": "honnavar",
    "tumkur": "tumakuru",
    "bellary": "ballari",
}

# Rough India bounding box; live lookups outside this box are rejected so
# typos/unknown destinations do not silently geocode to unrelated countries.
INDIA_BBOX = {"min_lat": 6.0, "max_lat": 38.0, "min_lng": 68.0, "max_lng": 98.0}


def _normalise(name):
    """Lowercase, strip accents and collapse whitespace for robust matching."""
    if not name:
        return ""
    name = unicodedata.normalize("NFKD", str(name))
    name = "".join(c for c in name if not unicodedata.combining(c))
    name = name.lower().strip()
    return re.sub(r"\s+", " ", name)


@lru_cache(maxsize=256)
def resolve_coords(name):
    """
    Resolve a place/city name to (lat, lng).

    Priority:
      1. Local known-city table (deterministic, offline-safe).
      2. Live Nominatim lookup (network fallback).

    Returns None when the name cannot be resolved.
    """
    key = _normalise(name)
    if not key:
        return None

    lookup = ALIASES.get(key, key)
    if lookup in CITY_COORDS:
        return CITY_COORDS[lookup]

    # try progressively shorter tokens, e.g. "Mysuru Karnataka" -> "Mysuru"
    for token in reversed(key.split(" ")):
        token_lookup = ALIASES.get(token, token)
        if token_lookup in CITY_COORDS:
            return CITY_COORDS[token_lookup]

    try:
        geolocator = Nominatim(user_agent=GEOCODING_USER_AGENT)
        location = geolocator.geocode(name, exactly_one=True, timeout=8)
        if location and _inside_india(location.latitude, location.longitude):
            return (location.latitude, location.longitude)
    except Exception:
        pass

    return None


def _inside_india(lat, lng):
    return (
        INDIA_BBOX["min_lat"] <= lat <= INDIA_BBOX["max_lat"]
        and INDIA_BBOX["min_lng"] <= lng <= INDIA_BBOX["max_lng"]
    )


def haversine_km(lat1, lng1, lat2, lng2):
    """Great-circle distance in kilometres between two coordinates."""
    import math

    if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
        return None
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return round(2 * r * math.asin(math.sqrt(a)), 1)
