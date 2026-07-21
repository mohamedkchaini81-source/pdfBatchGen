import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_origins(raw: str | None) -> list[str]:
    """
    Parse ALLOWED_ORIGINS env var.
    Accepts comma-separated string:
      http://localhost:5173,https://pdf-batch-gen.onrender.com
    """
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # CORS — read from env var ALLOWED_ORIGINS (comma-separated)
    # Falls back to safe local-dev defaults when env var is not set.
    allowed_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:4173"
    )

    @property
    def cors_origins(self) -> list[str]:
        return _parse_origins(self.allowed_origins)

    # Storage — use /tmp on Render (ephemeral but always writable)
    temp_dir: Path = Path(os.environ.get("TEMP_DIR", "/tmp/pdf_batch_gen"))

    # Job expiry (seconds)
    job_expiry_seconds: int = 3600

    # Limits
    max_records:         int = 2000
    max_pdf_size:        int = 50 * 1024 * 1024   # 50 MB
    max_font_size_bytes: int = 10 * 1024 * 1024   # 10 MB


settings = Settings()
