"""Saral API - voice-first help for understanding and filling government forms.

Speech recognition and speech synthesis live entirely in the browser (Web
Speech API). This service handles OCR, language AI, and persistence only.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agent as agent_api
from app.api import documents, profile, translate
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.supabase_client import supabase_health
from app.models.schemas import HealthResponse
from app.services.agent import gemini_health
from app.services.ocr import ocr_health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s | %(message)s",
)
logger = logging.getLogger("saral")

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Log what is and is not wired up, so a broken demo is obvious at boot."""
    ocr_status = ocr_health()
    logger.info("CORS origins: %s", ", ".join(settings.cors_origins))
    logger.info(
        "Tesseract: %s",
        f"v{ocr_status['version']} ({', '.join(ocr_status['languages']) or 'no languages'})"
        if ocr_status["installed"]
        else "NOT INSTALLED - /api/documents/upload will return 503",
    )
    logger.info("Supabase configured: %s", settings.supabase_configured)
    logger.info(
        "Gemini configured: %s (model %s)", settings.gemini_configured, settings.gemini_model
    )
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Saral API",
    version="0.1.0",
    description=(
        "Backend for Saral, an accessibility app that reads, explains and fills "
        "government and banking forms in the user's own Indian language."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(documents.router)
app.include_router(translate.router)
app.include_router(agent_api.router)
app.include_router(profile.router)


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    """Report which dependencies are wired up.

    Always returns 200 - it is a diagnostic, not a gate. Check this before a
    demo to catch a missing key or a missing OCR engine early.
    """
    return HealthResponse(
        status="ok",
        ocr=ocr_health(),
        supabase=supabase_health(),
        gemini=gemini_health(),
    )

