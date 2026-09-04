from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import IntegrityError

from app.api.routes.health import router as health_router
from app.api.v1 import api_router
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.services.auth import create_user, get_user_by_email


def seed_admin() -> None:
    db = SessionLocal()
    try:
        existing = get_user_by_email(db, "admin@coalgard.local")
        if existing is not None:
            return
        create_user(
            db,
            __import__("app.schemas.user", fromlist=["UserCreate"]).UserCreate(
                name="Admin",
                email="admin@coalgard.local",
                password="admin123",
                role=UserRole.ADMIN,
            ),
        )
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        openapi_tags=[
            {"name": "health", "description": "Service health checks"},
            {"name": "auth", "description": "Authentication and authorization"},
            {"name": "mines", "description": "Mine registry and risk monitoring"},
            {"name": "alerts", "description": "Safety alerts and incident tracking"},
            {"name": "compliance", "description": "Compliance requirement tracking"},
            {"name": "contractors", "description": "Contractor management"},
            {"name": "inspections", "description": "Field inspection records"},
        ],
    )

    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.exception_handler(IntegrityError)
    async def _integrity_error_handler(request: Request, exc: IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "A resource with the provided value already exists"},
        )

    application.include_router(health_router, tags=["health"])
    application.include_router(api_router, prefix="/api/v1")

    @application.on_event("startup")
    def _startup():
        seed_admin()

    return application


app = create_application()
