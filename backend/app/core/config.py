import json
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "SnapUI Backend"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Database
    DATABASE_URL: str = "postgresql://snapui:snapui@localhost:5432/snapui"

    # Security (placeholder for future auth)
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"

    @property
    def cors_origins(self) -> list[str]:
        raw = self.CORS_ORIGINS
        if isinstance(raw, list):
            return [str(origin) for origin in raw]
        if not raw:
            return []
        try:
            parsed: Any = json.loads(raw)
            if isinstance(parsed, list):
                return [str(origin) for origin in parsed]
        except (ValueError, TypeError):
            pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


settings = Settings()
