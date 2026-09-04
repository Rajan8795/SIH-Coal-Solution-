import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, JSON, UUID, DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    requirement: Mapped[str] = mapped_column(String, nullable=False)
    mine: Mapped[str] = mapped_column(String, nullable=False)
    mine_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mines.id", ondelete="SET NULL"), nullable=True
    )
    category: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    risk_level: Mapped[str] = mapped_column(String, nullable=False)
    responsible_officer: Mapped[dict] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    ai_insight: Mapped[dict | None] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Overdue', 'Pending', 'Completed')",
            name="ck_compliance_status",
        ),
        CheckConstraint(
            "risk_level IN ('High', 'Medium', 'Low')",
            name="ck_compliance_risk_level",
        ),
        CheckConstraint(
            "category IN ('Safety', 'Environmental', 'Equipment', 'Ventilation')",
            name="ck_compliance_category",
        ),
        Index("ix_compliance_mine", "mine"),
        Index("ix_compliance_status", "status"),
        Index("ix_compliance_category", "category"),
    )
