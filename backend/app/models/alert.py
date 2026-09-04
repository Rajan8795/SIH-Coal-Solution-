import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, JSON, UUID, Boolean, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    mine: Mapped[str] = mapped_column(String, nullable=False)
    mine_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mines.id", ondelete="SET NULL"), nullable=True
    )
    time: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    deadline: Mapped[str] = mapped_column(String, nullable=False)
    is_ai_prediction: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    prob_score: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[dict] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Unacknowledged', 'Investigating', 'Resolved', 'In Progress')",
            name="ck_alert_status",
        ),
        CheckConstraint(
            "severity IN ('Critical', 'High', 'Medium', 'Resolved')",
            name="ck_alert_severity",
        ),
        Index("ix_alerts_mine", "mine"),
        Index("ix_alerts_status", "status"),
        Index("ix_alerts_severity", "severity"),
    )
