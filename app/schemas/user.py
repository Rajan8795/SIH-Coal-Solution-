from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class UserRegister(BaseModel):
    employee_id: str
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UserLogin(BaseModel):
    employee_id: str
    password: str
    mfa_code: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    employee_id: str
    email: EmailStr
    full_name: str
    role: UserRole
    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str