"""
Favorites API (Phase 3).

Users can save tourist places; a unique (user_id, place_id) constraint prevents
duplicates. Favorite entries are validated against the canonical dataset.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.data.tourist_places import get_place_by_id
from app.models.orm import Favorite, User

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


class FavoriteCreate(BaseModel):
    place_id: str


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_favorite(
    payload: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = get_place_by_id(payload.place_id)
    if place is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Place not found"
        )

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.place_id == payload.place_id,
        )
        .first()
    )
    if existing:
        return {"status": "success", "message": "Already favorited"}

    fav = Favorite(user_id=current_user.id, place_id=payload.place_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {
        "status": "success",
        "message": "Added to favorites",
        "favorite": {
            "id": fav.id,
            "place_id": fav.place_id,
            "created_at": fav.created_at.isoformat(),
        },
    }


@router.get("/")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favs = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    data = []
    for fav in favs:
        place = get_place_by_id(fav.place_id)
        if place is None:
            continue
        data.append(
            {
                "id": fav.id,
                "place_id": fav.place_id,
                "created_at": fav.created_at.isoformat(),
                "place": place,
            }
        )
    return {"status": "success", "data": data}


@router.delete("/{place_id}")
def remove_favorite(
    place_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.place_id == place_id,
        )
        .first()
    )
    if fav is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    db.delete(fav)
    db.commit()
    return {"status": "success", "message": "Removed from favorites"}
