import uuid
from datetime import timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    WeakPasswordError,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    validate_password_strength,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.user import Token, TokenPayload, UserCreate, UserUpdate


def get_user(db: Session, user_id: uuid.UUID) -> Optional[User]:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.scalar(select(User).where(User.email == email))


def create_user(db: Session, payload: UserCreate) -> User:
    validate_password_strength(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: Session, user_id: uuid.UUID, payload: UserUpdate
) -> Optional[User]:
    user = get_user(db, user_id)
    if user is None:
        return None
    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def issue_tokens(user: User) -> Token:
    access_expires = timedelta(minutes=60)
    refresh_expires = timedelta(minutes=60 * 24 * 7)
    access_token = create_access_token(
        {"sub": str(user.id), "role": user.role.value},
        expires_delta=access_expires,
    )
    refresh_token = create_refresh_token(
        {"sub": str(user.id), "role": user.role.value},
        expires_delta=refresh_expires,
    )
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(access_expires.total_seconds()),
    )


def refresh_tokens(db: Session, refresh_token: str) -> Optional[Token]:
    payload = decode_token(refresh_token)
    if payload is None:
        return None
    user = get_user(db, uuid.UUID(payload.sub))
    if user is None or not user.is_active:
        return None
    return issue_tokens(user)
