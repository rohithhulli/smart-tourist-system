"""
Database compatibility shim.

Re-exports database session, engine, and initialization from app.core.database.
"""
from app.core.database import Base, SessionLocal, engine, get_db, init_db

__all__ = ["Base", "SessionLocal", "engine", "get_db", "init_db"]
