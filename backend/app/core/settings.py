"""
Settings compatibility module.

Re-exports configuration settings from app.core.config.
"""
from app.core.config import (
    AUTH_COOKIE_NAME,
    COOKIE_SECURE,
    DATABASE_URL,
    FRONTEND_ORIGINS,
    JWT_ALGORITHM,
    JWT_EXPIRE_MINUTES,
    JWT_SECRET,
    OVERPASS_URLS,
)

__all__ = [
    "AUTH_COOKIE_NAME",
    "COOKIE_SECURE",
    "DATABASE_URL",
    "FRONTEND_ORIGINS",
    "JWT_ALGORITHM",
    "JWT_EXPIRE_MINUTES",
    "JWT_SECRET",
    "OVERPASS_URLS",
]
