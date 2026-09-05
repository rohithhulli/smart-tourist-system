"""
Favorites CRUD tests.
"""
from conftest import signup_and_login


def test_favorites_crud_flow(client):
    signup_and_login(client)
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
    signup_and_login(client)
    r = client.post("/api/favorites/", json={"place_id": "not-a-real-place"})
    assert r.status_code == 404
