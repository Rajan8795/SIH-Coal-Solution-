import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import OfficerRef

ComplianceCategory = Literal["Safety", "Environmental", "Equipment", "Ventilation"]
ComplianceStatus = Literal["Overdue", "Pending", "Completed"]
ComplianceRiskLevel = Literal["High", "Medium", "Low"]


class AIInsight(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    type: str
    text: str
    delay_probability: Optional[float] = Field(default=None, alias="delayProbability", ge=0, le=100)


class ComplianceBase(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    code: str
    requirement: str
    mine: str
    category: ComplianceCategory
    due_date: str = Field(alias="dueDate")
    status: ComplianceStatus
    risk_level: ComplianceRiskLevel = Field(alias="riskLevel")
    responsible_officer: OfficerRef = Field(alias="responsibleOfficer")
    ai_insight: Optional[AIInsight] = Field(default=None, alias="aiInsight")


class ComplianceCreate(ComplianceBase):
    pass


class ComplianceUpdate(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    code: Optional[str] = None
    requirement: Optional[str] = None
    mine: Optional[str] = None
    category: Optional[ComplianceCategory] = None
    due_date: Optional[str] = Field(default=None, alias="dueDate")
    status: Optional[ComplianceStatus] = None
    risk_level: Optional[ComplianceRiskLevel] = Field(default=None, alias="riskLevel")
    responsible_officer: Optional[OfficerRef] = Field(default=None, alias="responsibleOfficer")
    ai_insight: Optional[AIInsight] = Field(default=None, alias="aiInsight")


class ComplianceResponse(ComplianceBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
