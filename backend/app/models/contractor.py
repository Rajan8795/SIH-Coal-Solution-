import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from sqlalchemy import UUID


class Contractor(Base):
    __tablename__ = "contractors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    primary_site: Mapped[str] = mapped_column(String, nullable=False)
    active_personnel: Mapped[int] = mapped_column(Integer, nullable=False)
    compliance_score: Mapped[int] = mapped_column(Integer, nullable=False)
    expiring_certifications: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    status: Mapped[str] = mapped_column(String, nullable=False)
    msha_audit_date: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Compliant', 'Flagged', 'Review Required')",
            name="ck_contractor_status",
        ),
        CheckConstraint("compliance_score >= 0 AND compliance_score <= 100", name="ck_contractor_compliance_score"),
        CheckConstraint("active_personnel >= 0", name="ck_contractor_active_personnel"),
        CheckConstraint("expiring_certifications >= 0", name="ck_contractor_expiring_certifications"),
        Index("ix_contractors_status", "status"),
    )
