import uuid

import pytest
from fastapi import status

from tests.factories import inspection_payload

BASE = "/api/v1/inspections"


def create_inspection(client, payload=None):
    return client.post(BASE + "/", json=payload or inspection_payload())


def test_create_inspection_returns_201_and_schema(client):
    response = create_inspection(client)
    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    for key in ("id", "location", "sector", "gpsText", "time", "date", "imageUrl",
                "notes", "status", "analysis", "created_at", "updated_at"):
        assert key in body
    assert uuid.UUID(body["id"]).version == 4
    assert body["analysis"]["severity"] == "HIGH SEVERITY"
    assert body["analysis"]["confidenceScore"] == 94


def test_create_inspection_invalid_status_returns_422(client):
    response = create_inspection(client, inspection_payload(status="Cancelled"))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_inspection_invalid_analysis_severity_returns_422(client):
    payload = inspection_payload()
    payload["analysis"]["severity"] = "HIGH"
    response = create_inspection(client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_inspection_missing_required_returns_422(client):
    payload = inspection_payload()
    del payload["sector"]
    response = create_inspection(client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_list_inspections(client):
    create_inspection(client, inspection_payload(location="L1", sector="Sector 4"))
    create_inspection(client, inspection_payload(location="L2", sector="Sector 7"))
    assert len(client.get(BASE + "/").json()) == 2


def test_list_inspections_filter_by_sector(client):
    create_inspection(client, inspection_payload(sector="Sector 4"))
    create_inspection(client, inspection_payload(sector="Sector 7"))
    body = client.get(BASE + "/?sector=Sector%207").json()
    assert len(body) == 1
    assert body[0]["sector"] == "Sector 7"


def test_list_inspections_filter_by_status(client):
    create_inspection(client, inspection_payload(location="L1", status="Active"))
    create_inspection(client, inspection_payload(location="L2", status="Dismissed"))
    assert len(client.get(BASE + "/?status=Dismissed").json()) == 1


def test_list_inspections_pagination(client):
    for i in range(3):
        create_inspection(client, inspection_payload(location=f"L{i}", date=f"D{i}"))
    assert len(client.get(f"{BASE}/?skip=0&limit=2").json()) == 2
    assert len(client.get(f"{BASE}/?skip=1&limit=1000").json()) == 2


def test_get_inspection_by_id(client):
    created = create_inspection(client).json()
    response = client.get(f"{BASE}/{created['id']}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["location"] == created["location"]


def test_get_inspection_by_id_not_found_404(client):
    response = client.get(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_inspection_by_id_invalid_uuid_422(client):
    response = client.get(f"{BASE}/not-a-uuid")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_inspection_partial(client):
    insp_id = create_inspection(client).json()["id"]
    response = client.patch(f"{BASE}/{insp_id}", json={"status": "Resolved", "notes": "updated"})
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["status"] == "Resolved"
    assert body["notes"] == "updated"


def test_update_inspection_not_found_404(client):
    response = client.patch(f"{BASE}/{uuid.uuid4()}", json={"status": "Resolved"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_inspection(client):
    insp_id = create_inspection(client).json()["id"]
    response = client.delete(f"{BASE}/{insp_id}")
    assert response.status_code == status.HTTP_200_OK
    assert client.get(f"{BASE}/{insp_id}").status_code == status.HTTP_404_NOT_FOUND


def test_delete_inspection_not_found_404(client):
    response = client.delete(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("field", [
    "id", "location", "sector", "gpsText", "time", "date", "imageUrl",
    "notes", "status", "analysis", "created_at", "updated_at",
])
def test_create_inspection_response_contains_all_fields(client, field):
    assert field in create_inspection(client).json()
