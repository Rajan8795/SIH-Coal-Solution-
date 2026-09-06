import re
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt", "argon2"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})
    secret = getattr(settings, "SECRET_KEY", "coalguard_super_secret_jwt_key_2026")
    algorithm = getattr(settings, "ALGORITHM", "HS256")
    return jwt.encode(to_encode, secret, algorithm=algorithm)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire_days = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
    expire = datetime.now(timezone.utc) + timedelta(days=expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    secret = getattr(settings, "SECRET_KEY", "coalguard_super_secret_jwt_key_2026")
    algorithm = getattr(settings, "ALGORITHM", "HS256")
    return jwt.encode(to_encode, secret, algorithm=algorithm)

def decode_token(token: str) -> dict | None:
    try:
        secret = getattr(settings, "SECRET_KEY", "coalguard_super_secret_jwt_key_2026")
        algorithm = getattr(settings, "ALGORITHM", "HS256")
        return jwt.decode(token, secret, algorithms=[algorithm])
    except JWTError:
        return None

def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 12:
        return False, "Password must be at least 12 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Must contain an uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Must contain a lowercase letter"
    if not re.search(r"\d", password):
        return False, "Must contain a digit"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Must contain a special character"
    return True, "OK"
