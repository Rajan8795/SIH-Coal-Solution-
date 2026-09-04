from fastapi import APIRouter, Depends, Request
from app.core.limiter import limiter
from app.core.deps import require_permission, get_current_user
from app.models.user import User

router = APIRouter(prefix="/inspections", tags=["inspections"])

@router.post("/")
@limiter.limit("20/minute")
def create_inspection(
    request: Request,
    current_user: User = Depends(require_permission("inspection:create")),
):
    return {"message": f"Inspection created by {current_user.email}"}

@router.get("/")
@limiter.limit("100/minute")
def list_inspections(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    return {"data": "inspections list"}