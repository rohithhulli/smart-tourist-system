"""
Place catalog search and filtering business logic.
"""
from typing import Any, Dict, List, Optional
from app.ml.dataset import TOURIST_PLACES, get_place_by_id
from app.utils.distance import haversine_km


class PlaceService:
    @staticmethod
    def decorate(place: dict, lat: Optional[float] = None, lng: Optional[float] = None) -> dict:
        """Add frontend aliases, rich visitor metadata and live distance to a place."""
        out = dict(place)
        out["open_time"] = place.get("opening_time")
        out["close_time"] = place.get("closing_time")
        out["snapshots"] = [place["image"]] if place.get("image") else []
        out["reviews_count"] = int(place.get("popularity", 0) * 130) + 24

        # Opening hours formatting
        ot = place.get("opening_time")
        ct = place.get("closing_time")
        if ot and ct:
            out["opening_hours"] = f"{ot} – {ct}"
        elif ot:
            out["opening_hours"] = f"From {ot}"
        else:
            out["opening_hours"] = "Open Daily (General Public Hours)"

        # Entry fee formatting
        cost = place.get("estimated_cost")
        if cost is not None and cost > 0:
            out["entry_fee_display"] = f"₹{cost} per person"
            out["entry_fee_value"] = cost
        elif cost == 0:
            out["entry_fee_display"] = "Free Entry"
            out["entry_fee_value"] = 0
        else:
            out["entry_fee_display"] = "Information currently unavailable"
            out["entry_fee_value"] = None

        # Architecture & Significance
        cat = (place.get("category") or "").title()
        city = place.get("city", "Karnataka")
        name = place.get("name", "Attraction")

        out["architecture"] = place.get("architecture") or f"Distinctive {cat} architecture characteristic of the {city} region, featuring traditional craftsmanship, regional stone carvings, and thoughtful historic preservation."
        out["significance"] = place.get("significance") or f"One of the premier {cat.lower()} destinations in {city}, renowned for its unique cultural heritage, high historical value, and scenic environment."

        # Why visit
        out["why_visit"] = [
            f"Renowned {cat.lower()} landmark rated {place.get('rating', 4.5)}/5 by travelers.",
            f"Prime highlight in the {city} travel circuit.",
            f"Ideal for photography, leisurely exploration, and cultural appreciation.",
            f"Convenient access with surrounding local amenities and sightseeing spots within 80 km."
        ]

        # Things to see & do
        acts = place.get("activities") or ["Sightseeing", "Photography", "Cultural Tour", "Walking"]
        out["things_to_see"] = [
            {"title": act, "description": f"Engage in {act.lower()} while touring the picturesque surroundings of {name}."}
            for act in acts[:4]
        ]

        # How to reach
        out["how_to_reach"] = {
            "air": f"Nearest airport serving {city} with scheduled domestic flights and cab connectivity.",
            "railway": f"Closest major railway junction connecting to Bengaluru, Mysuru, and key South Indian lines.",
            "bus": f"Well connected by KSRTC state transport and private AC sleeper luxury coaches to {city}.",
            "road": f"Easily accessible via state highway and national highway networks with scenic drive ways and car parking."
        }

        # Visitor tips
        out["visitor_tips"] = [
            "Wear comfortable walking shoes as the site covers extensive walkable terrain.",
            "Carry a reusable water bottle and sun protection during midday visits.",
            "Authorized local guides are available near the entrance for detailed historical narratives.",
            "Early morning and late afternoon offer the most pleasant weather and best lighting for photography."
        ]

        # FAQs
        out["faqs"] = [
            {"q": f"What are the visiting hours for {name}?", "a": f"The attraction is typically open {out['opening_hours']}. We recommend checking on local festival holidays."},
            {"q": f"Is there an entry fee at {name}?", "a": f"Entry fee status: {out['entry_fee_display']}."},
            {"q": f"What is the best time of year to visit {name}?", "a": f"The recommended travel season is {place.get('best_time') or 'October to March'} when weather is pleasant."},
            {"q": f"How much time should I spend at {name}?", "a": "Most travelers spend between 1.5 to 3 hours to comfortably explore the highlights."}
        ]

        if lat is not None and lng is not None:
            dist = haversine_km(lat, lng, place.get("latitude"), place.get("longitude"))
            out["distance_km"] = round(dist, 2) if dist is not None else None
        return out

    @staticmethod
    def filter_places(
        city: Optional[str] = None,
        category: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius: float = 80.0,
    ) -> List[dict]:
        results = list(TOURIST_PLACES)

        if city:
            wanted = city.strip().lower()
            results = [p for p in results if p["city"].lower() == wanted]
        if category and category.lower() != "all":
            wanted = category.strip().lower()
            results = [p for p in results if p["category"].lower() == wanted]

        data = [PlaceService.decorate(p, lat, lng) for p in results]

        if lat is not None and lng is not None:
            data = [
                p for p in data
                if p.get("distance_km") is not None and p["distance_km"] <= radius
            ]
            data.sort(key=lambda p: p["distance_km"])

        return data

    @staticmethod
    def search_places(query: str, limit: int = 8) -> List[dict]:
        terms = [t.strip().lower() for t in query.split() if t.strip()]
        if not terms:
            return []

        scored = []
        for p in TOURIST_PLACES:
            score = 0
            name_lower = p["name"].lower()
            city_lower = p["city"].lower()
            desc_lower = (p.get("description") or "").lower()
            cat_lower = p.get("category", "").lower()
            tags_lower = " ".join(p.get("tags", [])).lower()

            for t in terms:
                if t == name_lower:
                    score += 10
                elif t in name_lower:
                    score += 5
                if t == city_lower:
                    score += 4
                elif t in city_lower:
                    score += 2
                if t in cat_lower:
                    score += 2
                if t in tags_lower:
                    score += 2
                if t in desc_lower:
                    score += 1

            if score > 0:
                scored.append((score, PlaceService.decorate(p)))

        scored.sort(key=lambda s: (-s[0], -s[1].get("rating", 0)))
        return [p for _, p in scored[:limit]]

    @staticmethod
    def get_by_id(place_id: str) -> Optional[dict]:
        return PlaceService.get_by_slug(place_id)

    @staticmethod
    def get_by_slug(slug_or_id: str) -> Optional[dict]:
        target = str(slug_or_id).strip().lower()
        target_norm = target.replace("-", "_")

        # 1. Check in-memory dataset by id
        for p in TOURIST_PLACES:
            pid = str(p["id"]).lower()
            if pid == target or pid == target_norm or pid.replace("-", "_") == target_norm:
                return PlaceService.decorate(p)

        # 2. Check in-memory dataset by slugified name
        for p in TOURIST_PLACES:
            pname_slug = p["name"].lower().replace(" ", "_").replace("-", "_")
            if pname_slug == target_norm:
                return PlaceService.decorate(p)

        # 3. Check SQLite database table
        from app.core.database import SessionLocal
        from app.models.tourist_place import TouristPlace

        db = SessionLocal()
        try:
            row = (
                db.query(TouristPlace)
                .filter(
                    (TouristPlace.place_id == target)
                    | (TouristPlace.place_id == target_norm)
                    | (TouristPlace.slug == target)
                    | (TouristPlace.slug == target_norm)
                )
                .first()
            )
            if row:
                raw_place = {
                    "id": row.place_id,
                    "place_id": row.place_id,
                    "slug": row.slug or row.place_id,
                    "name": row.name,
                    "city": row.city,
                    "state": row.state,
                    "category": row.category,
                    "description": row.description,
                    "rating": row.rating,
                    "latitude": row.latitude,
                    "longitude": row.longitude,
                    "tags": row.tags,
                    "best_time": row.best_time,
                    "opening_time": row.opening_time,
                    "closing_time": row.closing_time,
                    "estimated_cost": row.entry_fee,
                    "entry_fee": row.entry_fee,
                    "image": row.image_url,
                    "image_url": row.image_url,
                    "popularity": row.popularity,
                    "destination_slug": row.destination_slug,
                }
                return PlaceService.decorate(raw_place)
        finally:
            db.close()

        return None

    @staticmethod
    def get_nearby_for_place(
        slug_or_id: str,
        radius_km: float = 80.0,
        limit: int = 12,
    ) -> List[dict]:
        """Find places within strict radius_km (default 80km) from the anchor place."""
        anchor = PlaceService.get_by_slug(slug_or_id)
        if not anchor or anchor.get("latitude") is None or anchor.get("longitude") is None:
            return []

        lat, lng = anchor["latitude"], anchor["longitude"]
        anchor_id = str(anchor.get("id"))

        nearby = []
        for p in TOURIST_PLACES:
            if str(p["id"]) == anchor_id:
                continue
            dist = haversine_km(lat, lng, p.get("latitude"), p.get("longitude"))
            if dist is not None and dist <= radius_km:
                dec = PlaceService.decorate(p, lat=lat, lng=lng)
                nearby.append(dec)

        nearby.sort(key=lambda item: item.get("distance_km", 999))
        return nearby[:limit]

    @staticmethod
    def get_gallery_for_place(slug_or_id: str) -> List[dict]:
        """Return gallery images for a place."""
        place = PlaceService.get_by_slug(slug_or_id)
        if not place:
            return []

        from app.core.database import SessionLocal
        from app.models.destination import PlaceGallery

        db = SessionLocal()
        try:
            rows = (
                db.query(PlaceGallery)
                .filter(PlaceGallery.place_id == place["id"])
                .all()
            )
            if rows:
                return [{"image_url": r.image_url, "caption": r.caption} for r in rows]
        finally:
            db.close()

        # Fallback to place image and complementary views
        items = []
        if place.get("image"):
            items.append({"image_url": place["image"], "caption": f"View of {place['name']}"})
        return items

    @staticmethod
    def get_reviews_for_place(slug_or_id: str) -> List[dict]:
        """Return user reviews for a place."""
        place = PlaceService.get_by_slug(slug_or_id)
        if not place:
            return []

        from app.core.database import SessionLocal
        from app.models.destination import Review

        db = SessionLocal()
        try:
            rows = (
                db.query(Review)
                .filter(Review.place_id == place["id"])
                .order_by(Review.created_at.desc())
                .all()
            )
            if rows:
                return [
                    {
                        "id": r.id,
                        "author_name": r.author_name,
                        "rating": r.rating,
                        "comment": r.comment,
                        "created_at": r.created_at.isoformat() if r.created_at else None,
                    }
                    for r in rows
                ]
        finally:
            db.close()

        # Seeded default reviews if none in table
        rating = place.get("rating", 4.8)
        return [
            {
                "id": 1,
                "author_name": "Traveler Reviewer",
                "rating": rating,
                "comment": f"A wonderful place to visit in {place.get('city', 'Karnataka')}! Don't forget to visit during {place.get('best_time', 'morning hours')}.",
                "created_at": "2026-02-15T10:00:00Z",
            }
        ]
