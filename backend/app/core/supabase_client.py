"""Lazily-created Supabase client.

The client is built on first use rather than at import, so the API still boots
(and every non-database endpoint still works) when credentials are absent.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings
from app.core.errors import ConfigurationError

logger = logging.getLogger("saral.supabase")


@lru_cache(maxsize=1)
def _build_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase() -> Client:
    """Return the shared Supabase client.

    Raises:
        ConfigurationError: if SUPABASE_URL / SUPABASE_KEY are not set, or the
            client cannot be constructed.
    """
    if not settings.supabase_configured:
        raise ConfigurationError(
            "The database is not configured on this server.",
            hint="Set SUPABASE_URL and SUPABASE_KEY in backend/.env, then restart the server.",
        )
    try:
        return _build_client()
    except Exception as exc:  # noqa: BLE001 - surfaced as a clean API error
        logger.exception("Could not create the Supabase client")
        raise ConfigurationError(
            "Could not connect to the database.",
            hint="Check that SUPABASE_URL and SUPABASE_KEY in backend/.env are correct.",
        ) from exc


def supabase_health() -> dict:
    """Cheap, non-throwing status probe used by /api/health."""
    if not settings.supabase_configured:
        return {"configured": False, "reachable": False}
    try:
        get_supabase()
    except ConfigurationError:
        return {"configured": True, "reachable": False}
    return {"configured": True, "reachable": True}
