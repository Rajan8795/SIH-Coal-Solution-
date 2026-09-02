import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.inspection import (
    InspectionCreate,
    InspectionResponse,
    InspectionUpdate,
)
from app.services.inspection import (
    create_inspection,
    delete_inspection,
    get_inspection,
    get_inspections,
    update_inspection,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[InspectionResponse],
    summary="List inspections",
    description="Retrieve a paginated list of field inspections, optionally filtered.",
)
def list_inspections(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: str | None = Query(default=None),
    sector: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_inspections(
        db, skip=skip, limit=limit, status=status, sector=sector
    )


@router.post(
    "/",
    response_model=InspectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an inspection",
    description="Register a new field inspection.",
)
def create_new_inspection(
    payload: InspectionCreate, db: Session = Depends(get_db)
):
    return create_inspection(db, payload)


@router.get(
    "/{inspection_id}",
    response_model=InspectionResponse,
    summary="Get an inspection by id",
    description="Retrieve a single field inspection using its UUID.",
)
def read_inspection(inspection_id: uuid.UUID, db: Session = Depends(get_db)):
    inspection = get_inspection(db, inspection_id)
    if inspection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id '{inspection_id}' not found",
        )
    return inspection


@router.patch(
    "/{inspection_id}",
    response_model=InspectionResponse,
    summary="Update an inspection",
    description="Partially update an existing field inspection.",
)
def update_existing_inspection(
    inspection_id: uuid.UUID,
    payload: InspectionUpdate,
    db: Session = Depends(get_db),
):
    inspection = update_inspection(db, inspection_id, payload)
    if inspection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id '{inspection_id}' not found",
        )
    return inspection


@router.delete(
    "/{inspection_id}",
    response_model=InspectionResponse,
    summary="Delete an inspection",
    description="Delete a field inspection by its id.",
)
def delete_existing_inspection(
    inspection_id: uuid.UUID, db: Session = Depends(get_db)
):
    inspection = delete_inspection(db, inspection_id)
    if inspection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with id '{inspection_id}' not found",
        )
    return inspection
