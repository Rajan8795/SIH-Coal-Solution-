import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.token_blacklist import TokenBlacklist
from app.models.password_reset import PasswordResetToken
from app.models.verification import EmailVerificationToken
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.core.security import (
    verify_password, hash_password,
    create_access_token, create_refresh_token,
    decode_token, validate_password_strength
)
from app.core.audit import log_action
from app.core.email import send_verification_email, send_password_reset_email
from app.core.mfa import generate_mfa_secret, get_totp_uri, generate_qr_code_base64, verify_totp_code
from app.core.deps import get_current_user, require_permission, oauth2_scheme
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.employee_id == payload.employee_id).first()
    generic_error = HTTPException(status_code=401, detail="Invalid credentials")

    if not user:
        raise generic_error

    locked_until = user.locked_until
    if locked_until and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    if locked_until and locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=423, detail="Account temporarily locked. Try later.")

    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
        db.commit()
        log_action(db, request, "LOGIN_FAILED", "FAILURE", user_id=user.id)
        raise generic_error

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    if user.mfa_enabled:
        if not payload.mfa_code:
            raise HTTPException(status_code=401, detail="MFA code required")
        if not verify_totp_code(user.mfa_secret, payload.mfa_code):
            log_action(db, request, "MFA_FAILED", "FAILURE", user_id=user.id)
            raise HTTPException(status_code=401, detail="Invalid MFA code")

    log_action(db, request, "LOGIN_SUCCESS", "SUCCESS", user_id=user.id)

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
def refresh_token(request: Request, refresh_token: str, db: Session = Depends(get_db)):
    if db.query(TokenBlacklist).filter(TokenBlacklist.token == refresh_token).first():
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user")

    db.add(TokenBlacklist(token=refresh_token))
    db.commit()

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first():
        db.add(TokenBlacklist(token=token))
        db.commit()
    return {"message": "Logged out successfully"}


@router.get("/verify-email")
@limiter.limit("10/minute")
def verify_email(request: Request, token: str, db: Session = Depends(get_db)):
    record = db.query(EmailVerificationToken).filter(EmailVerificationToken.token == token).first()
    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "Invalid or expired verification link")

    user = db.query(User).filter(User.id == record.user_id).first()
    if user:
        user.is_verified = True
        db.delete(record)
        db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    generic_response = {"message": "If this email is registered, a reset link has been sent."}

    if not user:
        return generic_response

    token = secrets.token_urlsafe(32)
    reset_entry = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    db.add(reset_entry)
    db.commit()

    try:
        await send_password_reset_email(user.email, token)
    except Exception:
        pass

    return generic_response


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(PasswordResetToken).filter(PasswordResetToken.token == payload.token).first()
    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "Invalid or expired reset link")

    ok, msg = validate_password_strength(payload.new_password)
    if not ok:
        raise HTTPException(400, msg)

    user = db.query(User).filter(User.id == record.user_id).first()
    if user:
        user.hashed_password = hash_password(payload.new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        db.delete(record)
        db.commit()

    return {"message": "Password reset successfully. Please log in with your new password."}


@router.post("/mfa/setup")
@limiter.limit("5/minute")
def setup_mfa(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_mfa_secret()
    current_user.mfa_secret = secret
    db.commit()

    uri = get_totp_uri(secret, current_user.email)
    qr_base64 = generate_qr_code_base64(uri)

    return {"secret": secret, "qr_code_base64": qr_base64}


@router.post("/mfa/enable")
@limiter.limit("5/minute")
def enable_mfa(request: Request, code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mfa_secret:
        raise HTTPException(400, "MFA setup not initiated")
    if not verify_totp_code(current_user.mfa_secret, code):
        raise HTTPException(400, "Invalid MFA code")

    current_user.mfa_enabled = True
    db.commit()
    return {"message": "MFA enabled successfully"}


@router.post("/mfa/disable")
@limiter.limit("5/minute")
def disable_mfa(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.commit()
    return {"message": "MFA disabled"}