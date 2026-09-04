import uuid

import pytest
from fastapi import status

from tests.factories import contractor_payload

BASE = "/api/v1/contractors"


def create_contractor(client, payload=None):
    return client.post(BASE + "/", json=payload or contractor_payload())


def test_create_contractor_returns_201_and_schema(client):
    response = create_contractor(client)
    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    for key in ("id", "name", "primarySite", "activePersonnel", "complianceScore",
                "expiringCertifications", "status", "lastAuditDate",
                "created_at", "updated_at"):
        assert key in body
    assert uuid.UUID(body["id"]).version == 4
    assert body["activePersonnel"] == 142


def test_create_contractor_invalid_status_returns_422(client):
    response = create_contractor(client, contractor_payload(status="Unknown"))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_contractor_missing_required_returns_422(client):
    payload = contractor_payload()
    del payload["name"]
    response = create_contractor(client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_contractor_negative_personnel_returns_422(client):
    response = create_contractor(client, contractor_payload(activePersonnel=-5))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_list_contractors(client):
    create_contractor(client, contractor_payload(name="A"))
    create_contractor(client, contractor_payload(name="B", primarySite="Site B"))
    assert len(client.get(BASE + "/").json()) == 2


def test_list_contractors_filter_by_status(client):
    create_contractor(client, contractor_payload(name="A", status="Compliant"))
    create_contractor(client, contractor_payload(name="B", status="Flagged"))
    body = client.get(BASE + "/?status=Compliant").json()
    assert len(body) == 1
    assert body[0]["status"] == "Compliant"


def test_list_contractors_pagination(client):
    for i in range(3):
        create_contractor(client, contractor_payload(name=f"C{i}", lastAuditDate=f"2023-0{i}-01"))
    assert len(client.get(f"{BASE}/?skip=0&limit=2").json()) == 2
    assert len(client.get(f"{BASE}/?skip=2&limit=1000").json()) == 1


def test_get_contractor_by_id(client):
    created = create_contractor(client).json()
    response = client.get(f"{BASE}/{created['id']}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == created["name"]


def test_get_contractor_by_id_not_found_404(client):
    response = client.get(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_contractor_by_id_invalid_uuid_422(client):
    response = client.get(f"{BASE}/not-a-uuid")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_contractor_partial(client):
    c_id = create_contractor(client).json()["id"]
    response = client.patch(f"{BASE}/{c_id}", json={"complianceScore": 90, "status": "Compliant"})
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["complianceScore"] == 90
    assert body["status"] == "Compliant"


def test_update_contractor_not_found_404(client):
    response = client.patch(f"{BASE}/{uuid.uuid4()}", json={"status": "Compliant"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_contractor(client):
    c_id = create_contractor(client).json()["id"]
    response = client.delete(f"{BASE}/{c_id}")
    assert response.status_code == status.HTTP_200_OK
    assert client.get(f"{BASE}/{c_id}").status_code == status.HTTP_404_NOT_FOUND


def test_delete_contractor_not_found_404(client):
    response = client.delete(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("field", [
    "id", "name", "primarySite", "activePersonnel", "complianceScore",
    "expiringCertifications", "status", "lastAuditDate", "created_at", "updated_at",
])
def test_create_contractor_response_contains_all_fields(client, field):
    assert field in create_contractor(client).json()
