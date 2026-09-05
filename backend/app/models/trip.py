"""
Trip and TripPlace SQLAlchemy ORM models.
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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


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

    # Extra fields kept for backward compatibility with frontend
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
    """Normalized row mirroring one selected place inside a trip."""

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
