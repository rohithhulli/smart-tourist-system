"""
Business logic service for Destination discovery, place aggregation, events, and galleries.
"""
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.destination import Destination, DestinationGallery, Event, Review
from app.models.tourist_place import TouristPlace
from app.core.destination_facts import get_destination_facts
from app.services.place_service import PlaceService


class DestinationService:
    @staticmethod
    def _normalize_dest(dest: Destination, places_count: int = 0) -> Dict[str, Any]:
        facts = get_destination_facts(dest.slug)
        out = {
            "id": dest.id,
            "slug": dest.slug,
            "name": dest.name,
            "short_description": dest.short_description,
            "description": dest.description,
            "history": dest.history,
            "district": dest.district,
            "state": dest.state,
            "latitude": dest.latitude,
            "longitude": dest.longitude,
            "hero_image": dest.hero_image,
            "best_time": dest.best_time,
            "category": dest.category,
            "places_count": places_count,
            "tagline": facts.get("tagline", "Curated Destination in Karnataka"),
            "rating": facts.get("rating", 4.8),
            "suggested_duration": facts.get("suggested_duration", "2 Days / 1 Night"),
            "why_visit": facts.get("why_visit", []),
            "things_to_do": facts.get("things_to_do", []),
            "local_food": facts.get("local_food", []),
            "shopping": facts.get("shopping", []),
            "culture_festivals": facts.get("culture_festivals", []),
            "how_to_reach": facts.get("how_to_reach", {}),
            "best_time_details": facts.get("best_time_details", {}),
            "travel_tips": facts.get("travel_tips", []),
            "faqs": facts.get("faqs", []),
            "nearby_destinations": facts.get("nearby_destinations", []),
        }
        return out

    @staticmethod
    def list_destinations(
        query: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            q = db.query(Destination)
            if category and category.lower() != "all":
                q = q.filter(Destination.category.ilike(f"%{category.strip()}%"))
            if state and state.lower() != "all":
                q = q.filter(Destination.state.ilike(f"%{state.strip()}%"))
            if query:
                term = f"%{query.strip()}%"
                q = q.filter(
                    (Destination.name.ilike(term))
                    | (Destination.district.ilike(term))
                    | (Destination.short_description.ilike(term))
                    | (Destination.category.ilike(term))
                )

            destinations = q.order_by(Destination.name.asc()).all()

            # Pre-fetch counts for efficiency
            results = []
            for d in destinations:
                count = (
                    db.query(TouristPlace)
                    .filter(TouristPlace.destination_slug == d.slug)
                    .count()
                )
                results.append(DestinationService._normalize_dest(d, places_count=count))
            return results
        finally:
            db.close()

    @staticmethod
    def get_by_slug(slug_or_id: str) -> Optional[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            target = slug_or_id.strip().lower()
            dest = db.query(Destination).filter(Destination.slug == target).first()
            if not dest and target.isdigit():
                dest = db.query(Destination).filter(Destination.id == int(target)).first()

            if not dest:
                # Fuzzy match slug with hyphens or underscores
                normalized = target.replace("-", "").replace("_", "")
                all_dests = db.query(Destination).all()
                for d in all_dests:
                    if d.slug.replace("-", "").replace("_", "") == normalized:
                        dest = d
                        break

            if not dest:
                return None

            count = (
                db.query(TouristPlace)
                .filter(TouristPlace.destination_slug == dest.slug)
                .count()
            )
            data = DestinationService._normalize_dest(dest, places_count=count)
            return data
        finally:
            db.close()

    @staticmethod
    def get_places_for_destination(slug_or_id: str) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            dest_data = DestinationService.get_by_slug(slug_or_id)
            if not dest_data:
                return []
            slug = dest_data["slug"]

            places = (
                db.query(TouristPlace)
                .filter(TouristPlace.destination_slug == slug)
                .order_by(TouristPlace.popularity.desc(), TouristPlace.rating.desc())
                .all()
            )

            # Decorate each place with standard frontend attributes
            result = []
            for p in places:
                raw_place = {
                    "id": p.place_id,
                    "place_id": p.place_id,
                    "slug": p.slug or p.place_id,
                    "name": p.name,
                    "city": p.city,
                    "state": p.state,
                    "category": p.category,
                    "description": p.description,
                    "rating": p.rating,
                    "latitude": p.latitude,
                    "longitude": p.longitude,
                    "tags": p.tags,
                    "best_time": p.best_time,
                    "opening_time": p.opening_time,
                    "closing_time": p.closing_time,
                    "estimated_cost": p.entry_fee,
                    "entry_fee": p.entry_fee,
                    "image": p.image_url,
                    "image_url": p.image_url,
                    "popularity": p.popularity,
                    "destination_slug": p.destination_slug,
                }
                result.append(PlaceService.decorate(raw_place))
            return result
        finally:
            db.close()

    @staticmethod
    def get_events_for_destination(slug_or_id: str) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            dest_data = DestinationService.get_by_slug(slug_or_id)
            if not dest_data:
                return []
            events = (
                db.query(Event)
                .filter(Event.destination_slug == dest_data["slug"])
                .all()
            )
            return [
                {
                    "id": e.id,
                    "destination_slug": e.destination_slug,
                    "name": e.name,
                    "date": e.date,
                    "month": e.month,
                    "description": e.description,
                    "image_url": e.image_url,
                }
                for e in events
            ]
        finally:
            db.close()

    @staticmethod
    def get_gallery_for_destination(slug_or_id: str) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            dest_data = DestinationService.get_by_slug(slug_or_id)
            if not dest_data:
                return []
            items = (
                db.query(DestinationGallery)
                .filter(DestinationGallery.destination_slug == dest_data["slug"])
                .all()
            )
            return [
                {
                    "id": g.id,
                    "destination_slug": g.destination_slug,
                    "image_url": g.image_url,
                    "caption": g.caption,
                }
                for g in items
            ]
        finally:
            db.close()

    @staticmethod
    def get_reviews_for_destination(slug_or_id: str) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            dest_data = DestinationService.get_by_slug(slug_or_id)
            if not dest_data:
                return []
            items = (
                db.query(Review)
                .filter(Review.destination_slug == dest_data["slug"])
                .all()
            )
            return [
                {
                    "id": r.id,
                    "author_name": r.author_name,
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in items
            ]
        finally:
            db.close()

    @staticmethod
    def search_all(query: str, limit: int = 10) -> Dict[str, Any]:
        """Unified search across destinations and tourist places."""
        destinations = DestinationService.list_destinations(query=query)
        places = PlaceService.search_places(query=query, limit=limit)
        return {
            "query": query,
            "destinations": destinations[:limit],
            "places": places[:limit],
            "total_matches": len(destinations) + len(places),
        }
