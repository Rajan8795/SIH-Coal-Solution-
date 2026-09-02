import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inspection import FieldInspection
from app.schemas.inspection import InspectionCreate, InspectionUpdate

DEFAULT_LIMIT = 100


def get_inspection(
    db: Session, inspection_id: uuid.UUID
) -> Optional[FieldInspection]:
    return db.get(FieldInspection, inspection_id)


def get_inspections(
    db: Session,
    *,
    skip: int = 0,
    limit: int = DEFAULT_LIMIT,
    status: Optional[str] = None,
    sector: Optional[str] = None,
) -> Sequence[FieldInspection]:
    stmt = select(FieldInspection).order_by(FieldInspection.created_at.desc())
    if status is not None:
        stmt = stmt.where(FieldInspection.status == status)
    if sector is not None:
        stmt = stmt.where(FieldInspection.sector == sector)
    return db.scalars(stmt.offset(skip).limit(limit)).all()


def create_inspection(
    db: Session, payload: InspectionCreate
) -> FieldInspection:
    inspection = FieldInspection(**payload.model_dump())
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection


def update_inspection(
    db: Session,
    inspection_id: uuid.UUID,
    payload: InspectionUpdate,
) -> Optional[FieldInspection]:
    inspection = get_inspection(db, inspection_id)
    if inspection is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(inspection, field, value)
    db.commit()
    db.refresh(inspection)
    return inspection


def delete_inspection(
    db: Session, inspection_id: uuid.UUID
) -> Optional[FieldInspection]:
    inspection = get_inspection(db, inspection_id)
    if inspection is None:
        return None
    db.delete(inspection)
    db.commit()
    return inspection
