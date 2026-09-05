"""
Tourist places catalog and search tests.
"""


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


def test_meta_stats_counts(client):
    r = client.get("/api/meta/stats")
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total_places"] == 99
    assert data["total_cities"] >= 49
    assert data["avg_rating"] is not None
