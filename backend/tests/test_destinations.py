"""
Tests for Destination endpoints and place content extensions.
"""


def test_list_destinations(client):
    r = client.get("/api/destinations/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["count"] >= 12
    slugs = [d["slug"] for d in data["data"]]
    assert "mysuru" in slugs
    assert "hampi" in slugs
    assert "gokarna" in slugs
    assert "coorg" in slugs

    sample = data["data"][0]
    required_fields = {"slug", "name", "short_description", "description", "category", "best_time", "places_count"}
    assert required_fields <= set(sample.keys())


def test_get_destination_by_slug(client):
    r = client.get("/api/destinations/hampi")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    dest = body["data"]
    assert dest["slug"] == "hampi"
    assert "Vijayanagara" in dest["description"] or "Vijayanagara" in dest["short_description"]
    assert dest["latitude"] is not None
    assert dest["longitude"] is not None
    assert dest["places_count"] > 0


def test_get_destination_places(client):
    r = client.get("/api/destinations/mysuru/places")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    assert body["destination_slug"] == "mysuru"
    places = body["data"]
    assert len(places) > 0
    names = [p["name"].lower() for p in places]
    assert any("mysore palace" in n for n in names)


def test_get_destination_events(client):
    r = client.get("/api/destinations/mysuru/events")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    events = body["data"]
    assert len(events) >= 1
    names = [e["name"].lower() for e in events]
    assert any("dasara" in n for n in names)


def test_get_destination_gallery(client):
    r = client.get("/api/destinations/hampi/gallery")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    gallery = body["data"]
    assert len(gallery) >= 1
    assert "image_url" in gallery[0]


def test_search_destinations(client):
    r = client.get("/api/destinations/search", params={"q": "coorg"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    assert any(d["slug"] == "coorg" for d in body["data"])


def test_unified_search(client):
    r = client.get("/api/destinations/unified-search", params={"q": "palace"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "success"
    data = body["data"]
    assert "destinations" in data
    assert "places" in data
    assert data["total_matches"] > 0


def test_get_destination_not_found(client):
    r = client.get("/api/destinations/atlantis-the-lost-city")
    assert r.status_code == 404


def test_get_place_by_slug_and_nearby(client):
    # Test lookup by id/slug
    r = client.get("/api/places/mysore_palace")
    assert r.status_code == 200
    place = r.json()["data"]
    assert place["name"] == "Mysore Palace"

    # Test nearby within 30km
    r_near = client.get("/api/places/mysore_palace/nearby", params={"radius": 30.0})
    assert r_near.status_code == 200
    body_near = r_near.json()
    assert body_near["status"] == "success"
    nearby = body_near["data"]
    assert len(nearby) > 0
    # Every nearby place must be within 30 km and not be mysore_palace
    for p in nearby:
        assert p["id"] != "mysore_palace"
        assert p["distance_km"] <= 30.0


def test_get_place_gallery_and_reviews(client):
    r_gal = client.get("/api/places/mysore_palace/gallery")
    assert r_gal.status_code == 200
    assert r_gal.json()["status"] == "success"

    r_rev = client.get("/api/places/mysore_palace/reviews")
    assert r_rev.status_code == 200
    assert r_rev.json()["status"] == "success"
    assert len(r_rev.json()["data"]) >= 1
