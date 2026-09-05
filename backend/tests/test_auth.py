"""
Authentication and user session tests.
"""
from conftest import signup


def test_signup_returns_user_without_session_cookie(client):
    r = signup(client)
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["name"] == "Test User"
    assert body["user"]["email"] == "tester@example.com"
    # Signup must NOT authenticate the user (no session cookie issued).
    assert not r.cookies.get("access_token")
    assert client.get("/api/auth/me").status_code == 401


def test_signup_accepts_full_name_field(client):
    r = client.post(
        "/api/auth/signup",
        json={
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "Strong@123",
        },
    )
    assert r.status_code == 201
    assert r.json()["user"]["name"] == "John Doe"


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
    assert me.json()["email"] == "tester@example.com"
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").status_code == 401


def test_profile_update_renames_user(client):
    signup(client)
    client.post(
        "/api/auth/login",
        json={"email": "tester@example.com", "password": "Strong@123"},
    )
    r = client.put("/api/auth/profile", json={"name": "Renamed", "email": "renamed@example.com"})
    assert r.status_code == 200
    user = r.json()
    assert user["name"] == "Renamed"
    assert user["email"] == "renamed@example.com"
    assert client.get("/api/auth/me").json()["name"] == "Renamed"


def test_authenticated_endpoints_require_session(client):
    assert client.get("/api/trips/").status_code == 401
    assert client.get("/api/favorites/").status_code == 401
