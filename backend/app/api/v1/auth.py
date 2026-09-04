import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.core.security import WeakPasswordError
from app.db import get_db
from app.models.user import UserRole
from app.schemas.user import RefreshRequest, Token, UserCreate, UserLogin, UserResponse
from app.services.auth import authenticate_user, create_user, get_user_by_email, issue_tokens, refresh_tokens

router = APIRouter()


@router.post(
    "/login",
    response_model=Token,
    summary="Login",
    description="Authenticate with email and password to receive access and refresh tokens.",
)
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return issue_tokens(user)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh token",
    description="Exchange a valid refresh token for a new access token pair.",
)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    tokens = refresh_tokens(db, payload.refresh_token)
    if tokens is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return tokens


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current user",
    description="Return the authenticated user profile.",
)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register user",
    description="Create a new user. Restricted to ADMIN.",
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only ADMIN can register users",
        )
    existing = get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    try:
        return create_user(db, payload)
    except WeakPasswordError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

