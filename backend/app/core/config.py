import logging
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


def _parse_origins(raw: str | None) -> list[str]:
    """
    Parse ALLOWED_ORIGINS env var.
    - Accepts comma-separated values
    - Strips whitespace and trailing slashes from each origin
    - Logs what was parsed so mismatches are visible in Render logs
    """
    if not raw:
        return []
    origins = [
        o.strip().rstrip("/")
        for o in raw.split(",")
        if o.strip()
    ]
    logger.info("CORS allowed origins: %s", origins)
    return origins


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    host:  str  = "0.0.0.0"
    port:  int  = 8000
    debug: bool = False

    # CORS — read from ALLOWED_ORIGINS env var (comma-separated).
    # Default covers local development only.
    # In production set:
    #   ALLOWED_ORIGINS=http://localhost:5173,https://pdf-batch-gen-frontend.onrender.com
    allowed_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:4173"
    )

    @property
    def cors_origins(self) -> list[str]:
        return _parse_origins(self.allowed_origins)

    # Storage — use /tmp on Render (ephemeral, always writable)
    temp_dir: Path = Path(os.environ.get("TEMP_DIR", "/tmp/pdf_batch_gen"))

    # Job expiry (seconds)
    job_expiry_seconds: int = 3600

    # Limits
    max_records:         int = 2000
    max_pdf_size:        int = 50 * 1024 * 1024   # 50 MB
    max_font_size_bytes: int = 10 * 1024 * 1024   # 10 MB


settings = Settings()
