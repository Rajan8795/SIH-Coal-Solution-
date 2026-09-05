from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from fastapi import Request

def log_action(db: Session, request: Request, action: str, status: str,
                user_id: int | None = None, resource_type: str = None,
                resource_id: str = None, details: dict = None):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
        status=status,
        details=details or {},
    )
    db.add(entry)
    db.commit()