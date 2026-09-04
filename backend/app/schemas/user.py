import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    email: EmailStr
    role: UserRole
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6)


class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    role: str
