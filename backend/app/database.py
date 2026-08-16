"""
SQLAlchemy 2.0 database setup (Phase 3).

The database file path comes from the DATABASE_URL setting. On SQLite the
engine needs check_same_thread=False because FastAPI may use a threadpool.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.settings import DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables that do not yet exist. Never drops existing data.

    Runs lightweight additive migrations (ADD COLUMN only) so existing SQLite
    databases can be upgraded in place without destroying records. The
    `tourist_places` table is then seeded (idempotently) from the canonical
    dataset module.
    """
    from app.models import orm  # noqa: F401  (register models with Base.metadata)

    Base.metadata.create_all(bind=engine)

    _add_missing_columns(
        "trips",
        [
            ("activities", "TEXT"),
            ("categories", "TEXT"),
            ("route", "TEXT"),
        ],
    )

    _seed_tourist_places()


def _seed_tourist_places() -> None:
    """Upsert the canonical dataset into the tourist_places table.

    Idempotent: rows already present are updated in place, new rows are
    inserted, and nothing is ever deleted.
    """
    from app.data.tourist_places import get_all_places
    from app.models.orm import TouristPlace

    db = SessionLocal()
    try:
        for place in get_all_places():
            row = db.query(TouristPlace).filter(
                TouristPlace.place_id == place["id"]
            ).first()
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
    from sqlalchemy import text

    with engine.begin() as conn:
        existing = {
            row["name"]
            for row in conn.execute(text(f'PRAGMA table_info("{table}")')).mappings()
        }
        for name, coltype in columns:
            if name in existing:
                continue
            conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{name}" {coltype}'))
