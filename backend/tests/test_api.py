"""
End-to-end API tests covering auth, places, planner, trips, favorites and meta.

Run with:  python -m pytest tests -v
"""
from conftest import signup


# --------------------------------------------------------------------------- auth
def test_signup_returns_user_and_http_only_cookie(client):
    r = signup(client)
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["name"] == "Test User"
    assert body["user"]["email"] == "tester@example.com"
    assert r.cookies.get("access_token")
    assert r.headers.get("set-cookie", "").lower().find("httponly") != -1


def test_signup_duplicate_email_conflicts(client):
    signup(client)
    r = signup(client)
    assert r.status_code == 409


def test_login_rejects_wrong_password(client):
    signup(client)
    r = client.post(
        "/api/auth/login", json={"email": "tester@example.com", "password": "nope"}
    )
    assert r.status_code == 401


def test_login_me_logout_flow(client):
    signup(client)
    r = client.post(
        "/api/auth/login", json={"email": "tester@example.com", "password": "Strong@123"}
    )
    assert r.status_code == 200
    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "tester@example.com"
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401


def test_profile_update_renames_user(client):
    signup(client)
    r = client.put("/api/auth/me", json={"name": "Renamed", "email": "renamed@example.com"})
    assert r.status_code == 200
    user = r.json()["user"]
    assert user["name"] == "Renamed"
    assert user["email"] == "renamed@example.com"
    assert client.get("/api/auth/me").json()["user"]["name"] == "Renamed"


def test_authenticated_endpoints_require_session(client):
    assert client.get("/api/trips/").status_code == 401
    assert client.get("/api/favorites/").status_code == 401


# ------------------------------------------------------------------------- places
def test_canonical_places_list(client):
    r = client.get("/api/places/")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) == 99
    required = {"id", "name", "city", "state", "category", "latitude", "longitude"}
    assert all(required <= set(p.keys()) for p in data)


def test_places_search_finds_mysore_palace(client):
    r = client.get("/api/places/search", params={"q": "mysore", "limit": 5})
    assert r.status_code == 200
    names = [p["name"].lower() for p in r.json()["data"]]
    assert any("mysore" in n for n in names)


# -------------------------------------------------------------------------- meta
def test_meta_stats_counts(client):
    r = client.get("/api/meta/stats")
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total_places"] == 99
    assert data["total_cities"] >= 49
    assert data["avg_rating"] is not None


# ----------------------------------------------------------------------- planner
def test_recommend_returns_breakdown(client):
    r = client.post(
        "/api/planner/recommend",
        json={
            "destination": "Mysuru",
            "start_location": "Bengaluru",
            "interests": ["History", "Heritage"],
            "categories": ["Monuments"],
            "budget": 15000,
            "travelers": 2,
            "duration_days": 2,
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    assert len(body["recommendations"]) > 0
    rec = body["recommendations"][0]
    assert "match_reason" in rec and rec["match_reason"]
    assert set(rec["score_breakdown"]) >= {"content", "quality", "budget", "distance"}


def test_itinerary_builds_days(client):
    r = client.post(
        "/api/planner/itinerary",
        json={
            "destination": "Mysuru",
            "start_location": "Bengaluru",
            "budget": 15000,
            "duration_days": 2,
            "place_ids": ["mysore-palace", "brindavan-gardens"],
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    assert len(body["days"]) >= 1
    day = body["days"][0]
    assert {"day", "theme", "places", "day_budget"} <= set(day.keys())
    assert len(day["places"]) >= 1
    assert day["places"][0]["place"]["id"] in {"mysore-palace", "brindavan-gardens"}


def test_recommend_requires_destination(client):
    r = client.post("/api/planner/recommend", json={"destination": ""})
    assert r.status_code == 422


# ------------------------------------------------------------------------ nearby
def test_nearby_services_rejects_bad_category(client):
    r = client.get(
        "/api/nearby/services",
        params={"lat": 12.97, "lng": 77.59, "category": "not-a-category"},
    )
    assert r.status_code == 400


# ------------------------------------------------------------------------ trips
def test_trips_crud_flow(client):
    signup(client)
    payload = {
        "title": "Mysuru Weekend",
        "start_location": "Bengaluru",
        "destination": "Mysuru",
        "stops": ["Channapatna"],
        "budget": 12000,
        "selected_places": [
            {
                "id": "mysore-palace",
                "name": "Mysore Palace",
                "city": "Mysuru",
                "lat": 12.3052,
                "lng": 76.6552,
                "category": "Monuments",
                "estimated_cost": 200,
            },
            {
                "id": "brindavan-gardens",
                "name": "Brindavan Gardens",
                "city": "KRS Dam",
                "lat": 12.4243,
                "lng": 76.5722,
                "category": "Gardens",
                "estimated_cost": 100,
            },
        ],
        "itinerary": {
            "days": [
                {"day": 1, "places": [{"place": {"id": "mysore-palace"}}]},
                {"day": 2, "places": [{"place": {"id": "brindavan-gardens"}}]},
            ]
        },
    }
    created = client.post("/api/trips/", json=payload)
    assert created.status_code == 201
    trip = created.json()["data"]
    assert trip["title"] == "Mysuru Weekend"
    assert len(trip["selected_places"]) == 2

    listed = client.get("/api/trips/")
    assert len(listed.json()["data"]) == 1

    fetched = client.get(f"/api/trips/{trip['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["data"]["destination"] == "Mysuru"

    payload["title"] = "Updated Title"
    updated = client.put(f"/api/trips/{trip['id']}", json=payload)
    assert updated.status_code == 200
    assert updated.json()["data"]["title"] == "Updated Title"

    deleted = client.delete(f"/api/trips/{trip['id']}")
    assert deleted.status_code == 200
    assert client.get("/api/trips/").json()["data"] == []


def test_cross_user_trip_access_is_forbidden(client):
    signup(client, email="owner@example.com")
    created = client.post(
        "/api/trips/",
        json={"title": "Secret", "destination": "Coorg"},
    )
    trip_id = created.json()["data"]["id"]
    client.post("/api/auth/logout")
    signup(client, email="intruder@example.com")
    assert client.get(f"/api/trips/{trip_id}").status_code == 404
    assert client.delete(f"/api/trips/{trip_id}").status_code == 404


# -------------------------------------------------------------------- favorites
def test_favorites_crud_flow(client):
    signup(client)
    added = client.post("/api/favorites/", json={"place_id": "mysore-palace"})
    assert added.status_code == 201
    assert added.json()["message"] == "Added to favorites"

    dup = client.post("/api/favorites/", json={"place_id": "mysore-palace"})
    assert dup.status_code == 201
    assert dup.json()["message"] == "Already favorited"

    listed = client.get("/api/favorites/")
    assert listed.status_code == 200
    data = listed.json()["data"]
    assert len(data) == 1
    assert data[0]["place"]["name"] == "Mysore Palace"

    removed = client.delete("/api/favorites/mysore-palace")
    assert removed.status_code == 200
    assert client.get("/api/favorites/").json()["data"] == []


def test_favorite_unknown_place_404(client):
    signup(client)
    r = client.post("/api/favorites/", json={"place_id": "not-a-real-place"})
    assert r.status_code == 404
