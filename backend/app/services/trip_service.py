"""
Trip CRUD and place synchronization business logic.
"""
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.trip import Trip, TripPlace as TripPlaceRow
from app.models.user import User
from app.schemas.trip import TripCreate, TripOut


class TripService:
    @staticmethod
    def get_user_trips(db: Session, user: User) -> List[TripOut]:
        trips = (
            db.query(Trip)
            .filter(Trip.user_id == user.id)
            .order_by(Trip.created_at.desc())
            .all()
        )
        return [TripOut.model_validate(t) for t in trips]

    @staticmethod
    def get_trip_by_id(db: Session, trip_id: int, user: User) -> Trip:
        trip = db.get(Trip, trip_id)
        if trip is None or trip.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found"
            )
        return trip

    @classmethod
    def create_trip(cls, db: Session, user: User, payload: TripCreate) -> TripOut:
        trip = Trip(
            user_id=user.id,
            title=payload.title,
            start_location=payload.start_location,
            destination=payload.destination,
            stops=payload.stops,
            dates=payload.dates,
            budget=int(payload.budget) if payload.budget is not None else None,
            selected_places=[p.model_dump() for p in payload.selected_places],
            cover_image=payload.cover_image,
            status=payload.status,
            start_date=payload.start_date,
            end_date=payload.end_date,
            travelers=payload.travelers,
            interests=payload.interests,
            categories=payload.categories,
            activities=payload.activities,
            itinerary=payload.itinerary,
            route=payload.route,
        )
        db.add(trip)
        db.flush()
        cls._sync_trip_places(db, trip, payload)
        db.commit()
        db.refresh(trip)
        return TripOut.model_validate(trip)

    @classmethod
    def update_trip(
        cls, db: Session, trip_id: int, user: User, payload: TripCreate
    ) -> TripOut:
        trip = cls.get_trip_by_id(db, trip_id, user)
        trip.title = payload.title
        trip.start_location = payload.start_location
        trip.destination = payload.destination
        trip.stops = payload.stops
        trip.dates = payload.dates
        trip.budget = int(payload.budget) if payload.budget is not None else None
        trip.selected_places = [p.model_dump() for p in payload.selected_places]
        trip.cover_image = payload.cover_image
        trip.status = payload.status
        trip.start_date = payload.start_date
        trip.end_date = payload.end_date
        trip.travelers = payload.travelers
        trip.interests = payload.interests
        trip.categories = payload.categories
        trip.activities = payload.activities
        trip.itinerary = payload.itinerary
        trip.route = payload.route

        cls._sync_trip_places(db, trip, payload)
        db.commit()
        db.refresh(trip)
        return TripOut.model_validate(trip)

    @classmethod
    def delete_trip(cls, db: Session, trip_id: int, user: User) -> None:
        trip = cls.get_trip_by_id(db, trip_id, user)
        db.delete(trip)
        db.commit()

    @staticmethod
    def _place_day_map(itinerary: Optional[dict]) -> Dict[str, int]:
        mapping = {}
        if not itinerary:
            return mapping
        for day in itinerary.get("days") or []:
            day_num = day.get("day")
            for item in day.get("places") or []:
                p = item.get("place") or item
                pid = p.get("id") or p.get("place_id") or p.get("name")
                if pid:
                    mapping.setdefault(str(pid), day_num)
        return mapping

    @classmethod
    def _sync_trip_places(cls, db: Session, trip: Trip, payload: TripCreate) -> None:
        db.query(TripPlaceRow).filter(TripPlaceRow.trip_id == trip.id).delete()
        day_map = cls._place_day_map(payload.itinerary)
        for position, place in enumerate(payload.selected_places):
            pid = str(place.id) if place.id is not None else place.name
            db.add(
                TripPlaceRow(
                    trip_id=trip.id,
                    place_id=pid,
                    place_name=place.name,
                    city=place.city,
                    latitude=place.lat,
                    longitude=place.lng,
                    position=position,
                    day_number=day_map.get(pid),
                    cost=int(place.estimated_cost) if place.estimated_cost is not None else None,
                )
            )
