"""
OpenStreetMap Overpass proxy and nearby service queries.
"""
import json
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Optional

from app.core.config import OVERPASS_URLS
from app.utils.distance import haversine_km

MAX_RADIUS_KM = 80
DEFAULT_RADIUS_KM = 30
TIMEOUT_SECONDS = 10
MAX_RESULTS = 50
CACHE_TTL_SECONDS = 600

_cache: Dict[str, tuple] = {}

CATEGORY_TAGS = {
    "hotels": ['["tourism"~"^(hotel|guest_house|hostel|motel|resort|apartment|chalet)$"]'],
    "restaurants": ['["amenity"~"^(restaurant|cafe|fast_food|bar|pub)$"]'],
    "cafes": ['["amenity"="cafe"]'],
    "hospitals": ['["amenity"~"^(hospital|clinic|doctors|pharmacy|dentist)$"]'],
    "transport": [
        '["railway"~"^(station|halt|tram_stop|subway_entrance)$"]',
        '["amenity"~"^(bus_station|taxi|ferry_terminal)$"]',
        '["highway"="bus_stop"]',
    ],
    "bus_stands": ['["amenity"="bus_station"]', '["highway"="bus_stop"]'],
    "railway_stations": ['["railway"~"^(station|halt)$"]'],
    "atms": ['["amenity"~"^(atm|bank)$"]'],
    "fuel": ['["amenity"~"^(fuel|charging_station)$"]'],
    "petrol_pumps": ['["amenity"~"^(fuel|charging_station)$"]'],
    "police": ['["amenity"~"^(police|fire_station)$"]'],
    "shopping": ['["shop"~"^(supermarket|convenience|mall)$"]'],
    "parking": ['["amenity"="parking"]'],
    "education": ['["amenity"~"^(school|college|university)$"]'],
}

CATEGORY_LABELS = {
    "hotels": "Hotels & Stays",
    "restaurants": "Restaurants & Dining",
    "cafes": "Cafes & Coffee",
    "hospitals": "Hospitals & Medical",
    "transport": "Transport Hubs",
    "bus_stands": "Bus Stands",
    "railway_stations": "Railway Stations",
    "atms": "ATMs & Banks",
    "fuel": "Petrol Pumps & Fuel",
    "petrol_pumps": "Petrol Pumps & Fuel",
    "police": "Police & Safety",
    "shopping": "Shopping & Markets",
    "parking": "Parking Facilities",
    "education": "Schools & Colleges",
}

CATEGORY_ALIASES = {
    "petrol pumps": "fuel",
    "petrol_pumps": "fuel",
    "gas": "fuel",
    "bus stands": "bus_stands",
    "railway stations": "railway_stations",
    "schools": "education",
    "colleges": "education",
}


class NearbyService:
    @staticmethod
    def canonical_category(category: str) -> str:
        cat = category.strip().lower()
        return CATEGORY_ALIASES.get(cat, cat)

    @classmethod
    def is_valid_category(cls, category: str) -> bool:
        return cls.canonical_category(category) in CATEGORY_TAGS

    @staticmethod
    def supported_categories() -> List[str]:
        return sorted(CATEGORY_TAGS.keys())

    @staticmethod
    def build_query(lat: float, lng: float, radius_m: int, category: str) -> str:
        cat = NearbyService.canonical_category(category)
        lines = []
        for tag_filter in CATEGORY_TAGS[cat]:
            for kind in ("node", "way", "rel"):
                lines.append(f'  {kind}{tag_filter}(around:{radius_m},{lat},{lng});')
        members = "\n".join(lines)
        return f"[out:json][timeout:{TIMEOUT_SECONDS}];\n(\n{members}\n);\nout center tags;\n"

    @staticmethod
    def fetch_from_overpass(query: str) -> dict:
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
            except Exception as exc:  # noqa: BLE001
                last_error = exc
        if last_error is not None:
            raise last_error
        raise RuntimeError("No Overpass mirror configured")

    @staticmethod
    def normalize_element(elem: dict, lat: float, lng: float, category: str) -> Optional[dict]:
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

        dist = haversine_km(lat, lng, elat, elng)
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
            "distance_km": round(dist, 2) if dist is not None else None,
            "rating": None,
            "reviews_count": None,
            "image": None,
            "opening_hours": tags.get("opening_hours") or None,
            "phone": tags.get("phone") or tags.get("contact:phone") or None,
            "website": tags.get("website") or tags.get("contact:website") or None,
            "address": address or None,
        }

    @classmethod
    def get_nearby_services(
        cls,
        lat: float,
        lng: float,
        category: str = "hotels",
        radius: float = DEFAULT_RADIUS_KM,
    ) -> dict:
        radius = min(radius, MAX_RADIUS_KM)
        cat = cls.canonical_category(category)
        cache_key = f"{cat}|{round(lat, 2)}|{round(lng, 2)}|{int(radius)}"
        cached = _cache.get(cache_key)
        if cached is not None and cached[1] > time.time():
            return cached[0]

        query = cls.build_query(lat, lng, int(radius * 1000), cat)
        payload = cls.fetch_from_overpass(query)
        items = []
        seen = set()
        for elem in payload.get("elements", []):
            norm = cls.normalize_element(elem, lat, lng, cat)
            if not norm or norm.get("distance_km") is None:
                continue
            # Strict 80 km check: anything > radius must not be displayed
            if norm["distance_km"] > radius:
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
            "category": cat,
            "category_label": CATEGORY_LABELS.get(cat, cat),
            "source": "OpenStreetMap",
            "count": len(items),
            "radius": radius,
            "data": items,
        }
        _cache[cache_key] = (result, time.time() + CACHE_TTL_SECONDS)
        return result
