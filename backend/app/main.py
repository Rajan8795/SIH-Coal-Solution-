from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes.health import router as health_router
from app.api.v1 import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.db.base import Base
from app.db.session import engine

# Automatically ensure database tables exist
Base.metadata.create_all(bind=engine)


def create_application() -> FastAPI:
    application = FastAPI(
        title=getattr(settings, "APP_NAME", "CoalGuard AI Security Backend"),
        version=getattr(settings, "APP_VERSION", "0.1.0"),
        debug=getattr(settings, "DEBUG", True),
        openapi_tags=[
            {"name": "health", "description": "Service health checks"},
            {"name": "auth", "description": "Authentication, MFA, and Security Hardening"},
            {"name": "mines", "description": "Mine registry and risk monitoring"},
            {"name": "alerts", "description": "Safety alerts and incident tracking"},
            {"name": "compliance", "description": "Compliance requirement tracking"},
            {"name": "contractors", "description": "Contractor management"},
            {"name": "inspections", "description": "Field inspection records"},
        ],
    )

    # Wire SlowAPI rate limiter
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Security Headers Middleware
    @application.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

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

    return application


app = create_application()
