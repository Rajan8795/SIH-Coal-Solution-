import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertUpdate

DEFAULT_LIMIT = 100


def get_alert(db: Session, alert_id: uuid.UUID) -> Optional[Alert]:
    return db.get(Alert, alert_id)


def get_alerts(
    db: Session,
    *,
    skip: int = 0,
    limit: int = DEFAULT_LIMIT,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    mine: Optional[str] = None,
) -> Sequence[Alert]:
    stmt = select(Alert).order_by(Alert.created_at.desc())
    if status is not None:
        stmt = stmt.where(Alert.status == status)
    if severity is not None:
        stmt = stmt.where(Alert.severity == severity)
    if mine is not None:
        stmt = stmt.where(Alert.mine == mine)
    return db.scalars(stmt.offset(skip).limit(limit)).all()


def create_alert(db: Session, payload: AlertCreate) -> Alert:
    alert = Alert(**payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def update_alert(
    db: Session, alert_id: uuid.UUID, payload: AlertUpdate
) -> Optional[Alert]:
    alert = get_alert(db, alert_id)
    if alert is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


def delete_alert(db: Session, alert_id: uuid.UUID) -> Optional[Alert]:
    alert = get_alert(db, alert_id)
    if alert is None:
        return None
    db.delete(alert)
    db.commit()
    return alert
