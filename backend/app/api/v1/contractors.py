import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.contractor import ContractorCreate, ContractorResponse, ContractorUpdate
from app.services.contractor import (
    create_contractor,
    delete_contractor,
    get_contractor,
    get_contractors,
    update_contractor,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[ContractorResponse],
    summary="List contractors",
    description="Retrieve a paginated list of contractors, optionally filtered by status.",
)
def list_contractors(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_contractors(db, skip=skip, limit=limit, status=status)


@router.post(
    "/",
    response_model=ContractorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a contractor",
    description="Register a new contractor.",
)
def create_new_contractor(
    payload: ContractorCreate, db: Session = Depends(get_db)
):
    return create_contractor(db, payload)


@router.get(
    "/{contractor_id}",
    response_model=ContractorResponse,
    summary="Get a contractor by id",
    description="Retrieve a single contractor using its UUID.",
)
def read_contractor(contractor_id: uuid.UUID, db: Session = Depends(get_db)):
    contractor = get_contractor(db, contractor_id)
    if contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with id '{contractor_id}' not found",
        )
    return contractor


@router.patch(
    "/{contractor_id}",
    response_model=ContractorResponse,
    summary="Update a contractor",
    description="Partially update an existing contractor.",
)
def update_existing_contractor(
    contractor_id: uuid.UUID,
    payload: ContractorUpdate,
    db: Session = Depends(get_db),
):
    contractor = update_contractor(db, contractor_id, payload)
    if contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with id '{contractor_id}' not found",
        )
    return contractor


@router.delete(
    "/{contractor_id}",
    response_model=ContractorResponse,
    summary="Delete a contractor",
    description="Delete a contractor by its id.",
)
def delete_existing_contractor(
    contractor_id: uuid.UUID, db: Session = Depends(get_db)
):
    contractor = delete_contractor(db, contractor_id)
    if contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with id '{contractor_id}' not found",
        )
    return contractor
