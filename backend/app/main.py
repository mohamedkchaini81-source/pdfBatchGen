"""
PDF Batch Gen — FastAPI backend entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_health import router as health_router
from app.api.routes_export import router as export_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure temp directory exists
    settings.temp_dir.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown: cleanup is handled per-job


def create_app() -> FastAPI:
    app = FastAPI(
        title="PDF Batch Gen API",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(export_router, prefix="/api")

    return app


app = create_app()
