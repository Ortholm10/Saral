"""One error shape for the whole API.

Every failure — expected or not — leaves the server as::

    {"error": {"code": "...", "message": "...", "hint": "..."}}

so the frontend can always read ``error.message`` aloud to the user instead of
choking on an HTML traceback page.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("saral")


class SaralError(Exception):
    """Base class for every failure we raise deliberately."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        code: str | None = None,
        hint: str | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        self.hint = hint

    def to_payload(self) -> dict:
        error: dict[str, str] = {"code": self.code, "message": self.message}
        if self.hint:
            error["hint"] = self.hint
        return {"error": error}


class ConfigurationError(SaralError):
    """A required credential or binary is missing on the server."""

    status_code = 503
    code = "not_configured"


class BadRequestError(SaralError):
    status_code = 400
    code = "bad_request"


class NotFoundError(SaralError):
    status_code = 404
    code = "not_found"


class OcrError(SaralError):
    """The image was received but no usable text could be extracted."""

    status_code = 422
    code = "ocr_failed"


class UpstreamError(SaralError):
    """Gemini or Supabase failed on us."""

    status_code = 502
    code = "upstream_error"


class RateLimitError(SaralError):
    """Gemini's free tier pushed back."""

    status_code = 429
    code = "rate_limited"


def _json(status_code: int, code: str, message: str, hint: str | None = None) -> JSONResponse:
    error: dict[str, str] = {"code": code, "message": message}
    if hint:
        error["hint"] = hint
    return JSONResponse(status_code=status_code, content={"error": error})


def register_exception_handlers(app: FastAPI) -> None:
    """Attach handlers so no route can ever return an unstructured error."""

    @app.exception_handler(SaralError)
    async def _handle_saral_error(request: Request, exc: SaralError) -> JSONResponse:
        logger.warning("%s %s -> %s: %s", request.method, request.url.path, exc.code, exc.message)
        return JSONResponse(status_code=exc.status_code, content=exc.to_payload())

    @app.exception_handler(RequestValidationError)
    async def _handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        first = exc.errors()[0] if exc.errors() else {}
        field = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
        detail = first.get("msg", "Invalid request.")
        message = f"{field}: {detail}" if field else detail
        return _json(422, "invalid_request", message, hint="Check the request body fields.")

    @app.exception_handler(StarletteHTTPException)
    async def _handle_http_exception(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return _json(exc.status_code, f"http_{exc.status_code}", detail)

    @app.exception_handler(Exception)
    async def _handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return _json(
            500,
            "internal_error",
            "Something went wrong on the server. Please try again.",
        )
