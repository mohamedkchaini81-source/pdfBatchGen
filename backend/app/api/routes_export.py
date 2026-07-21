"""
Export API routes.

POST   /exports                 → start export job
GET    /exports/{job_id}        → poll status
DELETE /exports/{job_id}        → cancel
GET    /exports/{job_id}/download → download result
"""
import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.config import settings
from app.models.participant import Participant
from app.models.text_field import TextFieldConfig, ExportSettings
from app.services.export_job_service import (
    create_job, get_job, cancel_job, run_export_async,
)

router = APIRouter(tags=["exports"])


# ── Helper: save uploaded font to job temp dir ───────────────────────────────

async def _save_font(upload: Optional[UploadFile], job_dir: Path, name: str) -> Optional[Path]:
    if not upload or not upload.filename:
        return None
    ext  = Path(upload.filename).suffix.lower()
    if ext not in (".ttf", ".otf"):
        return None
    dest = job_dir / f"{name}{ext}"
    dest.write_bytes(await upload.read())
    return dest


# ── POST /exports ─────────────────────────────────────────────────────────────

@router.post("/exports", status_code=202)
async def start_export(
    template:     UploadFile = File(...),
    records_json: str        = Form(...),
    name_config:  str        = Form(...),
    role_config:  str        = Form(...),
    settings_json: str       = Form(..., alias="settings"),
    name_ar_font: Optional[UploadFile] = File(None),
    name_en_font: Optional[UploadFile] = File(None),
    role_ar_font: Optional[UploadFile] = File(None),
    role_en_font: Optional[UploadFile] = File(None),
) -> dict:
    # Validate PDF size
    template_bytes = await template.read()
    if len(template_bytes) > settings.max_pdf_size:
        raise HTTPException(400, "PDF template exceeds maximum allowed size (50 MB).")
    if len(template_bytes) == 0:
        raise HTTPException(400, "PDF template is empty.")

    # Parse JSON payloads
    try:
        raw_records   = json.loads(records_json)
        participants  = [Participant(**r) for r in raw_records]
        name_cfg      = TextFieldConfig(**json.loads(name_config))
        role_cfg      = TextFieldConfig(**json.loads(role_config))
        export_settings = ExportSettings(**json.loads(settings_json))
    except Exception as e:
        raise HTTPException(400, f"Invalid request payload: {e}")

    if len(participants) == 0:
        raise HTTPException(400, "No participant records provided.")
    if len(participants) > settings.max_records:
        raise HTTPException(400, f"Too many records (max {settings.max_records}).")

    # Create job and temp dir
    job     = create_job()
    job_dir = settings.temp_dir / job.job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    # Save fonts
    name_ar_path = await _save_font(name_ar_font, job_dir, "name_ar")
    name_en_path = await _save_font(name_en_font, job_dir, "name_en")
    role_ar_path = await _save_font(role_ar_font, job_dir, "role_ar")
    role_en_path = await _save_font(role_en_font, job_dir, "role_en")

    # Launch background export
    run_export_async(
        job=job,
        template_bytes=template_bytes,
        participants=participants,
        name_cfg=name_cfg,
        role_cfg=role_cfg,
        export_settings=export_settings,
        name_ar_font_path=name_ar_path,
        name_en_font_path=name_en_path,
        role_ar_font_path=role_ar_path,
        role_en_font_path=role_en_path,
    )

    return {"jobId": job.job_id, "status": "queued"}


# ── GET /exports/{job_id} ─────────────────────────────────────────────────────

@router.get("/exports/{job_id}")
async def poll_export(job_id: str) -> dict:
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Export job not found.")
    return job.to_dict()


# ── DELETE /exports/{job_id} ──────────────────────────────────────────────────

@router.delete("/exports/{job_id}", status_code=202)
async def cancel_export_route(job_id: str) -> dict:
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Export job not found.")
    cancelled = cancel_job(job_id)
    return {"jobId": job_id, "cancelled": cancelled}


# ── GET /exports/{job_id}/download ───────────────────────────────────────────

@router.get("/exports/{job_id}/download")
async def download_export(job_id: str) -> FileResponse:
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Export job not found.")
    if job.status.value != "completed":
        raise HTTPException(400, f"Export is not complete (status: {job.status.value}).")
    if not job.output_path or not job.output_path.exists():
        raise HTTPException(410, "Download has expired or was already cleaned up.")

    # Determine media type
    suffix = job.output_path.suffix.lower()
    media  = "application/zip" if suffix == ".zip" else "application/pdf"

    return FileResponse(
        path=str(job.output_path),
        filename=job.output_filename,
        media_type=media,
    )
