"""
Shared pytest fixtures.

A throwaway SQLite database is used so tests never touch the real
`smarttourist.db`. Env vars are set before any app import so the engine is
built against the test database.
"""
import os

os.environ["DATABASE_URL"] = "sqlite:///./test_smarttourist.db"
os.environ["JWT_SECRET"] = "test-only-secret-not-for-production"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:5173"

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal, init_db
from main import app
from app.models.orm import Favorite, Trip, TripPlace, User


@pytest.fixture()
def client():
    init_db()
    with TestClient(app) as c:
        yield c
    c.cookies.clear()


@pytest.fixture(autouse=True)
def clean_db():
    yield
    db = SessionLocal()
    try:
        db.query(TripPlace).delete()
        db.query(Trip).delete()
        db.query(Favorite).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()


def signup(client, email="tester@example.com", name="Test User", password="Strong@123"):
    return client.post(
        "/api/auth/signup",
        json={"name": name, "email": email, "password": password},
    )
