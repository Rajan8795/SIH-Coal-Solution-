from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from app.schemas.user import TokenPayload

MIN_PASSWORD_LENGTH = 12
_BCRYPT_MAX_BYTES = 72


class WeakPasswordError(ValueError):
    pass


def validate_password_strength(password: str) -> None:
    if not isinstance(password, str) or len(password) < MIN_PASSWORD_LENGTH:
        raise WeakPasswordError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
        )


def _to_bcrypt_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(_to_bcrypt_bytes(password), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            _to_bcrypt_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> TokenPayload | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except JWTError:
        return None
