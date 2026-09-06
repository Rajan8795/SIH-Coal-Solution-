from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@coalguard.gov.in"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    FRONTEND_URL: str = "http://localhost:5173"
    DATABASE_URL: str = "sqlite:///./coalguard.db"
    SECRET_KEY: str = "coalguard_super_secret_jwt_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENV: str = "development"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()