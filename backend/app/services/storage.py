"""Persistence: user profiles and document history, in Supabase.

supabase-py is synchronous, so every call here is blocking and the routers run
these through a threadpool. Postgrest failures are translated into SaralErrors
so a database problem still reaches the user as a sentence, not a stack trace.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from postgrest.exceptions import APIError

from app.core.config import settings
from app.core.errors import NotFoundError, UpstreamError
from app.core.languages import resolve_language
from app.core.supabase_client import get_supabase

logger = logging.getLogger("saral.storage")

PROFILES_TABLE = "profiles"
HISTORY_TABLE = "document_history"

DEFAULT_ACCESSIBILITY: dict[str, Any] = {
    "speech_rate": 1.0,
    "voice_guidance": True,
    "high_contrast": False,
    "large_text": False,
}

# Error codes worth explaining rather than passing through raw. PostgREST
# reports an unknown table as PGRST205 from its schema cache, and Postgres
# itself uses 42P01 - either means the schema has not been created yet.
_MISSING_TABLE_CODES = {"42P01", "PGRST205"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _handle_api_error(exc: APIError, action: str) -> UpstreamError:
    """Turn a Postgrest error into something the user could act on."""
    code = getattr(exc, "code", None)
    message = getattr(exc, "message", None) or str(exc)
    logger.error("Supabase error while %s: %s %s", action, code, message)

    if code in _MISSING_TABLE_CODES:
        return UpstreamError(
            "The database is not set up yet.",
            code="schema_missing",
            hint=(
                "Run backend/supabase/schema.sql in the Supabase dashboard "
                "(SQL Editor -> New query -> Run)."
            ),
        )

    return UpstreamError(
        f"The database could not {action}. Please try again.",
        hint=message,
    )


def _profile_to_dict(row: dict) -> dict:
    """Normalise a profiles row into the shape the API returns."""
    accessibility = {**DEFAULT_ACCESSIBILITY, **(row.get("accessibility") or {})}
    return {
        "user_id": row["user_id"],
        "display_name": row.get("display_name"),
        "language": row.get("language") or settings.default_language,
        "language_code": row.get("language_code") or resolve_language(None).code,
        "accessibility": accessibility,
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


def get_profile(user_id: str) -> dict:
    """Fetch one profile.

    Raises:
        NotFoundError: no profile exists yet, so the frontend should run its
            language-and-preferences onboarding.
    """
    client = get_supabase()
    try:
        response = (
            client.table(PROFILES_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except APIError as exc:
        raise _handle_api_error(exc, "load your preferences") from exc

    rows = response.data or []
    if not rows:
        raise NotFoundError(
            "No preferences have been saved for this user yet.",
            code="profile_not_found",
            hint="Ask the user for their language, then POST /api/profile to create one.",
        )

    return _profile_to_dict(rows[0])


def upsert_profile(
    user_id: str,
    display_name: str | None = None,
    language: str | None = None,
    accessibility: dict | None = None,
) -> dict:
    """Create or update a profile.

    Only the fields provided are changed; anything omitted keeps its stored
    value, so the frontend can save one preference without resending the rest.
    """
    client = get_supabase()

    try:
        existing = (
            client.table(PROFILES_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        ).data or []
    except APIError as exc:
        raise _handle_api_error(exc, "save your preferences") from exc

    current = existing[0] if existing else {}

    record: dict[str, Any] = {"user_id": user_id, "updated_at": _now()}

    if display_name is not None:
        record["display_name"] = display_name
    elif current:
        record["display_name"] = current.get("display_name")

    if language is not None:
        resolved = resolve_language(language, settings.default_language)
        record["language"] = resolved.english_name
        record["language_code"] = resolved.code
    elif current:
        record["language"] = current.get("language")
        record["language_code"] = current.get("language_code")
    else:
        resolved = resolve_language(None, settings.default_language)
        record["language"] = resolved.english_name
        record["language_code"] = resolved.code

    merged = {**DEFAULT_ACCESSIBILITY, **(current.get("accessibility") or {})}
    if accessibility is not None:
        merged.update(accessibility)
    record["accessibility"] = merged

    try:
        response = (
            client.table(PROFILES_TABLE).upsert(record, on_conflict="user_id").execute()
        )
    except APIError as exc:
        raise _handle_api_error(exc, "save your preferences") from exc

    rows = response.data or []
    if not rows:
        # Upsert succeeded but returned nothing; read it back rather than guess.
        return get_profile(user_id)

    return _profile_to_dict(rows[0])


def save_document(
    user_id: str,
    original_text: str,
    simplified_text: str | None = None,
    title: str | None = None,
    language: str | None = None,
    answers: dict[str, str] | None = None,
) -> dict:
    """Store a completed document and the answers the user gave for it."""
    client = get_supabase()

    resolved = resolve_language(language, settings.default_language) if language else None

    record: dict[str, Any] = {
        "user_id": user_id,
        "title": title or _derive_title(original_text),
        "original_text": original_text,
        "simplified_text": simplified_text,
        "language": resolved.english_name if resolved else None,
        "answers": answers or {},
    }

    try:
        response = client.table(HISTORY_TABLE).insert(record).execute()
    except APIError as exc:
        raise _handle_api_error(exc, "save this document") from exc

    rows = response.data or []
    if not rows:
        raise UpstreamError(
            "The document could not be saved. Please try again.",
            code="insert_failed",
        )

    row = rows[0]
    return {
        "id": str(row["id"]),
        "user_id": row["user_id"],
        "title": row.get("title"),
        "language": row.get("language"),
        "answers": row.get("answers") or {},
        "created_at": row.get("created_at"),
    }


def _derive_title(original_text: str) -> str:
    """Use the document's own first meaningful line as its history label."""
    for line in original_text.splitlines():
        cleaned = line.strip()
        if len(cleaned) >= 4:
            return cleaned[:120]
    return "Untitled document"
