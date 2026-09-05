"""
SQLAlchemy 2.0 database setup and session management.

Connects to the database specified in settings/config and provides session
dependency and additive table initialization.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all SQLAlchemy ORM models."""


def get_db():
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and run additive migrations if needed.

    Never drops existing user data. Seeds canonical tourist places and
    destinations into the database tables.
    """
    import app.models  # noqa: F401  (registers all models with Base.metadata)

    Base.metadata.create_all(bind=engine)

    _add_missing_columns(
        "trips",
        [
            ("activities", "TEXT"),
            ("categories", "TEXT"),
            ("route", "TEXT"),
        ],
    )

    _add_missing_columns(
        "tourist_places",
        [
            ("slug", "TEXT"),
            ("destination_slug", "TEXT"),
        ],
    )

    _seed_destinations()
    _seed_tourist_places()


def _seed_destinations() -> None:
    """Upsert canonical destinations, events, galleries, and reviews."""
    from app.core.destination_seeds import DESTINATION_SEEDS
    from app.models.destination import Destination, DestinationGallery, Event, PlaceGallery, Review

    db = SessionLocal()
    try:
        for seed in DESTINATION_SEEDS:
            dest = db.query(Destination).filter(Destination.slug == seed["slug"]).first()
            fields = {
                "name": seed["name"],
                "short_description": seed["short_description"],
                "description": seed["description"],
                "history": seed.get("history"),
                "district": seed.get("district"),
                "state": seed.get("state", "Karnataka"),
                "latitude": seed.get("latitude"),
                "longitude": seed.get("longitude"),
                "hero_image": seed.get("hero_image"),
                "best_time": seed.get("best_time"),
                "category": seed.get("category"),
            }
            if dest is None:
                dest = Destination(slug=seed["slug"], **fields)
                db.add(dest)
                db.flush()
            else:
                for k, v in fields.items():
                    setattr(dest, k, v)
                db.flush()

            # Seed events
            for ev in seed.get("events", []):
                existing_ev = (
                    db.query(Event)
                    .filter(Event.destination_slug == seed["slug"], Event.name == ev["name"])
                    .first()
                )
                if not existing_ev:
                    db.add(
                        Event(
                            destination_id=dest.id,
                            destination_slug=seed["slug"],
                            name=ev["name"],
                            date=ev["date"],
                            month=ev.get("month"),
                            description=ev["description"],
                            image_url=ev.get("image_url"),
                        )
                    )

            # Seed galleries
            for gal in seed.get("galleries", []):
                existing_gal = (
                    db.query(DestinationGallery)
                    .filter(
                        DestinationGallery.destination_slug == seed["slug"],
                        DestinationGallery.image_url == gal["image_url"],
                    )
                    .first()
                )
                if not existing_gal:
                    db.add(
                        DestinationGallery(
                            destination_id=dest.id,
                            destination_slug=seed["slug"],
                            image_url=gal["image_url"],
                            caption=gal.get("caption"),
                        )
                    )

            # Seed reviews
            for rev in seed.get("reviews", []):
                existing_rev = (
                    db.query(Review)
                    .filter(
                        Review.destination_slug == seed["slug"],
                        Review.author_name == rev["author_name"],
                    )
                    .first()
                )
                if not existing_rev:
                    db.add(
                        Review(
                            destination_slug=seed["slug"],
                            author_name=rev["author_name"],
                            rating=rev.get("rating", 5.0),
                            comment=rev["comment"],
                        )
                    )

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _seed_tourist_places() -> None:
    """Upsert the canonical dataset into the tourist_places table with slug and destination_slug."""
    from app.core.destination_seeds import DESTINATION_SEEDS
    from app.ml.dataset import get_all_places
    from app.models.tourist_place import TouristPlace

    city_to_dest = {}
    for d in DESTINATION_SEEDS:
        for alias in d.get("city_aliases", []):
            city_to_dest[alias.strip().lower()] = d["slug"]

    db = SessionLocal()
    try:
        for place in get_all_places():
            row = db.query(TouristPlace).filter(
                TouristPlace.place_id == place["id"]
            ).first()

            city = place.get("city") or ""
            dest_slug = city_to_dest.get(city.strip().lower())
            slug = place["id"]

            fields = {
                "name": place.get("name"),
                "city": place.get("city"),
                "state": place.get("state"),
                "category": place.get("category"),
                "description": place.get("description") or place.get("history"),
                "rating": place.get("rating"),
                "latitude": place.get("latitude"),
                "longitude": place.get("longitude"),
                "tags": place.get("tags"),
                "best_time": place.get("best_time"),
                "opening_time": place.get("opening_time"),
                "closing_time": place.get("closing_time"),
                "entry_fee": place.get("estimated_cost"),
                "image_url": place.get("image"),
                "popularity": place.get("popularity"),
                "slug": slug,
                "destination_slug": dest_slug,
            }
            if row is None:
                row = TouristPlace(place_id=place["id"], **fields)
                db.add(row)
            else:
                for key, value in fields.items():
                    setattr(row, key, value)
        db.commit()
    finally:
        db.close()


def _add_missing_columns(table: str, columns: list) -> None:
    """ALTER TABLE ADD COLUMN for any missing column (SQLite-compatible)."""
    with engine.begin() as conn:
        existing = {
            row["name"]
            for row in conn.execute(text(f'PRAGMA table_info("{table}")')).mappings()
        }
        for name, coltype in columns:
            if name in existing:
                continue
            conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{name}" {coltype}'))
