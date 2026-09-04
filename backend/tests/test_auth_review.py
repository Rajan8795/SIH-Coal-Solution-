import time
import uuid

import pytest
from fastapi.testclient import TestClient
from jose import jwt as jose_jwt

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import get_password_hash
from app.models.user import User, UserRole


def _seed_user(db, *, email: str, password: str, role: UserRole = UserRole.ADMIN) -> User:
    user = User(
        id=uuid.uuid4(),
        name="Auth Reviewer",
        email=email,
        password_hash=get_password_hash(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_register_accepts_valid_12plus_password(auth_client: TestClient):
    limiter.reset()
    response = auth_client.post(
        "/api/v1/auth/register",
        json={
            "name": "Strong User",
            "email": "strong@test.com",
            "password": "ValidPassword123!",
            "role": "INSPECTOR",
            "is_active": True,
        },
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["email"] == "strong@test.com"
    assert "password" not in body


def test_register_rejects_short_password(auth_client: TestClient):
    limiter.reset()
    response = auth_client.post(
        "/api/v1/auth/register",
        json={
            "name": "Weak User",
            "email": "weak@test.com",
            "password": "11charsXX",
            "role": "INSPECTOR",
            "is_active": True,
        },
    )
    assert response.status_code == 400, response.text
    assert "12" in response.json()["detail"]


def test_login_with_correct_credentials_returns_token(client: TestClient, db):
    _seed_user(db, email="reviewer@test.com", password="ValidPassword123!")
    limiter.reset()
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "reviewer@test.com", "password": "ValidPassword123!"},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["expires_in"] > 0


def test_login_with_incorrect_credentials_returns_401(client: TestClient, db):
    _seed_user(db, email="reviewer@test.com", password="ValidPassword123!")
    limiter.reset()
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "reviewer@test.com", "password": "WrongPassword456!"},
    )
    assert response.status_code == 401, response.text


def test_me_with_valid_token_returns_user(client: TestClient, db):
    user = _seed_user(db, email="reviewer@test.com", password="ValidPassword123!")
    limiter.reset()
    from datetime import datetime, timedelta, timezone
    expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    token = jose_jwt.encode(
        {"sub": str(user.id), "role": user.role.value, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["email"] == "reviewer@test.com"
    assert body["role"] == "ADMIN"


def test_me_with_invalid_token_returns_401(client: TestClient):
    limiter.reset()
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert response.status_code == 401, response.text


def test_me_without_token_returns_401(client: TestClient):
    limiter.reset()
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401, response.text


def test_refresh_token_flow_returns_new_token_pair(client: TestClient, db):
    user = _seed_user(db, email="refresh@test.com", password="ValidPassword123!")
    limiter.reset()
    from datetime import datetime, timedelta, timezone
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    refresh = jose_jwt.encode(
        {"sub": str(user.id), "role": user.role.value, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


def test_refresh_token_with_unknown_user_returns_401(client: TestClient):
    limiter.reset()
    from datetime import datetime, timedelta, timezone
    user_id = str(uuid.uuid4())
    token = jose_jwt.encode(
        {"sub": user_id, "role": UserRole.INSPECTOR.value,
         "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token},
    )
    assert response.status_code == 401, response.text


def test_login_rate_limit_5_per_minute_per_ip(client: TestClient):
    limiter.reset()
    statuses = []
    for _ in range(7):
        r = client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@test.com", "password": "whatever"},
        )
        statuses.append(r.status_code)
    assert 429 in statuses, f"Expected 429 after 5/min, got {statuses}"
    assert statuses.count(429) >= 1
