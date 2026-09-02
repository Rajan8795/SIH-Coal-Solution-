from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.schemas.common import OfficerRef
from app.schemas.compliance import (
    AIInsight,
    ComplianceCreate,
    ComplianceResponse,
    ComplianceUpdate,
)
from app.schemas.contractor import ContractorCreate, ContractorResponse, ContractorUpdate
from app.schemas.inspection import (
    InspectionAnalysis,
    InspectionCreate,
    InspectionResponse,
    InspectionUpdate,
)
from app.schemas.mine import (
    MineAIRecommendation,
    MineBase,
    MineCoordinates,
    MineCreate,
    MineResponse,
    MineRiskFactors,
    MineUpdate,
)

__all__ = [
    "OfficerRef",
    "MineCoordinates",
    "MineRiskFactors",
    "MineAIRecommendation",
    "MineBase",
    "MineCreate",
    "MineUpdate",
    "MineResponse",
    "AlertCreate",
    "AlertUpdate",
    "AlertResponse",
    "AIInsight",
    "ComplianceCreate",
    "ComplianceUpdate",
    "ComplianceResponse",
    "ContractorCreate",
    "ContractorUpdate",
    "ContractorResponse",
    "InspectionAnalysis",
    "InspectionCreate",
    "InspectionUpdate",
    "InspectionResponse",
]
