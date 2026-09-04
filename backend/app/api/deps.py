from typing import List, Optional

import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db import get_db
from app.models.user import User, UserRole
from app.services.auth import get_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

RoleName = str


def _role_names(roles: List[UserRole]) -> List[RoleName]:
    return [role.value for role in roles]


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user = get_user(db, user_id=uuid.UUID(payload.sub))
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_roles(allowed_roles: List[UserRole]):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in _role_names(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return checker
