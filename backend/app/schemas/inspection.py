import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

InspectionStatus = Literal["Active", "Resolved", "Dismissed"]
InspectionSeverity = Literal["HIGH SEVERITY", "MEDIUM SEVERITY", "LOW SEVERITY"]


class InspectionAnalysis(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    title: str
    severity: InspectionSeverity
    description: str
    confidence_score: float = Field(alias="confidenceScore", ge=0, le=100)
    standard_ref: str = Field(alias="standardRef")


class InspectionBase(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    location: str
    sector: str
    gps_text: str = Field(alias="gpsText")
    time: str
    date: str
    image_url: str = Field(alias="imageUrl")
    notes: str
    status: InspectionStatus
    analysis: InspectionAnalysis


class InspectionCreate(InspectionBase):
    pass


class InspectionUpdate(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    location: Optional[str] = None
    sector: Optional[str] = None
    gps_text: Optional[str] = Field(default=None, alias="gpsText")
    time: Optional[str] = None
    date: Optional[str] = None
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    notes: Optional[str] = None
    status: Optional[InspectionStatus] = None
    analysis: Optional[InspectionAnalysis] = None


class InspectionResponse(InspectionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
