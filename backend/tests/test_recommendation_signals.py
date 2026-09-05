"""
Phase 1 recommendation-engine tests.

Covers: category matching, traveler type, personalization from genuine
user history (favorites / saved trips), neutral fallbacks for users
without history, and explanation integrity.
"""
from app.core.database import SessionLocal
from app.ml.preferences import (
    NEUTRAL_PREFERENCE_SCORE,
    build_preference_profile,
    describe_history,
    preference_score,
)
from app.models.user import User

NATURE_CATEGORIES = {"Nature", "Garden", "Waterfall", "Wildlife", "Hill Station"}

# Every reason must be one of these prefixes — anything else would mean a
# claim not backed by a real scoring signal.
ALLOWED_REASON_PREFIXES = (
    "Fits your ",
    "Matches your selected interests",
    "Suits ",
    "Similar to places you have ",
    "Highly rated",
    "Fits within your budget",
    "Close to ",
    "Ranked by quality, budget and proximity",
    "Partial match based on your overall profile",
)

RECOMMEND_BASE = {
    "destination": "Mysuru",
    "start_location": "Bengaluru",
    "budget": 20000,
    "travelers": 2,
    "duration_days": 2,
}


def _recommend(client, **overrides):
    payload = {**RECOMMEND_BASE, **overrides}
    return client.post("/api/planner/recommend", json=payload)


def _signup(client, email):
    r = client.post(
        "/api/auth/signup",
        json={"name": "Pref Tester", "email": email, "password": "Strong@123"},
    )
    assert r.status_code == 201, r.text
    # Signup no longer authenticates; log in to obtain the session cookie.
    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Strong@123"},
    )
    assert login.status_code == 200, login.text


# ----------------------------------------------------------------------
# 1. Category matching
# ----------------------------------------------------------------------

def test_category_matching_surfaces_matching_categories(client):
    r = _recommend(client, interests=["Nature"], top_n=10)
    assert r.status_code == 200
    recs = r.json()["recommendations"]
    assert len(recs) == 10

    # Every breakdown carries the new category component.
    assert all("category" in rec["score_breakdown"] for rec in recs)

    # Nature interest should dominate the ranking with nature-like places.
    nature_hits = sum(
        1 for rec in recs if rec["place"]["category"] in NATURE_CATEGORIES
    )
    assert nature_hits >= 8, [rec["place"]["category"] for rec in recs]

    # A place whose category matches gets a full category score.
    waterfall = next(
        rec for rec in recs if rec["place"]["category"] == "Waterfall"
    )
    assert waterfall["score_breakdown"]["category"] == 1.0


def test_category_score_zero_without_interests(client):
    r = _recommend(client)
    assert r.status_code == 200
    body = r.json()
    assert len(body["recommendations"]) > 0
    # No interests -> content and category both neutral-zero; ranking is
    # driven by quality/budget/distance exactly as before.
    for rec in body["recommendations"]:
        assert rec["score_breakdown"]["content"] == 0.0
        assert rec["score_breakdown"]["category"] == 0.0


# ----------------------------------------------------------------------
# 2. Traveler type
# ----------------------------------------------------------------------

def test_traveler_type_valid_and_invalid(client):
    ok = _recommend(client, traveler_type="Family", top_n=30)
    assert ok.status_code == 200
    recs = ok.json()["recommendations"]
    assert recs
    assert all("traveler" in rec["score_breakdown"] for rec in recs)

    # The zoo explicitly carries family/children markers in the dataset.
    zoo = next(rec for rec in recs if rec["place"]["id"] == "mysore-zoo")
    assert zoo["score_breakdown"]["traveler"] >= 0.8

    bad = _recommend(client, traveler_type="alien")
    assert bad.status_code == 422

    missing = _recommend(client, traveler_type=None)
    assert missing.status_code == 200
    for rec in missing.json()["recommendations"]:
        assert rec["score_breakdown"]["traveler"] == 0.5  # documented neutral


def test_adventure_traveler_prefers_thrilling_places(client):
    r = _recommend(client, interests=["Adventure"], traveler_type="adventure", top_n=10)
    assert r.status_code == 200
    recs = r.json()["recommendations"]
    thrill_categories = {"Adventure", "Trekking", "Wildlife", "Waterfall"}
    hits = sum(1 for rec in recs if rec["place"]["category"] in thrill_categories)
    assert hits >= 6


# ----------------------------------------------------------------------
# 3. User with no history
# ----------------------------------------------------------------------

def test_user_without_history_gets_neutral_personalization(client):
    _signup(client, "nohistory@example.com")  # session cookie set on client
    r = _recommend(client, top_n=12)
    assert r.status_code == 200
    body = r.json()

    # Recommendations still work normally.
    assert len(body["recommendations"]) > 0
    assert "personalized" not in body["preferences"]

    # Neutral constant for every place (documented default).
    for rec in body["recommendations"]:
        assert rec["score_breakdown"]["personalization"] == NEUTRAL_PREFERENCE_SCORE


# ----------------------------------------------------------------------
# 4. User with favorites
# ----------------------------------------------------------------------

