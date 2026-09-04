from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role", String, ForeignKey("roles.name")),
    Column("permission_id", Integer, ForeignKey("permissions.id")),
)

class Role(Base):
    __tablename__ = "roles"
    name = Column(String, primary_key=True)
    permissions = relationship("Permission", secondary=role_permissions)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)   # e.g. "inspection:create"
    description = Column(String)