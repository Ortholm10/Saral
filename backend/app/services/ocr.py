"""OCR: turn a photo of a form into plain text using Tesseract.

This is the entry point of the whole Saral flow, so it is deliberately
forgiving: it locates the Tesseract binary on its own, quietly drops language
packs that are not installed, and turns every failure into a message a
non-technical user could act on.
"""

from __future__ import annotations

import io
import logging
import os
import shutil
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import pytesseract
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings
from app.core.errors import BadRequestError, ConfigurationError, OcrError

logger = logging.getLogger("saral.ocr")

SUPPORTED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

# Where the Windows installers usually drop tesseract.exe.
_WINDOWS_CANDIDATES = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
)

# Tesseract page segmentation mode 3 = fully automatic. Forms are dense and
# loosely columnar, so automatic beats any fixed assumption about layout.
_TESSERACT_CONFIG = "--oem 3 --psm 3"

_INSTALL_HINT = (
    "Install the Tesseract OCR engine, then restart the server. "
    "On Windows: winget install UB-Mannheim.TesseractOCR "
    "(or set TESSERACT_CMD in backend/.env to the full path of tesseract.exe)."
)


@dataclass
class OcrResult:
    text: str
    char_count: int
    word_count: int
    languages_used: list[str]
    mean_confidence: float | None = None
    warnings: list[str] = field(default_factory=list)


def _discover_tesseract() -> str | None:
    """Find tesseract.exe from config, PATH, or the usual install locations."""
    configured = settings.tesseract_cmd
    if configured:
        if Path(configured).is_file():
            return configured
        logger.warning("TESSERACT_CMD is set to %s but no file is there", configured)

    on_path = shutil.which("tesseract")
    if on_path:
        return on_path

    for candidate in _WINDOWS_CANDIDATES:
        if Path(candidate).is_file():
            return candidate

    local = os.getenv("LOCALAPPDATA")
    if local:
        candidate = Path(local) / "Programs" / "Tesseract-OCR" / "tesseract.exe"
        if candidate.is_file():
            return str(candidate)

    return None


@lru_cache(maxsize=1)
def _configure() -> str | None:
    """Point pytesseract at the binary. Cached: the lookup touches the disk."""
    binary = _discover_tesseract()
    if binary:
        pytesseract.pytesseract.tesseract_cmd = binary
        logger.info("Using Tesseract at %s", binary)
    else:
        logger.warning("Tesseract binary not found; /api/documents/upload will return 503")
    return binary


def tesseract_version() -> str | None:
    """Installed Tesseract version, or None if the binary is unusable."""
    if not _configure():
        return None
    try:
        return str(pytesseract.get_tesseract_version())
    except Exception:  # noqa: BLE001 - probe only, never fatal
        return None


@lru_cache(maxsize=1)
def available_languages() -> tuple[str, ...]:
    """Language packs Tesseract can actually use (e.g. ('eng', 'kan'))."""
    if not _configure():
        return ()
    try:
        return tuple(sorted(pytesseract.get_languages(config="")))
    except Exception:  # noqa: BLE001
        logger.warning("Could not list Tesseract languages", exc_info=True)
        return ()


def ocr_health() -> dict:
    """Non-throwing status probe used by /api/health."""
    binary = _configure()
    version = tesseract_version() if binary else None
    return {
        "installed": bool(version),
        "binary": binary,
        "version": version,
        "languages": list(available_languages()),
    }


def _require_tesseract() -> None:
    if not _configure() or tesseract_version() is None:
        raise ConfigurationError(
            "Text recognition is unavailable because the OCR engine is not "
            "installed on this server.",
            hint=_INSTALL_HINT,
        )


def _resolve_languages(requested: str | None) -> tuple[str, list[str]]:
    """Keep only language packs that are installed; never fail over a missing one.

    Returns the "+"-joined string for Tesseract plus any warnings to surface.
    """
    wanted = [
        code.strip()
        for code in (requested or settings.ocr_languages).replace(",", "+").split("+")
        if code.strip()
    ]
    installed = available_languages()
    if not installed:  # older builds may not support --list-langs; trust the caller
        return "+".join(wanted) or "eng", []

    usable = [code for code in wanted if code in installed]
    missing = [code for code in wanted if code not in installed]

    warnings: list[str] = []
    if missing:
        warnings.append(
            f"OCR language pack(s) not installed, skipped: {', '.join(missing)}. "
            f"Available: {', '.join(installed)}."
        )
    if not usable:
        usable = ["eng"] if "eng" in installed else [installed[0]]
        warnings.append(f"Fell back to {usable[0]} for text recognition.")

    return "+".join(usable), warnings


