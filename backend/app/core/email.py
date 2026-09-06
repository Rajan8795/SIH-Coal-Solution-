from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def _get_mail_config() -> ConnectionConfig | None:
    mail_username = getattr(settings, "MAIL_USERNAME", "")
    mail_password = getattr(settings, "MAIL_PASSWORD", "")
    if not mail_username or not mail_password:
        return None
    try:
        return ConnectionConfig(
            MAIL_USERNAME=mail_username,
            MAIL_PASSWORD=mail_password,
            MAIL_FROM=getattr(settings, "MAIL_FROM", "noreply@coalguard.gov.in"),
            MAIL_SERVER=getattr(settings, "MAIL_SERVER", "smtp.gmail.com"),
            MAIL_PORT=getattr(settings, "MAIL_PORT", 587),
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )
    except Exception as e:
        logger.warning(f"Mail configuration error: {e}")
        return None

async def send_verification_email(email: str, token: str):
    conf = _get_mail_config()
    if not conf:
        logger.info(f"[SMTP Disabled] Skip sending verification email to {email}")
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    link = f"{frontend_url}/auth/verify-email?token={token}"
    message = MessageSchema(
        subject="Verify your email — CoalGuard AI",
        recipients=[email],
        body=f"Click to verify your account: {link}\nThis link expires in 30 minutes.",
        subtype=MessageType.plain,
    )
    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")


async def send_password_reset_email(email: str, token: str):
    conf = _get_mail_config()
    if not conf:
        logger.info(f"[SMTP Disabled] Skip sending password reset email to {email}")
        return

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    link = f"{frontend_url}/auth/reset-password-page?token={token}"
    message = MessageSchema(
        subject="Password Reset — CoalGuard AI",
        recipients=[email],
        body=f"Click to reset your password: {link}\nThis link expires in 30 minutes.\nIf you didn't request this, ignore this email.",
        subtype=MessageType.plain,
    )
    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
