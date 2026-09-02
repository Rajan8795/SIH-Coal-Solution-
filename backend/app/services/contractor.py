import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contractor import Contractor
from app.schemas.contractor import ContractorCreate, ContractorUpdate

DEFAULT_LIMIT = 100


def get_contractor(db: Session, contractor_id: uuid.UUID) -> Optional[Contractor]:
    return db.get(Contractor, contractor_id)


def get_contractors(
    db: Session,
    *,
    skip: int = 0,
    limit: int = DEFAULT_LIMIT,
    status: Optional[str] = None,
) -> Sequence[Contractor]:
    stmt = select(Contractor).order_by(Contractor.created_at.desc())
    if status is not None:
        stmt = stmt.where(Contractor.status == status)
    return db.scalars(stmt.offset(skip).limit(limit)).all()


def create_contractor(db: Session, payload: ContractorCreate) -> Contractor:
    contractor = Contractor(**payload.model_dump())
    db.add(contractor)
    db.commit()
    db.refresh(contractor)
    return contractor


def update_contractor(
    db: Session, contractor_id: uuid.UUID, payload: ContractorUpdate
) -> Optional[Contractor]:
    contractor = get_contractor(db, contractor_id)
    if contractor is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contractor, field, value)
    db.commit()
    db.refresh(contractor)
    return contractor


def delete_contractor(
    db: Session, contractor_id: uuid.UUID
) -> Optional[Contractor]:
    contractor = get_contractor(db, contractor_id)
    if contractor is None:
        return None
    db.delete(contractor)
    db.commit()
    return contractor
