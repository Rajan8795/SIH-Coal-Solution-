import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import OfficerRef

AlertStatus = Literal["Unacknowledged", "Investigating", "Resolved", "In Progress"]
AlertSeverity = Literal["Critical", "High", "Medium", "Resolved"]


class AlertBase(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    title: str
    location: str
    mine: str
    time: str
    status: AlertStatus
    severity: AlertSeverity
    deadline: str
    is_ai_prediction: bool = Field(default=False, alias="isAiPrediction")
    prob_score: Optional[str] = Field(default=None, alias="probScore")
    description: Optional[str] = None
    assigned_to: OfficerRef = Field(alias="assignedTo")


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    title: Optional[str] = None
    location: Optional[str] = None
    mine: Optional[str] = None
    time: Optional[str] = None
    status: Optional[AlertStatus] = None
    severity: Optional[AlertSeverity] = None
    deadline: Optional[str] = None
    is_ai_prediction: Optional[bool] = Field(default=None, alias="isAiPrediction")
    prob_score: Optional[str] = Field(default=None, alias="probScore")
    description: Optional[str] = None
    assigned_to: Optional[OfficerRef] = Field(default=None, alias="assignedTo")


class AlertResponse(AlertBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
