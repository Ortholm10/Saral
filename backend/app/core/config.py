"""Application settings, loaded once from ``backend/.env``.

Nothing here raises at import time. Missing credentials only become an error
when a request actually needs them, so the server always starts and the demo
never dies on a boot-time crash.
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# backend/app/core/config.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_DIR / ".env"

# utf-8-sig: a .env saved by a Windows editor often carries a BOM, which would
# otherwise become part of the first variable's name.
load_dotenv(ENV_PATH, encoding="utf-8-sig")


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _env_int(name: str, default: int) -> int:
    try:
        return int(_env(name) or default)
    except ValueError:
        return default


# supabase-py wants the bare project URL and appends /rest/v1 itself. The
# dashboard shows the full REST URL in places, so pasting that is an easy
# mistake - and it fails as an opaque "Invalid path specified in request URL".
_SUPABASE_API_SUFFIXES = ("/rest/v1", "/auth/v1", "/storage/v1", "/realtime/v1")


def _normalize_supabase_url(raw: str) -> str:
    url = raw.strip().rstrip("/")
    for suffix in _SUPABASE_API_SUFFIXES:
        if url.endswith(suffix):
            trimmed = url[: -len(suffix)].rstrip("/")
            logging.getLogger("saral.config").warning(
                "SUPABASE_URL ended with %s; using the project URL instead. "
                "Set SUPABASE_URL to just https://<project>.supabase.co",
                suffix,
            )
            return trimmed
    return url


def _env_list(name: str, default: list[str]) -> list[str]:
    raw = _env(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings:
    """Typed view over the environment."""

    def __init__(self) -> None:
        # --- Supabase ---
        self.supabase_url: str = _normalize_supabase_url(_env("SUPABASE_URL"))
        self.supabase_key: str = _env("SUPABASE_KEY")

        # --- Gemini ---
        self.gemini_api_key: str = _env("GEMINI_API_KEY")
        self.gemini_model: str = _env("GEMINI_MODEL", "gemini-3.6-flash")

        # --- OCR ---
        # Optional explicit path to tesseract.exe; if blank we rely on PATH.
        self.tesseract_cmd: str = _env("TESSERACT_CMD")
        # Tesseract language packs to use, in tesseract's own "+"-joined form.
        self.ocr_languages: str = _env("OCR_LANGUAGES", "eng")
        self.max_upload_mb: int = _env_int("MAX_UPLOAD_MB", 10)

        # --- HTTP ---
        self.cors_origins: list[str] = _env_list(
            "CORS_ORIGINS",
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        )

        # --- App ---
        self.default_language: str = _env("DEFAULT_LANGUAGE", "Kannada")

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
