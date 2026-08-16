"""
Application configuration for the Smart Tourist recommendation engine.

Centralises tunable weights and defaults so the recommendation behaviour can
be adjusted without touching the ML logic.
"""

# ---- Recommendation score weights (must sum to 1.0) ----
# final_score = w_content * content_similarity
#             + w_quality * quality_score
#             + w_budget  * budget_score
#             + w_distance * distance_score
WEIGHTS = {
    "content": 0.50,    # user-interest match (TF-IDF cosine similarity)
    "quality": 0.20,    # normalised rating + popularity
    "budget": 0.20,     # fit of estimated cost to per-day per-person budget
    "distance": 0.10,   # geographic proximity to the destination
}

# Distance decay (km) used by distance_score = exp(-distance_km / DISTANCE_DECAY)
DISTANCE_DECAY = 60.0

# Per-location grouping: how far (km) from a trip stop we consider places to
# be "relevant" to that stop, and how many to return for each location.
LOCATION_RADIUS_KM = 80.0
LOCATION_TOP_N = 8

# Defaults used when a request omits a field
DEFAULT_DURATION_DAYS = 3
DEFAULT_TRAVELERS = 2
DEFAULT_BUDGET = 10000
DEFAULT_TOP_N = 12
MAX_TOP_N = 30

# How many places we may schedule per day in an itinerary
MIN_PLACES_PER_DAY = 1
MAX_PLACES_PER_DAY = 4

# Budget band thresholds (per day per person, INR) used for the budget label
BUDGET_BANDS = [
    ("budget", 1500),
    ("moderate", 4000),
    ("comfortable", 8000),
    ("luxury", float("inf")),
]

# User-Agent used for outbound geocoding calls
GEOCODING_USER_AGENT = "SmartTouristSystem/1.0"

# Known Karnataka city coordinates (authoritative, avoids flaky network lookups)
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
    "kundapura": (13.7820, 74.6390),
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
