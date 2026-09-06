import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from secure import Secure
from secure.headers import (
    ContentSecurityPolicy,
    StrictTransportSecurity,
    ReferrerPolicy,
    PermissionsPolicy,
    XContentTypeOptions,
    XFrameOptions,
    CrossOriginOpenerPolicy,
    CrossOriginResourcePolicy,
)

from app.database import Base, engine
from app.routers import auth, inspections, documents
from app.models import permission, audit_log, token_blacklist, verification, password_reset
from app.core.logging_config import logger
from app.core.limiter import limiter
from app.core.config import settings

Base.metadata.create_all(bind=engine)

# --- FastAPI app — docs sirf non-production mein enabled ---
app = FastAPI(
    title="Mining Compliance Security App",
    debug=settings.DEBUG,
    docs_url="/docs" if settings.ENV != "production" else None,
    redoc_url="/redoc" if settings.ENV != "production" else None,
    openapi_url="/openapi.json" if settings.ENV != "production" else None,
)

# --- Rate limiter wiring ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- HTTPS force + trusted host (production only) ---
if settings.ENV == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])

# --- Routers ---
app.include_router(auth.router)
app.include_router(inspections.router)
app.include_router(documents.router)

# --- Security headers (secure v2.0.1 — verified working) ---
if settings.ENV == "production":
    # Production: strict CSP, unsafe-inline bilkul nahi (docs bhi disabled hain)
    csp = (
        ContentSecurityPolicy()
        .default_src("'self'")
        .script_src("'self'")
        .style_src("'self'")
        .img_src("'self'", "data:")
        .connect_src("'self'")
    )
else:
    # Development: Swagger UI (/docs) chalane ke liye relaxed
    csp = (
        ContentSecurityPolicy()
        .default_src("'self'")
        .script_src("'self'", "cdn.jsdelivr.net", "'unsafe-inline'")
        .style_src("'self'", "cdn.jsdelivr.net", "'unsafe-inline'")
        .img_src("'self'", "fastapi.tiangolo.com", "data:")
        .connect_src("'self'", "cdn.jsdelivr.net")
    )

hsts = StrictTransportSecurity().include_subdomains().max_age(31536000)
referrer = ReferrerPolicy().strict_origin_when_cross_origin()
permissions = PermissionsPolicy().geolocation("'none'").camera("'none'").microphone("'none'")
xcto = XContentTypeOptions()
xfo = XFrameOptions().sameorigin()
coop = CrossOriginOpenerPolicy()
corp = CrossOriginResourcePolicy()

secure_headers = Secure(
    csp=csp, hsts=hsts, referrer=referrer, permissions=permissions,
    xcto=xcto, xfo=xfo, coop=coop, corp=corp,
)

@app.middleware("http")
async def set_secure_headers(request: Request, call_next):
    response = await call_next(request)
    secure_headers.set_headers(response)
    return response

# --- Request logging ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} status={response.status_code} time={duration}ms ip={request.client.host}")
    return response

# --- Global exception handler — no stack traces leaked ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error at {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )

@app.get("/health")
def health():
    return {"status": "ok"}