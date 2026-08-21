"""Conversational agent endpoint: free-form questions about a document."""

from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import AskRequest, AskResponse
from app.services import agent as agent_service

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post(
    "/ask",
    response_model=AskResponse,
    summary="Answer a question about the user's document",
)
async def ask(payload: AskRequest) -> AskResponse:
    """Answer a question about the document, in the user's own language.

    The answer is grounded in the document text only. If the document does not
    contain the answer, the agent says so rather than inventing one - a wrong
    confident answer about a government form is worse than no answer.

    Stateless by design: the frontend already holds the document text, so it
    passes it with each question. That keeps the demo resilient to a page
    reload mid-conversation.
    """
    result = await agent_service.answer_question(
        payload.document_text, payload.question, payload.language
    )
    return AskResponse(**result)
