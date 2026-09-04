import time
from fastapi import FastAPI, Request
from app.database import Base, engine
from app.routers import auth, inspections, documents
from app.models import permission, audit_log
from app.core.logging_config import logger
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter
from app.core.config import settings
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from secure import (
    Secure,
    ContentSecurityPolicy,
    StrictTransportSecurity,
    ReferrerPolicy,
    PermissionsPolicy,
    XContentTypeOptions,
    XFrameOptions,
)

Base.metadata.create_all(bind=engine)
print("Current ENV value:", settings.ENV)

app = FastAPI(title="Mining Compliance Security App")

# --- Rate limiter wiring ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- HTTPS force + trusted host (production only) ---
if settings.ENV == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])

# --- Routers ---
app.include_router(auth.router)
app.include_router(inspections.router)
app.include_router(documents.router)

# --- Security headers (all environments) ---
secure_headers = Secure.with_default_headers()

@app.middleware("http")
async def set_secure_headers(request: Request, call_next):
    response = await call_next(request)
    secure_headers.set_headers(response)
    return response

# --- Existing request logging middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} status={response.status_code} time={duration}ms ip={request.client.host}")
    return response
csp = (
    ContentSecurityPolicy()
    .default_src("'self'")
    .script_src("'self'", "cdn.jsdelivr.net", "'unsafe-inline'")
    .style_src("'self'", "cdn.jsdelivr.net", "'unsafe-inline'")
    .img_src("'self'", "fastapi.tiangolo.com", "data:")
    .connect_src("'self'", "cdn.jsdelivr.net")
)
hsts = StrictTransportSecurity().include_subdomains().preload().max_age(31536000)
referrer = ReferrerPolicy().strict_origin_when_cross_origin()
permissions = PermissionsPolicy().geolocation("'none'").camera("'none'").microphone("'none'")

secure_headers = Secure(
    csp=csp,
    hsts=hsts,
    referrer=referrer,
    permissions=permissions,
    xcto=XContentTypeOptions(),
    xfo=XFrameOptions().sameorigin(),
)


@app.get("/health")
def health():
    return {"status": "ok"}