def test_user_with_favorites_gets_personalized_scores(client):
    _signup(client, "favuser@example.com")
    fav = client.post("/api/favorites/", json={"place_id": "chamundi-hill-temple"})
    assert fav.status_code == 201

    r = _recommend(client, top_n=30)
    assert r.status_code == 200
    body = r.json()
    assert body["preferences"].get("personalized") == ["true"]

    recs = {rec["place"]["id"]: rec for rec in body["recommendations"]}
    chamundi = recs["chamundi-hill-temple"]
    # A favorited place itself scores maximum personalization.
    assert chamundi["score_breakdown"]["personalization"] == 1.0
    # The reason reflects the real data source (favorites).
    assert any("favorited" in reason for reason in chamundi["reasons"])

    # Other Temple-category places inherit part of the preference.
    temple_boosts = [
        rec["score_breakdown"]["personalization"]
        for rec in body["recommendations"]
        if rec["place"]["category"] == "Temple"
    ]
    assert any(score > NEUTRAL_PREFERENCE_SCORE for score in temple_boosts)


# ----------------------------------------------------------------------
# 5. User with saved trip places
# ----------------------------------------------------------------------

def test_user_with_saved_trip_places_gets_personalized_scores(client):
    _signup(client, "tripuser@example.com")
    trip = client.post(
        "/api/trips/",
        json={
            "title": "Waterfall run",
            "destination": "Shivamogga",
            "selected_places": [
                {"id": "jog-falls", "name": "Jog Falls"},
                {"id": "abbey-falls", "name": "Abbey Falls"},
            ],
        },
    )
    assert trip.status_code == 201, trip.text

    r = _recommend(client, interests=["Nature"], top_n=30)
    assert r.status_code == 200
    body = r.json()
    assert body["preferences"].get("personalized") == ["true"]

    recs = {rec["place"]["id"]: rec for rec in body["recommendations"]}
    jog = recs["jog-falls"]
    assert jog["score_breakdown"]["personalization"] >= 0.9
    assert any("saved" in reason for reason in jog["reasons"])

    # Waterfalls in general benefit from the saved-trip history.
    falls = [
        rec["score_breakdown"]["personalization"]
        for rec in body["recommendations"]
        if rec["place"]["category"] == "Waterfall"
    ]
    assert falls and max(falls) >= 0.9


# ----------------------------------------------------------------------
# 6. Preference score internals (unit-level)
# ----------------------------------------------------------------------

def test_preference_profile_is_deterministic_and_normalized(client):
    _signup(client, "profile@example.com")
    for pid in ("jog-falls", "abbey-falls"):
        assert client.post("/api/favorites/", json={"place_id": pid}).status_code == 201

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "profile@example.com").one()
        profile = build_preference_profile(db, user)
        assert profile, "expected a non-empty profile"
        assert all(0.0 <= v <= 1.0 for v in profile.values())
        peak = max(profile.values())
        assert peak == 1.0

        # Both favorites are Waterfall-category places -> strongest label.
        assert profile.get("waterfall") == 1.0

        # Deterministic across repeated calls.
        again = build_preference_profile(db, user)
        assert again == profile

        # The jog-falls place itself gets a perfect fit under this profile.
        from app.ml.dataset import get_place_by_id

        jog = get_place_by_id("jog-falls")
        assert jog is not None
        assert preference_score(jog, profile) == 1.0
        assert describe_history(db, user) == "favorited"

        # Anonymous user -> empty profile, neutral scoring.
        assert build_preference_profile(db, None) == {}
    finally:
        db.close()


def test_trip_history_described_as_saved(client):
    _signup(client, "tripsrc@example.com")
    client.post(
        "/api/trips/",
        json={
            "title": "Heritage loop",
            "destination": "Hampi",
            "selected_places": [{"id": "hampi-ruins", "name": "Hampi Ruins"}],
        },
    )
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "tripsrc@example.com").one()
        assert describe_history(db, user) == "saved"
        profile = build_preference_profile(db, user)
        assert profile.get("heritage", 0) > 0
    finally:
        db.close()


# ----------------------------------------------------------------------
# 7. Recommendation explanations
# ----------------------------------------------------------------------

def test_reasons_are_structured_and_truthful(client):
    r = _recommend(
        client,
        interests=["History"],
        categories=["Heritage"],
        activities=["Photography"],
        traveler_type="couple",
        top_n=12,
    )
    assert r.status_code == 200
    recs = r.json()["recommendations"]
    assert recs

    for rec in recs:
        reasons = rec.get("reasons")
        assert isinstance(reasons, list) and reasons, rec
        # match_reason stays backward compatible (joined string).
        assert rec["match_reason"] == "; ".join(reasons)
        for reason in reasons:
            assert reason.startswith(ALLOWED_REASON_PREFIXES), reason

    # Heritage interest + Heritage category filter -> category reason on top
    # heritage picks.
    heritage_top = [
        rec for rec in recs[:5] if rec["place"]["category"] in {"Heritage", "Monument"}
    ]
    assert heritage_top
    assert any(
        reason.startswith("Fits your ") for rec in heritage_top for reason in rec["reasons"]
    )


def test_breakdown_contains_all_seven_signals_and_weights_sum_to_one(client):
    from app.core.config import WEIGHTS

    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9
    assert WEIGHTS["content"] == max(WEIGHTS.values()), "TF-IDF must stay dominant"

    r = _recommend(client, interests=["Nature"], top_n=5)
    expected = {
        "content", "quality", "budget", "distance",
        "category", "traveler", "personalization",
    }
    for rec in r.json()["recommendations"]:
        assert expected <= set(rec["score_breakdown"].keys())
