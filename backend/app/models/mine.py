import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Index, JSON, UUID, DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Mine(Base):
    __tablename__ = "mines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    location: Mapped[str] = mapped_column(String, nullable=False)
    region: Mapped[str] = mapped_column(String, nullable=False)
    mine_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    risk_score: Mapped[int] = mapped_column(default=0)
    primary_contractor: Mapped[str] = mapped_column(String, nullable=False)
    coordinates: Mapped[dict] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    risk_factors: Mapped[dict] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    ai_recommendation: Mapped[dict] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Active (At Risk)', 'Operational', 'Maintenance Required', 'Inspection Scheduled')",
            name="ck_mine_status",
        ),
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="ck_mine_risk_score"),
        Index("ix_mines_status", "status"),
        Index("ix_mines_region", "region"),
        Index("ix_mines_mine_type", "mine_type"),
    )
