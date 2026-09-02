import uuid
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mine import Mine
from app.schemas.mine import MineCreate, MineUpdate

DEFAULT_LIMIT = 100


def get_mine(db: Session, mine_id: uuid.UUID) -> Optional[Mine]:
    return db.get(Mine, mine_id)


def get_mine_by_code(db: Session, code: str) -> Optional[Mine]:
    return db.scalar(select(Mine).where(Mine.code == code))


def get_mines(
    db: Session,
    *,
    skip: int = 0,
    limit: int = DEFAULT_LIMIT,
    status: Optional[str] = None,
    region: Optional[str] = None,
    mine_type: Optional[str] = None,
) -> Sequence[Mine]:
    stmt = select(Mine).order_by(Mine.created_at.desc())
    if status is not None:
        stmt = stmt.where(Mine.status == status)
    if region is not None:
        stmt = stmt.where(Mine.region == region)
    if mine_type is not None:
        stmt = stmt.where(Mine.mine_type == mine_type)
    return db.scalars(stmt.offset(skip).limit(limit)).all()


def create_mine(db: Session, payload: MineCreate) -> Mine:
    mine = Mine(**payload.model_dump())
    db.add(mine)
    db.commit()
    db.refresh(mine)
    return mine


def update_mine(
    db: Session, mine_id: uuid.UUID, payload: MineUpdate
) -> Optional[Mine]:
    mine = get_mine(db, mine_id)
    if mine is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(mine, field, value)
    db.commit()
    db.refresh(mine)
    return mine


def delete_mine(db: Session, mine_id: uuid.UUID) -> Optional[Mine]:
    mine = get_mine(db, mine_id)
    if mine is None:
        return None
    db.delete(mine)
    db.commit()
    return mine