def validate_upload(filename: str | None, content_type: str | None, size: int) -> None:
    """Reject files we cannot OCR before spending time decoding them."""
    if size == 0:
        raise BadRequestError(
            "The uploaded file is empty.",
            hint="Take the photo again and make sure it saves before uploading.",
        )
    if size > settings.max_upload_bytes:
        raise BadRequestError(
            f"That image is too large (limit {settings.max_upload_mb} MB).",
            code="file_too_large",
            hint="Try a smaller photo, or lower your camera's resolution.",
        )

    normalized_type = (content_type or "").split(";")[0].strip().lower()
    extension = Path(filename or "").suffix.lower()

    # Browsers occasionally send a blank or generic content type, so an
    # accepted extension is enough on its own.
    if normalized_type not in SUPPORTED_CONTENT_TYPES and extension not in SUPPORTED_EXTENSIONS:
        raise BadRequestError(
            "That file type is not supported. Please upload a JPG, PNG, WEBP, "
            "BMP or TIFF image.",
            code="unsupported_file_type",
        )


def _prepare_image(raw: bytes) -> Image.Image:
    """Decode and lightly clean up the photo to give Tesseract a fair chance."""
    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
    except UnidentifiedImageError as exc:
        raise BadRequestError(
            "That file could not be read as an image.",
            code="unreadable_image",
            hint="Please upload a photo taken with your camera, not a document file.",
        ) from exc
    except Exception as exc:  # noqa: BLE001 - truncated/corrupt files land here
        raise BadRequestError(
            "That image appears to be damaged and could not be opened.",
            code="unreadable_image",
        ) from exc

    # Phone photos carry rotation in EXIF rather than in the pixels.
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")

    # Tesseract wants roughly 300 DPI; small images read much better upscaled.
    if image.width < 1200:
        scale = min(1200 / max(image.width, 1), 3.0)
        if scale > 1.05:
            new_size = (int(image.width * scale), int(image.height * scale))
            image = image.resize(new_size, Image.LANCZOS)

    return ImageOps.autocontrast(image)


def _text_and_confidence(data: dict) -> tuple[str, float | None]:
    """Rebuild readable text from Tesseract's word-level output.

    One image_to_data pass gives us the text and a quality score together,
    which is cheaper than running OCR twice.
    """
    lines: list[str] = []
    current: list[str] = []
    last_line_key: tuple | None = None
    last_block: int | None = None
    confidences: list[float] = []

    for index, raw_word in enumerate(data.get("text", [])):
        word = (raw_word or "").strip()
        try:
            confidence = float(data["conf"][index])
        except (KeyError, IndexError, TypeError, ValueError):
            confidence = -1.0

        if not word or confidence < 0:
            continue

        confidences.append(confidence)
        block = data["block_num"][index]
        line_key = (
            data["page_num"][index],
            block,
            data["par_num"][index],
            data["line_num"][index],
        )

        if last_line_key is not None and line_key != last_line_key:
            lines.append(" ".join(current))
            current = []
            if last_block is not None and block != last_block:
                lines.append("")  # blank line between blocks keeps sections apart

        current.append(word)
        last_line_key = line_key
        last_block = block

    if current:
        lines.append(" ".join(current))

    text = "\n".join(lines).strip()
    mean_confidence = round(sum(confidences) / len(confidences), 1) if confidences else None
    return text, mean_confidence


def extract_text(raw: bytes, languages: str | None = None) -> OcrResult:
    """Run OCR over image bytes. Blocking - call it from a threadpool.

    Raises:
        ConfigurationError: Tesseract is not installed.
        BadRequestError: the bytes are not a readable image.
        OcrError: the image was read but no text came out of it.
    """
    # Decode first, so a damaged upload still gets a precise message even when
    # the OCR engine itself is missing.
    image = _prepare_image(raw)
    _require_tesseract()
    lang, warnings = _resolve_languages(languages)

    try:
        data = pytesseract.image_to_data(
            image,
            lang=lang,
            config=_TESSERACT_CONFIG,
            output_type=pytesseract.Output.DICT,
        )
    except pytesseract.TesseractNotFoundError as exc:
        raise ConfigurationError(
            "Text recognition is unavailable because the OCR engine is not "
            "installed on this server.",
            hint=_INSTALL_HINT,
        ) from exc
    except pytesseract.TesseractError as exc:
        logger.exception("Tesseract failed")
        raise OcrError(
            "The OCR engine could not process that image.",
            hint=f"Tesseract reported: {exc}",
        ) from exc

    text, mean_confidence = _text_and_confidence(data)

    if not text:
        raise OcrError(
            "No text could be read from that image.",
            code="no_text_found",
            hint=(
                "Hold the camera steady, fill the frame with the page, "
                "and make sure the document is well lit."
            ),
        )

    if mean_confidence is not None and mean_confidence < 60:
        warnings.append(
            "The text was hard to read, so some words may be wrong. "
            "A sharper, brighter photo will give a better result."
        )

    return OcrResult(
        text=text,
        char_count=len(text),
        word_count=len(text.split()),
        languages_used=lang.split("+"),
        mean_confidence=mean_confidence,
        warnings=warnings,
    )
