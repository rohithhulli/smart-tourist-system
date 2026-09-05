"""
Trip planning, CRUD, and access control tests.
"""
from conftest import signup_and_login


def test_trips_crud_flow(client):
    signup_and_login(client)
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
    signup_and_login(client, email="owner@example.com")
    created = client.post(
        "/api/trips/",
        json={"title": "Secret", "destination": "Coorg"},
    )
    trip_id = created.json()["data"]["id"]
    client.post("/api/auth/logout")
    signup_and_login(client, email="intruder@example.com")
    assert client.get(f"/api/trips/{trip_id}").status_code == 404
    assert client.delete(f"/api/trips/{trip_id}").status_code == 404
