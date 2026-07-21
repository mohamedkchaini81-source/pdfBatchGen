from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_root() -> dict:
    """Root-level health check for Render — GET /health"""
    return {"status": "ok", "service": "pdf-batch-gen"}


@router.get("/api/health")
async def health_api() -> dict:
    """API-prefixed health check — GET /api/health (used by frontend)"""
    return {"status": "ok", "service": "pdf-batch-gen"}
