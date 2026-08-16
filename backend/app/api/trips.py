"""
Trip API (Phase 3).

Trips are stored in SQLite and scoped to the authenticated user. Every request
requires a valid session; cross-user access returns 404 to avoid leaks.
"""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.orm import Trip, TripPlace as TripPlaceRow, User

router = APIRouter(prefix="/api/trips", tags=["trips"])


class TripPlace(BaseModel):
    id: Any = None
    name: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    estimated_cost: Optional[float] = None
    tripLocation: Optional[str] = None


class TripCreate(BaseModel):
    title: str = Field(..., max_length=200)
    start_location: Optional[str] = None
    destination: str = Field(..., min_length=1, max_length=200)
    stops: List[str] = Field(default_factory=list)
    dates: Optional[str] = None
    budget: Optional[float] = 0
    selected_places: List[TripPlace] = Field(default_factory=list)
    cover_image: Optional[str] = None
    status: Optional[str] = "Active"

    # New (spec) fields, all optional for backward compatibility.
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    interests: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    activities: Optional[List[str]] = None
    itinerary: Optional[dict] = None
    route: Optional[dict] = None
    duration_days: Optional[int] = None


class TripOut(TripCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: Any
    updated_at: Any


@router.get("/")
def get_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
        .all()
    )
    return {"status": "success", "data": [TripOut.model_validate(t) for t in trips]}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = Trip(
        user_id=current_user.id,
        title=payload.title,
        start_location=payload.start_location,
        destination=payload.destination,
        stops=payload.stops,
        dates=payload.dates,
        budget=payload.budget,
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
    _sync_trip_places(db, trip, payload)
    db.commit()
    db.refresh(trip)
    return {"status": "success", "data": TripOut.model_validate(trip)}


def _place_day_map(itinerary):
    """Map a place id -> day number from an itinerary payload, if present."""
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


def _sync_trip_places(db: Session, trip: Trip, payload: TripCreate) -> None:
    """Recreate the normalized trip_places rows for a trip.

    The trip's JSON `selected_places` column remains the read path; these rows
    are a queryable mirror kept in sync on every create/update.
    """
    db.query(TripPlaceRow).filter(TripPlaceRow.trip_id == trip.id).delete()
    day_map = _place_day_map(payload.itinerary)
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
                cost=place.estimated_cost,
            )
        )


def _copy_trip_fields(trip: Trip, payload: TripCreate) -> None:
    """Copy every editable TripCreate field onto an existing Trip row."""
    trip.title = payload.title
    trip.start_location = payload.start_location
    trip.destination = payload.destination
    trip.stops = payload.stops
    trip.dates = payload.dates
    trip.budget = payload.budget
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


@router.put("/{trip_id}")
def update_trip(
    trip_id: int,
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _get_owned_trip(trip_id, current_user, db)
    _copy_trip_fields(trip, payload)
    _sync_trip_places(db, trip, payload)
    db.commit()
    db.refresh(trip)
    return {"status": "success", "data": TripOut.model_validate(trip)}


def _get_owned_trip(
    trip_id: int, current_user: User, db: Session
) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found"
        )
    return trip


@router.get("/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _get_owned_trip(trip_id, current_user, db)
    return {"status": "success", "data": TripOut.model_validate(trip)}


@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = _get_owned_trip(trip_id, current_user, db)
    db.delete(trip)
    db.commit()
    return {"status": "success", "message": "Trip deleted"}
