import json
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "CoalGuard AI Backend"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    # Database
    DATABASE_URL: str = "sqlite:///./coalguard.db"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @field_validator("DEBUG", mode="before")
    @classmethod
    def _parse_debug(cls, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() not in {"false", "0", "no", "off", "release"}
        return bool(value)

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
