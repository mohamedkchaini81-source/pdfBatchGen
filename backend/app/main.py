"""
PDF Batch Gen — FastAPI backend entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_export import router as export_router
from app.core.config import settings

# Configure root logger so all backend log statements appear in Render logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.temp_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Temp directory ready: %s", settings.temp_dir)
    logger.info("CORS origins: %s", settings.cors_origins)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="PDF Batch Gen API",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS — must be added BEFORE routers ──────────────────────────────────
    # expose_headers includes Content-Disposition so the browser can read the
    # filename from file download responses.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

    # ── Health checks ─────────────────────────────────────────────────────────
    # GET /health     → Render health-check path
    # GET /api/health → frontend BackendBanner component

    @app.get("/health", tags=["health"])
    async def health_root():
        return {"status": "ok", "service": "pdf-batch-gen"}

    @app.get("/api/health", tags=["health"])
    async def health_api():
        return {"status": "ok", "service": "pdf-batch-gen"}

    # ── API routes ────────────────────────────────────────────────────────────
    app.include_router(export_router, prefix="/api")

    return app


app = create_app()
