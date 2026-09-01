import uuid

import pytest
from fastapi import status

from tests.factories import alert_payload

BASE = "/api/v1/alerts"


def create_alert(client, payload=None):
    return client.post(BASE + "/", json=payload or alert_payload())


def test_create_alert_returns_201_and_schema(client):
    response = create_alert(client)
    assert response.status_code == status.HTTP_201_CREATED
    body = response.json()
    for key in ("id", "title", "location", "mine", "time", "status", "severity",
                "deadline", "isAiPrediction", "probScore", "description", "assignedTo",
                "created_at", "updated_at"):
        assert key in body
    assert uuid.UUID(body["id"]).version == 4
    assert body["assignedTo"]["name"] == "J. Doe"
    assert body["isAiPrediction"] is True


def test_create_alert_invalid_severity_returns_422(client):
    response = create_alert(client, alert_payload(severity="Catastrophic"))
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_alert_missing_required_returns_422(client):
    payload = alert_payload()
    del payload["assignedTo"]
    response = create_alert(client, payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_list_alerts(client):
    create_alert(client, alert_payload(title="A1", mine="Blackwood North"))
    create_alert(client, alert_payload(title="A2", mine="Site Beta"))
    response = client.get(BASE + "/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 2


def test_list_alerts_filter_by_mine(client):
    create_alert(client, alert_payload(title="A1", mine="Blackwood North"))
    create_alert(client, alert_payload(title="A2", mine="Site Beta"))
    response = client.get(BASE + "/?mine=Blackwood%20North")
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert len(body) == 1
    assert body[0]["mine"] == "Blackwood North"


def test_list_alerts_filter_by_severity(client):
    create_alert(client, alert_payload(title="A1", severity="High"))
    create_alert(client, alert_payload(title="A2", severity="Critical"))
    response = client.get(BASE + "/?severity=High")
    assert len(response.json()) == 1
    assert response.json()[0]["severity"] == "High"


def test_list_alerts_pagination(client):
    for i in range(3):
        create_alert(client, alert_payload(title=f"A{i}", mine=f"Mine{i}"))
    assert len(client.get(f"{BASE}/?skip=0&limit=2").json()) == 2
    assert len(client.get(f"{BASE}/?skip=2&limit=1000").json()) == 1


def test_get_alert_by_id(client):
    created = create_alert(client).json()
    response = client.get(f"{BASE}/{created['id']}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == created["title"]


def test_get_alert_by_id_not_found_404(client):
    response = client.get(f"{BASE}/{uuid.uuid4()}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_alert_by_id_invalid_uuid_422(client):
    response = client.get(f"{BASE}/not-a-uuid")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_update_alert_partial(client):
    alert_id = create_alert(client).json()["id"]
    response = client.patch(f"{BASE}/{alert_id}", json={"status": "Investigating", "severity": "High"})
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["status"] == "Investigating"
    assert body["severity"] == "High"


def test_update_alert_not_found_404(client):
    response = client.patch(f"{BASE}/{uuid.uuid4()}", json={"status": "Resolved"})
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.parametrize("field", [
    "id", "title", "location", "mine", "time", "status", "severity",
    "deadline", "isAiPrediction", "probScore", "description", "assignedTo",
    "created_at", "updated_at",
])
def test_create_alert_response_contains_all_fields(client, field):
    assert field in create_alert(client).json()
