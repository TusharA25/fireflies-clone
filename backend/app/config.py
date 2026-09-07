from typing import Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEV_JWT_FALLBACK = "dev-insecure-change-me"

class Settings(BaseSettings):
    database_url: str
    environment: str = "development"
    cors_origins: list[str]
    jwt_secret: str = _DEV_JWT_FALLBACK
    jwt_expire_minutes: int = 60 * 24 * 7
    seed_user_email: Optional[str] = None
    seed_user_password: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_production_hygiene(self):
        if self.environment == "production":
            if any(origin.strip() == "*" for origin in self.cors_origins):
                raise ValueError("CORS_ORIGINS cannot be * in production")
            secret = (self.jwt_secret or "").strip()
            if not secret or secret == _DEV_JWT_FALLBACK or len(secret) < 32:
                raise ValueError("JWT_SECRET must be at least 32 characters when ENVIRONMENT=production")
            if self.seed_user_email or self.seed_user_password:
                raise ValueError("Seed credentials must not be configured when ENVIRONMENT=production")
        return self

    @property
    def resolved_jwt_secret(self) -> str:
        return (self.jwt_secret or "").strip() or _DEV_JWT_FALLBACK

settings = Settings()
