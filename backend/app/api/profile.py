"""User language and accessibility preferences."""

from __future__ import annotations

from fastapi import APIRouter, Query
from starlette.concurrency import run_in_threadpool

from app.models.schemas import ProfileResponse, ProfileUpdateRequest
from app.services import storage

router = APIRouter(prefix="/api", tags=["profile"])


@router.get(
    "/profile",
    response_model=ProfileResponse,
    summary="Read a user's saved preferences",
    responses={404: {"description": "No profile yet - run onboarding."}},
)
async def read_profile(
    user_id: str = Query(
        ...,
        min_length=1,
        max_length=128,
        description="The stable device or user id the frontend generated.",
    ),
) -> ProfileResponse:
    """Return the user's language and accessibility settings.

    Returns 404 with code `profile_not_found` the first time a device is seen.
    That is the frontend's cue to ask which language the user wants, then POST
    it back here.
    """
    profile = await run_in_threadpool(storage.get_profile, user_id)
    return ProfileResponse(**profile)


@router.post(
    "/profile",
    response_model=ProfileResponse,
    summary="Create or update a user's preferences",
)
async def update_profile(payload: ProfileUpdateRequest) -> ProfileResponse:
    """Save preferences, merging with whatever is already stored.

    Fields left out are kept as they are, so the frontend can change one
    setting - the speech rate, say - without resending the whole profile.
    """
    accessibility = (
        payload.accessibility.model_dump() if payload.accessibility is not None else None
    )
    profile = await run_in_threadpool(
        storage.upsert_profile,
        payload.user_id,
        payload.display_name,
        payload.language,
        accessibility,
    )
    return ProfileResponse(**profile)
