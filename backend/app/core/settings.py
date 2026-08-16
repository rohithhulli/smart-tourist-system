"""
Environment-driven application settings (Phase 3).

Loads a `.env` file from the backend directory and exposes typed settings.
Defaults keep local development working with zero configuration.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory (one level above this file).
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

_WEAK_SECRETS = {"change-this-development-secret"}


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str, default: list) -> list:
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smarttourist.db")

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

if JWT_SECRET in _WEAK_SECRETS:
    import warnings

    warnings.warn(
        "JWT_SECRET is set to a known weak default. Set a strong random "
        "secret in backend/.env before deploying (see .env.example)."
    )

# Comma-separated list of allowed frontend origins (with credentials).
FRONTEND_ORIGINS = _env_list(
    "FRONTEND_ORIGIN",
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)

# Set to true behind HTTPS so the auth cookie is only sent over TLS.
COOKIE_SECURE = _env_bool("COOKIE_SECURE", default=False)

# Auth cookie name.
AUTH_COOKIE_NAME = "access_token"

# Public Overpass (OpenStreetMap) endpoints used by the nearby-services proxy.
# No API key required. The first one that responds wins; can be overridden in
# .env with a comma-separated list (OVERPASS_URLS).
OVERPASS_URLS = _env_list(
    "OVERPASS_URLS",
    [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
    ],
)
