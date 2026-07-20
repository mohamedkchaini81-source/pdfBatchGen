from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # CORS — allow local Vite dev server and GitHub Pages production
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "https://mohamedkchaini81-source.github.io",
    ]

    # Storage
    temp_dir: Path = Path(__file__).parent.parent.parent / "temp"

    # Job expiry (seconds)
    job_expiry_seconds: int = 3600

    # Limits
    max_records:  int = 2000
    max_pdf_size: int = 50 * 1024 * 1024   # 50 MB
    max_font_size_bytes: int = 10 * 1024 * 1024  # 10 MB


settings = Settings()
