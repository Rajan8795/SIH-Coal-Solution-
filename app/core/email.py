from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

async def send_verification_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"
    message = MessageSchema(
        subject="Verify your email — Mining Compliance App",
        recipients=[email],
        body=f"Click to verify your account: {link}\nThis link expires in 30 minutes.",
        subtype=MessageType.plain,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_password_reset_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/auth/reset-password-page?token={token}"
    message = MessageSchema(
        subject="Password Reset — Mining Compliance App",
        recipients=[email],
        body=f"Click to reset your password: {link}\nThis link expires in 30 minutes.\nIf you didn't request this, ignore this email.",
        subtype=MessageType.plain,
    )
    fm = FastMail(conf)
    await fm.send_message(message)