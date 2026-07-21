"""
In-process export job manager.
Runs export in a background thread. Thread-safe via locking.
Architecture is ready for later migration to Celery/RQ.
"""
import json
import threading
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.models.export_job import ExportJob, JobStatus
from app.models.participant import Participant
from app.models.text_field import TextFieldConfig, ExportSettings
from app.services.pdf_generation_service import stamp_pdf
from app.services.archive_service import create_zip, create_merged_pdf
from app.utils.filenames import build_filename
from app.utils.file_cleanup import cleanup_job_dir


_jobs: dict[str, ExportJob] = {}
_lock = threading.Lock()


# ── CRUD ─────────────────────────────────────────────────────────────────────

def create_job() -> ExportJob:
    job = ExportJob(job_id=str(uuid.uuid4()))
    with _lock:
        _jobs[job.job_id] = job
    return job


def get_job(job_id: str) -> Optional[ExportJob]:
    with _lock:
        return _jobs.get(job_id)


def cancel_job(job_id: str) -> bool:
    job = get_job(job_id)
    if job and job.status == JobStatus.PROCESSING:
        job.request_cancel()
        return True
    return False


def delete_job(job_id: str) -> None:
    with _lock:
        _jobs.pop(job_id, None)


def cleanup_expired() -> None:
    """Remove jobs older than job_expiry_seconds."""
    cutoff = datetime.utcnow() - timedelta(seconds=settings.job_expiry_seconds)
    to_del = []
    with _lock:
        for jid, job in _jobs.items():
            if job.created_at < cutoff:
                to_del.append(jid)
                if job.output_path:
                    cleanup_job_dir(job.output_path.parent)
    for jid in to_del:
        with _lock:
            _jobs.pop(jid, None)


# ── Run export in background thread ──────────────────────────────────────────

def run_export_async(
    job: ExportJob,
    template_bytes: bytes,
    participants: list[Participant],
    name_cfg: TextFieldConfig,
    role_cfg: TextFieldConfig,
    export_settings: ExportSettings,
    name_ar_font_path: Optional[Path],
    name_en_font_path: Optional[Path],
    role_ar_font_path: Optional[Path],
    role_en_font_path: Optional[Path],
) -> None:
    """Launch export in a daemon thread. Returns immediately."""
    t = threading.Thread(
        target=_run_export,
        args=(
            job, template_bytes, participants,
            name_cfg, role_cfg, export_settings,
            name_ar_font_path, name_en_font_path,
            role_ar_font_path, role_en_font_path,
        ),
        daemon=True,
    )
    t.start()


def _run_export(
    job: ExportJob,
    template_bytes: bytes,
    participants: list[Participant],
    name_cfg: TextFieldConfig,
    role_cfg: TextFieldConfig,
    export_settings: ExportSettings,
    name_ar_font_path: Optional[Path],
    name_en_font_path: Optional[Path],
    role_ar_font_path: Optional[Path],
    role_en_font_path: Optional[Path],
) -> None:
    job.status        = JobStatus.PROCESSING
    job.total_records = len(participants)

    job_dir = settings.temp_dir / job.job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    try:
        from app.utils.arabic_text import contains_arabic

        collected: list[tuple[str, bytes]] = []
        used_names: dict[str, int] = {}

        for i, participant in enumerate(participants):
            if job.is_cancelled():
                job.status = JobStatus.CANCELLED
                return

            # Choose correct font path per language
            is_name_ar = contains_arabic(participant.name)
            name_font  = name_ar_font_path if is_name_ar else name_en_font_path

            is_role_ar = contains_arabic(participant.role) if participant.role else False
            role_font  = role_ar_font_path if is_role_ar else role_en_font_path

            job.current_name = participant.name

            pdf_bytes = stamp_pdf(
                template_bytes=template_bytes,
                participant=participant,
                name_cfg=name_cfg,
                role_cfg=role_cfg,
                settings=export_settings,
                name_font_path=name_font,
                role_font_path=role_font,
            )

            filename = build_filename(i, participant.name, used_names)
            collected.append((filename, pdf_bytes))

            job.completed_records = i + 1

        if job.is_cancelled():
            job.status = JobStatus.CANCELLED
            return

        # Assemble output
        method = export_settings.exportMethod

        if method == "merged":
            result_bytes   = create_merged_pdf([b for _, b in collected])
            base           = export_settings.pdfFileName.replace(".pdf", "")
            output_name    = f"{base}-all.pdf"
            output_path    = job_dir / output_name
            output_path.write_bytes(result_bytes)
            job.output_path     = output_path
            job.output_filename = output_name

        elif method == "zip":
            result_bytes   = create_zip(collected)
            base           = export_settings.pdfFileName.replace(".pdf", "")
            output_name    = f"{base}.zip"
            output_path    = job_dir / output_name
            output_path.write_bytes(result_bytes)
            job.output_path     = output_path
            job.output_filename = output_name

        else:  # individual → zip for browser download
            result_bytes   = create_zip(collected)
            base           = export_settings.pdfFileName.replace(".pdf", "")
            output_name    = f"{base}.zip"
            output_path    = job_dir / output_name
            output_path.write_bytes(result_bytes)
            job.output_path     = output_path
            job.output_filename = output_name

        job.status = JobStatus.COMPLETED

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error  = str(e)
    finally:
        # Keep output file; clean temp font copies in subdirs if any
        pass
