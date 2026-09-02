import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.compliance import (
    ComplianceCreate,
    ComplianceResponse,
    ComplianceUpdate,
)
from app.services.compliance import (
    create_compliance,
    delete_compliance,
    get_compliance,
    get_compliance_by_code,
    get_compliance_requirements,
    update_compliance,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[ComplianceResponse],
    summary="List compliance requirements",
    description="Retrieve a paginated list of compliance requirements, optionally filtered.",
)
def list_compliance(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    mine: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_compliance_requirements(
        db,
        skip=skip,
        limit=limit,
        status=status,
        category=category,
        mine=mine,
    )


@router.post(
    "/",
    response_model=ComplianceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a compliance requirement",
    description="Register a new compliance requirement.",
)
def create_new_compliance(
    payload: ComplianceCreate, db: Session = Depends(get_db)
):
    return create_compliance(db, payload)


@router.get(
    "/by-code/{code}",
    response_model=ComplianceResponse,
    summary="Get a compliance requirement by code",
    description="Retrieve a single compliance requirement using its unique code.",
)
def read_compliance_by_code(code: str, db: Session = Depends(get_db)):
    requirement = get_compliance_by_code(db, code)
    if requirement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance requirement with code '{code}' not found",
        )
    return requirement


@router.get(
    "/{requirement_id}",
    response_model=ComplianceResponse,
    summary="Get a compliance requirement by id",
    description="Retrieve a single compliance requirement using its UUID.",
)
def read_compliance(requirement_id: uuid.UUID, db: Session = Depends(get_db)):
    requirement = get_compliance(db, requirement_id)
    if requirement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance requirement with id '{requirement_id}' not found",
        )
    return requirement


@router.patch(
    "/{requirement_id}",
    response_model=ComplianceResponse,
    summary="Update a compliance requirement",
    description="Partially update an existing compliance requirement.",
)
def update_existing_compliance(
    requirement_id: uuid.UUID,
    payload: ComplianceUpdate,
    db: Session = Depends(get_db),
):
    requirement = update_compliance(db, requirement_id, payload)
    if requirement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance requirement with id '{requirement_id}' not found",
        )
    return requirement


@router.delete(
    "/{requirement_id}",
    response_model=ComplianceResponse,
    summary="Delete a compliance requirement",
    description="Delete a compliance requirement by its id.",
)
def delete_existing_compliance(
    requirement_id: uuid.UUID, db: Session = Depends(get_db)
):
    requirement = delete_compliance(db, requirement_id)
    if requirement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance requirement with id '{requirement_id}' not found",
        )
    return requirement
