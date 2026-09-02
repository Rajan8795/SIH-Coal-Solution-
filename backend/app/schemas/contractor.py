import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

ContractorStatus = Literal["Compliant", "Flagged", "Review Required"]


class ContractorBase(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    name: str
    primary_site: str = Field(alias="primarySite")
    active_personnel: int = Field(alias="activePersonnel", ge=0)
    compliance_score: int = Field(alias="complianceScore", ge=0, le=100)
    expiring_certifications: int = Field(default=0, alias="expiringCertifications", ge=0)
    status: ContractorStatus
    msha_audit_date: str = Field(alias="mshaAuditDate")


class ContractorCreate(ContractorBase):
    pass


class ContractorUpdate(BaseModel):
    model_config = ConfigDict(validate_by_name=True, from_attributes=True)

    name: Optional[str] = None
    primary_site: Optional[str] = Field(default=None, alias="primarySite")
    active_personnel: Optional[int] = Field(default=None, alias="activePersonnel", ge=0)
    compliance_score: Optional[int] = Field(default=None, alias="complianceScore", ge=0, le=100)
    expiring_certifications: Optional[int] = Field(default=None, alias="expiringCertifications", ge=0)
    status: Optional[ContractorStatus] = None
    msha_audit_date: Optional[str] = Field(default=None, alias="mshaAuditDate")


class ContractorResponse(ContractorBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
