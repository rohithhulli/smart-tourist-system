"""
Application configuration and environment settings.

Centralises environment variables, tunable recommendation weights,
and system constants.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root directory
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


# --- Database & Auth Settings ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smarttourist.db")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days default

if JWT_SECRET in _WEAK_SECRETS:
    import warnings

    warnings.warn(
        "JWT_SECRET is set to a known weak default. Set a strong random "
        "secret in backend/.env before deploying (see .env.example)."
    )

# Allowed CORS origins
FRONTEND_ORIGINS = _env_list(
    "FRONTEND_ORIGIN",
    ["http://localhost:5173", "http://127.0.0.1:5173"],
)

COOKIE_SECURE = _env_bool("COOKIE_SECURE", default=False)
AUTH_COOKIE_NAME = "access_token"

# Public Overpass (OSM) endpoints
OVERPASS_URLS = _env_list(
    "OVERPASS_URLS",
    [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
    ],
)

# --- Recommendation ML Weights & Parameters ---
# Hybrid scoring formula (v2 — Phase 1 engine upgrade):
#
#   final = 0.35  * content          (TF-IDF cosine similarity, still dominant)
#         + 0.15  * quality          (normalised rating + popularity)
#         + 0.15  * budget           (per-day per-person cost fit)
#         + 0.10  * distance         (proximity to destination)
#         + 0.10  * category         (interest -> dataset category/tag match)
#         + 0.075 * traveler         (traveler-type suitability)
#         + 0.075 * personalization  (deterministic profile from favorites/trips)
#
# Weights sum to exactly 1.0. TF-IDF content remains the single largest
# signal; the three new signals are deliberately conservative. When an
# input is absent, its component becomes a documented constant:
#   * no interests selected      -> content = 0 and category = 0
#   * no traveler_type specified -> traveler = NEUTRAL_TRAVELER_SCORE (0.5)
#   * no user history            -> personalization = NEUTRAL_PREFERENCE_SCORE (0.5)
WEIGHTS = {
    "content": 0.35,
    "quality": 0.15,
    "budget": 0.15,
    "distance": 0.10,
    "category": 0.10,
    "traveler": 0.075,
    "personalization": 0.075,
}

DISTANCE_DECAY = 60.0
LOCATION_RADIUS_KM = 80.0
LOCATION_TOP_N = 8

DEFAULT_DURATION_DAYS = 3
DEFAULT_TRAVELERS = 2
DEFAULT_BUDGET = 10000
DEFAULT_TOP_N = 12
MAX_TOP_N = 30

MIN_PLACES_PER_DAY = 1
MAX_PLACES_PER_DAY = 4

BUDGET_BANDS = [
    ("budget", 1500),
    ("moderate", 4000),
    ("comfortable", 8000),
    ("luxury", float("inf")),
]

GEOCODING_USER_AGENT = "SmartTouristSystem/1.0"

CITY_COORDS = {
    "mysuru": (12.2958, 76.6394),
    "mysore": (12.2958, 76.6394),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "coorg": (12.4244, 75.7382),
    "madikeri": (12.4244, 75.7382),
    "chikkamagaluru": (13.3161, 75.7720),
    "chikmagalur": (13.3161, 75.7720),
    "chikmagaluru": (13.3161, 75.7720),
    "mangaluru": (12.9141, 74.8560),
    "mangalore": (12.9141, 74.8560),
    "udupi": (13.3409, 74.7421),
    "gokarna": (14.5486, 74.3181),
    "hampi": (15.3350, 76.4600),
    "badami": (15.9149, 75.6768),
    "vijayapura": (16.8302, 75.7100),
    "bijapur": (16.8302, 75.7100),
    "dharmasthala": (12.9566, 75.3807),
    "horanadu": (13.1321, 75.3725),
    "sringeri": (13.4175, 75.2525),
    "kukke subramanya": (12.8639, 75.2049),
    "subramanya": (12.8639, 75.2049),
    "shivamogga": (13.9299, 75.5681),
    "shimoga": (13.9299, 75.5681),
    "jog falls": (14.2284, 74.8118),
    "belur": (13.1630, 75.8680),
    "halebidu": (13.2153, 75.9910),
    "shravanabelagola": (12.8573, 76.4870),
    "sakleshpur": (12.9417, 75.7847),
    "murudeshwara": (14.0944, 74.4844),
    "mandya": (12.4571, 76.5516),
    "somnathpur": (12.2725, 76.8810),
    "talakadu": (12.1173, 77.0130),
    "srirangapatna": (12.4139, 76.7042),
    "kabini": (11.9720, 76.3130),
    "bandipur": (11.6639, 76.6271),
    "nagarhole": (12.0600, 76.0800),
    "kudremukh": (13.2185, 75.2536),
    "agumbe": (13.5090, 75.0950),
    "bylakuppe": (12.4200, 76.0500),
    "sagar": (14.2685, 74.4350),
    "kollur": (13.8620, 74.8110),
    "bhatkal": (14.0944, 74.4844),
    "kundapura": (13.7820, 74.6390),
    "hassan": (13.0070, 76.0960),
    "chikkaballapur": (13.4355, 77.7319),
    "devanahalli": (13.2490, 77.7110),
    "karwar": (14.8123, 74.1293),
    "hubballi": (15.3647, 75.1240),
    "hubli": (15.3647, 75.1240),
    "dharwad": (15.4589, 75.0078),
    "honnavar": (14.2800, 74.4500),
    "honnavara": (14.2800, 74.4500),
    "kumta": (14.4300, 74.4000),
    "sirsi": (14.6200, 74.8500),
    "ankola": (14.6600, 74.3000),
    "gadag": (15.4298, 75.6298),
    "haveri": (14.7948, 75.3987),
    "davanagere": (14.4644, 75.9218),
    "ballari": (15.1422, 76.9216),
    "bellary": (15.1422, 76.9216),
    "chitradurga": (14.2305, 76.3990),
    "tumakuru": (13.3379, 77.1173),
    "tumkur": (13.3379, 77.1173),
}
