import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.services.alert import (
    create_alert,
    delete_alert,
    get_alert,
    get_alerts,
    update_alert,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[AlertResponse],
    summary="List alerts",
    description="Retrieve a paginated list of alerts, optionally filtered.",
)
def list_alerts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    mine: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_alerts(
        db,
        skip=skip,
        limit=limit,
        status=status,
        severity=severity,
        mine=mine,
    )


@router.post(
    "/",
    response_model=AlertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an alert",
    description="Register a new alert.",
)
def create_new_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    return create_alert(db, payload)


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
    summary="Get an alert by id",
    description="Retrieve a single alert using its UUID.",
)
def read_alert(alert_id: uuid.UUID, db: Session = Depends(get_db)):
    alert = get_alert(db, alert_id)
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with id '{alert_id}' not found",
        )
    return alert


@router.patch(
    "/{alert_id}",
    response_model=AlertResponse,
    summary="Update an alert",
    description="Partially update an existing alert.",
)
def update_existing_alert(
    alert_id: uuid.UUID,
    payload: AlertUpdate,
    db: Session = Depends(get_db),
):
    alert = update_alert(db, alert_id, payload)
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with id '{alert_id}' not found",
        )
    return alert


@router.delete(
    "/{alert_id}",
    response_model=AlertResponse,
    summary="Delete an alert",
    description="Delete an alert by its id.",
)
def delete_existing_alert(alert_id: uuid.UUID, db: Session = Depends(get_db)):
    alert = delete_alert(db, alert_id)
    if alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with id '{alert_id}' not found",
        )
    return alert
