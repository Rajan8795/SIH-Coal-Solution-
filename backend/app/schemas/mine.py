import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

MineStatus = Literal[
    "Active (At Risk)",
    "Operational",
    "Maintenance Required",
    "Inspection Scheduled",
]


class MineCoordinates(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    lat: float
    lng: float
    gps_text: str = Field(alias="gpsText")


class MineRiskFactors(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    safety_violations: int = Field(alias="safetyViolations")
    overdue_actions: int = Field(alias="overdueActions")
    contractor_issues: int = Field(alias="contractorIssues")
    env_renewals: int = Field(alias="envRenewals")


class MineAIRecommendation(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    headline: str
    description: str
    action_label: str = Field(alias="actionLabel")
    probability: float = Field(ge=0, le=100)


class MineBase(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    name: str
    code: str
    location: str
    region: str
    mine_type: str = Field(alias="mineType")
    status: MineStatus
    risk_score: int = Field(default=0, ge=0, le=100, alias="riskScore")
    primary_contractor: str = Field(alias="primaryContractor")
    coordinates: MineCoordinates
    risk_factors: MineRiskFactors = Field(alias="riskFactors")
    ai_recommendation: MineAIRecommendation = Field(alias="aiRecommendation")


class MineCreate(MineBase):
    pass


class MineUpdate(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    name: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    region: Optional[str] = None
    mine_type: Optional[str] = Field(default=None, alias="mineType")
    status: Optional[MineStatus] = None
    risk_score: Optional[int] = Field(default=None, ge=0, le=100, alias="riskScore")
    primary_contractor: Optional[str] = Field(default=None, alias="primaryContractor")
    coordinates: Optional[MineCoordinates] = None
    risk_factors: Optional[MineRiskFactors] = None
    ai_recommendation: Optional[MineAIRecommendation] = None


class MineResponse(MineBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
