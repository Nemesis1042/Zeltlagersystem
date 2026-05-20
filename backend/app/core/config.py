from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "BULA2026"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://bula_user:secret@localhost:5432/bula2026"

    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://anmeldung.lagerbank.info",
        "http://admin.lagerbank.info",
        "https://anmeldung.lagerbank.info",
        "https://admin.lagerbank.info",
    ]

    # Email
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str = "niklashardwig5@gmail.com"
    EMAIL_PASSWORD: str = ""

    # File Upload
    MAX_FILE_SIZE: int = 5242880  # 5MB
    UPLOAD_PATH: str = "./uploads"

    # App URLs
    FRONTEND_URL: str = "http://localhost:5173"
    ANMELDUNG_URL: str = "http://anmeldung.lagerbank.info"
    ADMIN_URL: str = "http://admin.lagerbank.info"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
