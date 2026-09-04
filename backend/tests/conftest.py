import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.db.base import Base
import app.main as app_module
from app.models.alert import Alert
from app.models.compliance import ComplianceRequirement
from app.models.contractor import Contractor
from app.models.inspection import FieldInspection
from app.models.mine import Mine
from app.models.user import User, UserRole

_MODELS = [Mine, Alert, ComplianceRequirement, Contractor, FieldInspection, User]
_TABLES = [m.__table__ for m in _MODELS]

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_test_tables():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(autouse=True)
def _clean_database():
    yield
    session = TestingSessionLocal()
    try:
        for table in reversed(_TABLES):
            session.execute(delete(table))
        session.commit()
    finally:
        session.close()


@pytest.fixture()
def db():
    session = TestingSessionLocal()
    try:
        yield session
        session.rollback()
    finally:
        session.close()


@pytest.fixture()
def client(db):
    app = app_module.app

    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_client(db):
    from app.api.deps import get_current_user
    from app.models.user import User, UserRole

    user = User(
        id=uuid.uuid4(),
        name="Test Admin",
        email="admin@test.com",
        password_hash="fake",
        role=UserRole.ADMIN,
        is_active=True,
    )

    app = app_module.app

    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: user

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


VALID_UUID4 = "123e4567-e89b-12d3-a456-426614174000"
