from fastapi import status


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}


def test_health_check_in_docs(client):
    spec = client.get("/openapi.json").json()
    assert "/health" in spec["paths"]
    assert "get" in spec["paths"]["/health"]
