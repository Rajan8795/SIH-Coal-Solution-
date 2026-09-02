import uuid

import pytest
from fastapi import status

from tests.factories import compliance_payload

BASE = "/api/v1/compliance"


def create_requirement(client, payload=None):
    return client.post(BASE + "/", json=payload or compliance_payload())


def test_create_compliance_returns_201_and_schema(client):
    response = create_requirement(client)
    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    for key in ("id", "code", "requirement", "mine", "category", "dueDate",
                "status", "riskLevel", "responsibleOfficer", "aiInsight",
                "created_at", "updated_at"):
        assert key in body
    assert uuid.UUID(body["id"]).version == 4
    assert body["aiInsight"]["delayProbability"] == 78


def test_create_compliance_invalid_category_returns_422(client):
    response = create_requirement(client, compliance_payload(category="Finance"))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_compliance_missing_required_returns_422(client):
    payload = compliance_payload()
    del payload["dueDate"]
    response = create_requirement(client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_compliance_duplicate_code_returns_409(client):
    create_requirement(client)
    response = create_requirement(client)
    assert response.status_code == status.HTTP_409_CONFLICT


def test_list_compliance(client):
    create_requirement(client, compliance_payload(code="C-1", mine="Blackwood North"))
    create_requirement(client, compliance_payload(code="C-2", mine="Site Beta"))
    response = client.get(BASE + "/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 2


def test_list_compliance_filter_by_category(client):
    create_requirement(client, compliance_payload(code="C-1", category="Safety"))
    create_requirement(client, compliance_payload(code="C-2", category="Environmental"))
    response = client.get(BASE + "/?category=Safety")
    body = response.json()
    assert len(body) == 1
    assert body[0]["category"] == "Safety"


def test_list_compliance_filter_by_mine(client):
    create_requirement(client, compliance_payload(code="C-1", mine="Blackwood North"))
    create_requirement(client, compliance_payload(code="C-2", mine="SilverCreek"))
    response = client.get(BASE + "/?mine=SilverCreek")
    assert len(response.json()) == 1
    assert response.json()[0]["mine"] == "SilverCreek"


def test_list_compliance_pagination(client):
    for i in range(3):
        create_requirement(client, compliance_payload(code=f"C-{i}", mine=f"M{i}"))
    assert len(client.get(f"{BASE}/?skip=0&limit=2").json()) == 2
    assert len(client.get(f"{BASE}/?skip=1&limit=1000").json()) == 2


def test_get_compliance_by_code(client):
    create_requirement(client, compliance_payload(code="REQ-XYZ"))
    response = client.get(f"{BASE}/by-code/REQ-XYZ")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["code"] == "REQ-XYZ"


def test_get_compliance_by_code_not_found_404(client):
    response = client.get(f"{BASE}/by-code/does-not-exist")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_compliance_by_id(client):
    created = create_requirement(client).json()
    response = client.get(f"{BASE}/{created['id']}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["code"] == created["code"]


def test_get_compliance_by_id_not_found_404(client):
    response = client.get(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_compliance_by_id_invalid_uuid_422(client):
    response = client.get(f"{BASE}/not-a-uuid")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_compliance_partial(client):
    req_id = create_requirement(client).json()["id"]
    response = client.patch(f"{BASE}/{req_id}", json={"riskLevel": "Medium", "status": "Pending"})
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["riskLevel"] == "Medium"
    assert body["status"] == "Pending"


def test_update_compliance_not_found_404(client):
    response = client.patch(f"{BASE}/{uuid.uuid4()}", json={"status": "Completed"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_compliance(client):
    req_id = create_requirement(client).json()["id"]
    response = client.delete(f"{BASE}/{req_id}")
    assert response.status_code == status.HTTP_200_OK
    assert client.get(f"{BASE}/{req_id}").status_code == status.HTTP_404_NOT_FOUND


def test_delete_compliance_not_found_404(client):
    response = client.delete(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("field", [
    "id", "code", "requirement", "mine", "category", "dueDate", "status",
    "riskLevel", "responsibleOfficer", "aiInsight", "created_at", "updated_at",
])
def test_create_compliance_response_contains_all_fields(client, field):
    assert field in create_requirement(client).json()
