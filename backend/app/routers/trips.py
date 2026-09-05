"""
Trips router endpoints (/api/trips).
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.trip import TripCreate, TripOut
from app.services.trip_service import TripService

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.get("/")
def get_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trips = TripService.get_user_trips(db, current_user)
    return {"status": "success", "data": trips}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = TripService.create_trip(db, current_user, payload)
    return {"status": "success", "data": trip}


@router.get("/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = TripService.get_trip_by_id(db, trip_id, current_user)
    return {"status": "success", "data": TripOut.model_validate(trip)}


@router.put("/{trip_id}")
def update_trip(
    trip_id: int,
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = TripService.update_trip(db, trip_id, current_user, payload)
    return {"status": "success", "data": updated}


@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    TripService.delete_trip(db, trip_id, current_user)
    return {"status": "success", "message": "Trip deleted"}
