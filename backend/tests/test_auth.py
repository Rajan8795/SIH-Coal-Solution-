import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.services.auth import create_user
from app.core.security import WeakPasswordError


def _payload(**overrides) -> UserCreate:
    data = {
        "name": "New User",
        "email": "newuser@test.com",
        "password": "StrongPass123!abc",
        "role": UserRole.INSPECTOR,
        "is_active": True,
    }
    data.update(overrides)
    return UserCreate(**data)


def test_create_user_accepts_strong_password(db: Session):
    user = create_user(db, _payload())
    assert user.id is not None
    assert user.email == "newuser@test.com"
    assert user.password_hash and user.password_hash != "StrongPass123!abc"


def test_create_user_rejects_weak_password(db: Session):
    with pytest.raises(WeakPasswordError):
        create_user(db, _payload(password="11charsXXx"))
    with pytest.raises(WeakPasswordError):
        create_user(db, _payload(password="exactly11c"))


def test_register_endpoint_rejects_weak_password(auth_client: TestClient):
    response = auth_client.post(
        "/api/v1/auth/register",
        json={
            "name": "Weak User",
            "email": "weak@test.com",
            "password": "tooshort1",
            "role": "INSPECTOR",
            "is_active": True,
        },
    )
    assert response.status_code == 400
    body = response.json()
    assert "12" in body["detail"]


def test_register_endpoint_accepts_strong_password(auth_client: TestClient):
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
    assert "id" in body
    assert "password" not in body
