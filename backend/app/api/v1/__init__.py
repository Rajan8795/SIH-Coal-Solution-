from fastapi import APIRouter

from app.api.v1.alerts import router as alerts_router
from app.api.v1.auth import router as auth_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.contractors import router as contractors_router
from app.api.v1.inspections import router as inspections_router
from app.api.v1.mines import router as mines_router

api_router = APIRouter()

api_router.include_router(mines_router, prefix="/mines", tags=["mines"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
api_router.include_router(
    compliance_router, prefix="/compliance", tags=["compliance"]
)
api_router.include_router(
    contractors_router, prefix="/contractors", tags=["contractors"]
)
api_router.include_router(
    inspections_router, prefix="/inspections", tags=["inspections"]
)
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
