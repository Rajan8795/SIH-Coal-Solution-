import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.mine import MineCreate, MineResponse, MineUpdate
from app.services.mine import (
    create_mine,
    delete_mine,
    get_mine,
    get_mine_by_code,
    get_mines,
    update_mine,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[MineResponse],
    summary="List mines",
    description="Retrieve a paginated list of mines.",
)
def list_mines(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    status: str | None = Query(default=None),
    region: str | None = Query(default=None),
    mine_type: str | None = Query(default=None, alias="mineType"),
    db: Session = Depends(get_db),
):
    return get_mines(
        db, skip=skip, limit=limit, status=status, region=region, mine_type=mine_type
    )


@router.post(
    "/",
    response_model=MineResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a mine",
    description="Register a new mine.",
)
def create_new_mine(payload: MineCreate, db: Session = Depends(get_db)):
    return create_mine(db, payload)


@router.get(
    "/by-code/{code}",
    response_model=MineResponse,
    summary="Get a mine by code",
    description="Retrieve a single mine using its unique code.",
)
def read_mine_by_code(code: str, db: Session = Depends(get_db)):
    mine = get_mine_by_code(db, code)
    if mine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mine with code '{code}' not found",
        )
    return mine


@router.get(
    "/{mine_id}",
    response_model=MineResponse,
    summary="Get a mine by id",
    description="Retrieve a single mine using its UUID.",
)
def read_mine(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    mine = get_mine(db, mine_id)
    if mine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mine with id '{mine_id}' not found",
        )
    return mine


@router.patch(
    "/{mine_id}",
    response_model=MineResponse,
    summary="Update a mine",
    description="Partially update an existing mine.",
)
def update_existing_mine(
    mine_id: uuid.UUID,
    payload: MineUpdate,
    db: Session = Depends(get_db),
):
    mine = update_mine(db, mine_id, payload)
    if mine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mine with id '{mine_id}' not found",
        )
    return mine


@router.delete(
    "/{mine_id}",
    response_model=MineResponse,
    summary="Delete a mine",
    description="Delete a mine by its id.",
)
def delete_existing_mine(mine_id: uuid.UUID, db: Session = Depends(get_db)):
    mine = delete_mine(db, mine_id)
    if mine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mine with id '{mine_id}' not found",
        )
    return mine
