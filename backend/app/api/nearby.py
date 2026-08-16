"""Live nearby services proxy (Phase 4).

Fetches real nearby services (hotels, restaurants, hospitals, transport,
ATMs, fuel stations, and more) from the public OpenStreetMap Overpass API.
No API key is required. Nothing is fabricated: every entry comes from OSM,
distances are computed server-side with haversine, and ratings are omitted
(OSM has no rating data) rather than invented.
"""
import json
import time
import urllib.parse
import urllib.request
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.geocode import haversine_km
from app.core.settings import OVERPASS_URLS

router = APIRouter(prefix="/api/nearby", tags=["nearby"])

MAX_RADIUS_KM = 35
DEFAULT_RADIUS_KM = 15
TIMEOUT_SECONDS = 10
MAX_RESULTS = 50
CACHE_TTL_SECONDS = 600

# Simple in-memory TTL cache: {key: (items, expires_at)}. Keyed by category
# plus a ~2km-rounded location so repeated requests don't hammer public
# Overpass mirrors.
_cache: dict = {}

# OSM tag filters per service category (Overpass QL filter expressions).
CATEGORY_TAGS = {
    "hotels": ['["tourism"~"^(hotel|guest_house|hostel|motel|resort|apartment|chalet)$"]'],
    "restaurants": ['["amenity"~"^(restaurant|cafe|fast_food|bar|pub)$"]'],
    "hospitals": ['["amenity"~"^(hospital|clinic|doctors|pharmacy|dentist)$"]'],
    "transport": [
        '["railway"~"^(station|halt|tram_stop|subway_entrance)$"]',
        '["amenity"~"^(bus_station|taxi|ferry_terminal)$"]',
        '["highway"="bus_stop"]',
    ],
    "atms": ['["amenity"~"^(atm|bank)$"]'],
    "fuel": ['["amenity"~"^(fuel|charging_station)$"]'],
    "police": ['["amenity"~"^(police|fire_station)$"]'],
    "shopping": ['["shop"~"^(supermarket|convenience|mall)$"]'],
    "parking": ['["amenity"="parking"]'],
}

CATEGORY_LABELS = {
    "hotels": "Hotels & Stays",
    "restaurants": "Restaurants & Cafes",
    "hospitals": "Hospitals & Pharmacies",
    "transport": "Transport Hubs",
    "atms": "ATMs & Banks",
    "fuel": "Fuel Stations",
    "police": "Police & Fire",
    "shopping": "Shopping",
    "parking": "Parking",
}


def _build_query(lat: float, lng: float, radius_m: int, category: str) -> str:
    lines = []
    for tag_filter in CATEGORY_TAGS[category]:
        for kind in ("node", "way", "rel"):
            lines.append(f'  {kind}{tag_filter}(around:{radius_m},{lat},{lng});')
    members = "\n".join(lines)
    return f"[out:json][timeout:{TIMEOUT_SECONDS}];\n(\n{members}\n);\nout center tags;\n"


def _fetch_from_overpass(query: str) -> dict:
    """Try each configured Overpass mirror until one returns a response."""
    last_error: Optional[Exception] = None
    for endpoint in OVERPASS_URLS:
        try:
            request = urllib.request.Request(
                endpoint,
                data=urllib.parse.urlencode({"data": query}).encode("utf-8"),
                headers={"User-Agent": "smart-tourist-system/2.0 (backend nearby proxy)"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:  # noqa: BLE001 - try the next mirror
            last_error = exc
    if last_error is not None:
        raise last_error
    raise RuntimeError("No Overpass mirror configured")


def _normalize(
    elem: dict,
    lat: float,
    lng: float,
    category: str,
) -> Optional[dict]:
    tags = elem.get("tags") or {}
    elat = elem.get("lat")
    elng = elem.get("lon")
    if elat is None or elng is None:
        center = elem.get("center") or {}
        elat = center.get("lat")
        elng = center.get("lon")
    if elat is None or elng is None:
        return None

    name = (tags.get("name") or "").strip()
    if not name:
        fallback = (
            tags.get("amenity")
            or tags.get("tourism")
            or tags.get("shop")
            or tags.get("railway")
            or category
        )
        name = str(fallback).replace("_", " ").strip().title() or "Nearby spot"

    street = tags.get("addr:street") or ""
    number = tags.get("addr:housenumber") or ""
    city = tags.get("addr:city") or ""
    address = " ".join(part for part in (number, street, city) if part).strip()

    return {
        "id": f"osm-{elem.get('id')}",
        "name": name,
        "type": (
            tags.get("amenity")
            or tags.get("tourism")
            or tags.get("shop")
            or tags.get("railway")
            or "service"
        ),
        "category": category,
        "category_label": CATEGORY_LABELS.get(category, category),
        "lat": elat,
        "lng": elng,
        "distance_km": round(haversine_km(lat, lng, elat, elng), 2),
        "rating": None,
        "reviews_count": None,
        "image": None,
        "opening_hours": tags.get("opening_hours") or None,
        "phone": tags.get("phone") or tags.get("contact:phone") or None,
        "website": tags.get("website") or tags.get("contact:website") or None,
        "address": address or None,
    }


@router.get("/services")
async def nearby_services(
    lat: float = Query(..., ge=-90, le=90, description="Current latitude (required)"),
    lng: float = Query(..., ge=-180, le=180, description="Current longitude (required)"),
    category: str = Query("hotels", description="Service category (hotels, restaurants, hospitals, transport, atms, fuel, police, shopping, parking)"),
    radius: float = Query(DEFAULT_RADIUS_KM, ge=1, le=MAX_RADIUS_KM, description=f"Search radius in km (max {MAX_RADIUS_KM})"),
):
    """Real nearby services from OpenStreetMap around the live GPS coordinates.

    Entries are proxied live from the public Overpass API (no key required),
    distances are the real haversine distance, and the radius is hard-capped
    at 35 km. Ratings are always null because OSM does not provide them.
    """
    if category not in CATEGORY_TAGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported category '{category}'. Supported: {', '.join(sorted(CATEGORY_TAGS))}",
        )

    query = _build_query(lat, lng, int(radius * 1000), category)

    cache_key = f"{category}|{round(lat, 2)}|{round(lng, 2)}|{int(radius)}"
    cached = _cache.get(cache_key)
    if cached is not None and cached[1] > time.time():
        return cached[0]

    try:
        payload = _fetch_from_overpass(query)
        items = []
        seen = set()
        for elem in payload.get("elements", []):
            norm = _normalize(elem, lat, lng, category)
            if not norm:
                continue
            key = (norm["name"].lower(), round(norm["lat"], 3), round(norm["lng"], 3))
            if key in seen:
                continue
            seen.add(key)
            items.append(norm)

        items.sort(key=lambda item: item["distance_km"])
        items = items[:MAX_RESULTS]
        result = {
            "status": "success",
            "category": category,
            "category_label": CATEGORY_LABELS.get(category, category),
            "source": "OpenStreetMap",
            "count": len(items),
            "radius": radius,
            "data": items,
        }
    except Exception as exc:  # noqa: BLE001 - surface any upstream failure honestly
        raise HTTPException(
            status_code=502,
            detail=f"Live services are temporarily unavailable ({type(exc).__name__}). Please try again later.",
        )

    _cache[cache_key] = (result, time.time() + CACHE_TTL_SECONDS)
    return result
