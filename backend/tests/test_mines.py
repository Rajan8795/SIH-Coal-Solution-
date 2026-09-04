import uuid

import pytest
from fastapi import status

from tests.factories import mine_payload

BASE = "/api/v1/mines"


def create_mine(auth_client, payload=None):
    return auth_client.post(BASE + "/", json=payload or mine_payload())


def test_create_mine_returns_201_and_schema(auth_client):
    response = create_mine(auth_client)
    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    for key in ("id", "name", "code", "location", "region", "mineType",
                "status", "riskScore", "primaryContractor", "coordinates",
                "riskFactors", "aiRecommendation", "created_at", "updated_at"):
        assert key in body
    assert uuid.UUID(body["id"]).version == 4
    assert body["mineType"] == "Underground Bituminous"
    assert body["coordinates"]["gpsText"] == "23.7466 N, 86.4154 E"


def test_create_mine_invalid_status_returns_422(auth_client):
    response = create_mine(auth_client, mine_payload(status="Bogus"))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_mine_missing_required_returns_422(auth_client):
    payload = mine_payload()
    del payload["code"]
    response = create_mine(auth_client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_mine_invalid_risk_score_returns_422(auth_client):
    response = create_mine(auth_client, mine_payload(riskScore=150))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_mine_duplicate_code_returns_409(auth_client):
    create_mine(auth_client)
    response = create_mine(auth_client)
    assert response.status_code == status.HTTP_409_CONFLICT


def test_list_mines(auth_client):
    create_mine(auth_client, mine_payload(code="M-1"))
    create_mine(auth_client, mine_payload(code="M-2", name="Second"))
    response = auth_client.get(BASE + "/")
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert isinstance(body, list)
    assert len(body) == 2


def test_list_mines_pagination(auth_client):
    for i in range(3):
        create_mine(auth_client, mine_payload(code=f"M-{i}", name=f"Mine {i}"))
    first = auth_client.get(BASE + "/?skip=0&limit=2").json()
    second = auth_client.get(BASE + "/?skip=1&limit=1000").json()
    assert len(first) == 2
    assert len(second) == 2


def test_list_mines_filter_by_status(auth_client):
    create_mine(auth_client, mine_payload(code="M-1", status="Operational"))
    create_mine(auth_client, mine_payload(code="M-2", status="Active (At Risk)"))
    response = auth_client.get(BASE + "/?status=Operational")
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert len(body) == 1
    assert body[0]["status"] == "Operational"


def test_get_mine_by_id(auth_client):
    created = create_mine(auth_client).json()
    mine_id = created["id"]
    response = auth_client.get(f"{BASE}/{mine_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["code"] == created["code"]


def test_get_mine_by_code(auth_client):
    create_mine(auth_client, mine_payload(code="CODE-123"))
    response = auth_client.get(f"{BASE}/by-code/CODE-123")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["code"] == "CODE-123"


def test_get_mine_by_id_not_found_404(auth_client):
    missing = str(uuid.uuid4())
    response = auth_client.get(f"{BASE}/{missing}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_mine_by_code_not_found_404(auth_client):
    response = auth_client.get(f"{BASE}/by-code/does-not-exist")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_mine_by_id_invalid_uuid_422(auth_client):
    response = auth_client.get(f"{BASE}/not-a-uuid")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_mine_partial(auth_client):
    mine_id = create_mine(auth_client).json()["id"]
    response = auth_client.patch(f"{BASE}/{mine_id}", json={"riskScore": 50, "status": "Operational"})
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["riskScore"] == 50
    assert body["status"] == "Operational"
    assert body["code"] == "MINE-ALPHA"
    refreshed = auth_client.get(f"{BASE}/{mine_id}").json()
    assert refreshed["riskScore"] == 50


def test_update_mine_not_found_404(auth_client):
    response = auth_client.patch(f"{BASE}/{uuid.uuid4()}", json={"riskScore": 10})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_mine_invalid_status_returns_422(auth_client):
    mine_id = create_mine(auth_client).json()["id"]
    response = auth_client.patch(f"{BASE}/{mine_id}", json={"status": "Unknown"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_delete_mine(auth_client):
    mine_id = create_mine(auth_client).json()["id"]
    response = auth_client.delete(f"{BASE}/{mine_id}")
    assert response.status_code == status.HTTP_200_OK
    assert auth_client.get(f"{BASE}/{mine_id}").status_code == status.HTTP_404_NOT_FOUND


def test_delete_mine_not_found_404(auth_client):
    response = auth_client.delete(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("field", [
    "name", "code", "location", "region", "mineType", "status",
    "riskScore", "primaryContractor", "coordinates", "riskFactors", "aiRecommendation",
])
def test_create_mine_response_contains_all_fields(auth_client, field):
    body = create_mine(auth_client).json()
    assert field in body
