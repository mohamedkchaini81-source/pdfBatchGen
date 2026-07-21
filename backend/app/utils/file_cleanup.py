"""
Temporary file cleanup utilities.
"""
import shutil
from pathlib import Path


def cleanup_job_dir(job_dir: Path) -> None:
    """Safely remove a job's working directory."""
    try:
        if job_dir.exists():
            shutil.rmtree(job_dir, ignore_errors=True)
    except Exception:
        pass  # Non-fatal — temp dir will be cleaned on restart
