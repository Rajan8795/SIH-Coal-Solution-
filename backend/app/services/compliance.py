import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.compliance import ComplianceRequirement
from app.schemas.compliance import ComplianceCreate, ComplianceUpdate

DEFAULT_LIMIT = 100


def get_compliance(
    db: Session, requirement_id: uuid.UUID
) -> Optional[ComplianceRequirement]:
    return db.get(ComplianceRequirement, requirement_id)


def get_compliance_by_code(
    db: Session, code: str
) -> Optional[ComplianceRequirement]:
    return db.scalar(select(ComplianceRequirement).where(ComplianceRequirement.code == code))


def get_compliance_requirements(
    db: Session,
    *,
    skip: int = 0,
    limit: int = DEFAULT_LIMIT,
    status: Optional[str] = None,
    category: Optional[str] = None,
    mine: Optional[str] = None,
) -> Sequence[ComplianceRequirement]:
    stmt = select(ComplianceRequirement).order_by(ComplianceRequirement.created_at.desc())
    if status is not None:
        stmt = stmt.where(ComplianceRequirement.status == status)
    if category is not None:
        stmt = stmt.where(ComplianceRequirement.category == category)
    if mine is not None:
        stmt = stmt.where(ComplianceRequirement.mine == mine)
    return db.scalars(stmt.offset(skip).limit(limit)).all()


def create_compliance(
    db: Session, payload: ComplianceCreate
) -> ComplianceRequirement:
    requirement = ComplianceRequirement(**payload.model_dump())
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement


def update_compliance(
    db: Session,
    requirement_id: uuid.UUID,
    payload: ComplianceUpdate,
) -> Optional[ComplianceRequirement]:
    requirement = get_compliance(db, requirement_id)
    if requirement is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(requirement, field, value)
    db.commit()
    db.refresh(requirement)
    return requirement


def delete_compliance(
    db: Session, requirement_id: uuid.UUID
) -> Optional[ComplianceRequirement]:
    requirement = get_compliance(db, requirement_id)
    if requirement is None:
        return None
    db.delete(requirement)
    db.commit()
    return requirement
