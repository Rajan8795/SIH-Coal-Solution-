from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MINE_OFFICIAL = "mine_official"
    INSPECTOR = "inspector"
    CONTRACTOR = "contractor"

class User(Base):
    __tablename__ = "users"

    employee_id = Column(String, unique=True, nullable=False, index=True)

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mfa_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False)