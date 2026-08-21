"""Pure translation endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import TranslateRequest, TranslateResponse
from app.services import agent

router = APIRouter(prefix="/api", tags=["translate"])


@router.post(
    "/translate",
    response_model=TranslateResponse,
    summary="Translate text without changing its meaning",
)
async def translate(payload: TranslateRequest) -> TranslateResponse:
    """Translate text verbatim, in either direction.

    Used twice in the Saral flow: to turn what the user said into English
    before it is stored, and to read the final confirmation summary back to
    them in their own language. Unlike /api/documents/simplify this does not
    reword or explain anything - an answer must be stored exactly as given.
    """
    result = await agent.translate_text(payload.text, payload.target_language)
    return TranslateResponse(**result)
