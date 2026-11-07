import secrets

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Personal Finance API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./personal_finance.db"
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(48), min_length=32)
    frontend_origins: str = "http://localhost:5173"
    cookie_secure: bool = False
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.0-flash"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


settings = Settings()