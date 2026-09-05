"""
Recommendation engine, itinerary builder, and nearby services tests.
"""


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


def test_nearby_services_rejects_bad_category(client):
    r = client.get(
        "/api/nearby/services",
        params={"lat": 12.97, "lng": 77.59, "category": "not-a-category"},
    )
    assert r.status_code == 400
