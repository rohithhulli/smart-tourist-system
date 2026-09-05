"""
SQLAlchemy ORM models for Destinations, Events, Galleries, and Reviews.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
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


class Destination(Base):
    """Canonical travel destinations/regions."""

    __tablename__ = "destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), default="Karnataka", nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    hero_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    best_time: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )


class Event(Base):
    """Festivals, fairs, and cultural events associated with a destination."""

    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    destination_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    destination_slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[str] = mapped_column(String(100), nullable=False)
    month: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )


class DestinationGallery(Base):
    """Photo gallery images for destinations."""

    __tablename__ = "destination_galleries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    destination_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    destination_slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class PlaceGallery(Base):
    """Photo gallery images for individual tourist places."""

    __tablename__ = "place_galleries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    place_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class Review(Base):
    """User reviews and travel impressions for places or destinations."""

    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    place_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    destination_slug: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    author_name: Mapped[str] = mapped_column(String(120), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
