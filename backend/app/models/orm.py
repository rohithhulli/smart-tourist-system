"""
ORM models (Phase 3).

User, Trip, TripPlace, TouristPlace and Favorite are stored in SQLite via
SQLAlchemy. JSON columns are used for flexible structures such as interests,
selected places and itineraries. TripPlace rows are a normalized mirror of a
trip's selected places (kept in sync on save) while the JSON column remains
the read path for backward compatibility.
"""
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    trips = relationship(
        "Trip", back_populates="user", cascade="all, delete-orphan"
    )
    favorites = relationship(
        "Favorite", back_populates="user", cascade="all, delete-orphan"
    )


class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = ({"sqlite_autoincrement": True},)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    destination: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    travelers: Mapped[int | None] = mapped_column(Integer, nullable=True)
    budget: Mapped[int | None] = mapped_column(Integer, nullable=True)

    interests: Mapped[list | None] = mapped_column(JSON, nullable=True)
    categories: Mapped[list | None] = mapped_column(JSON, nullable=True)
    activities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    selected_places: Mapped[list | None] = mapped_column(JSON, nullable=True)
    itinerary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    route: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Extra fields kept for compatibility with the existing frontend payload.
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    start_location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    stops: Mapped[list | None] = mapped_column(JSON, nullable=True)
    dates: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    user = relationship("User", back_populates="trips")
    trip_places = relationship(
        "TripPlace",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="TripPlace.position",
    )


class TripPlace(Base):
    """A normalized row mirroring one selected place inside a trip.

    Written alongside the trip's JSON `selected_places` column; kept in sync on
    create/update so the database is queryable per-place/per-day without
    breaking the existing JSON read path.
    """

    __tablename__ = "trip_places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    place_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    place_name: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    day_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    slot: Mapped[str | None] = mapped_column(String(50), nullable=True)
    cost: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    trip = relationship("Trip", back_populates="trip_places")


class TouristPlace(Base):
    """Database mirror of the canonical tourist-place dataset.

    Seeded from `app.data.tourist_places` on startup (idempotent upsert). The
    Python module remains the single source of truth for recommendations; this
    table gives the database a queryable copy for analytics and future
    admin features.
    """

    __tablename__ = "tourist_places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    place_id: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str | None] = mapped_column(String(120), nullable=True)
    category: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    best_time: Mapped[str | None] = mapped_column(String(100), nullable=True)
    opening_time: Mapped[str | None] = mapped_column(String(30), nullable=True)
    closing_time: Mapped[str | None] = mapped_column(String(30), nullable=True)
    entry_fee: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    popularity: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_user_place"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    place_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    user = relationship("User", back_populates="favorites")
