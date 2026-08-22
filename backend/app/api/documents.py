"""Document endpoints: OCR upload, simplification, field extraction, and history."""

from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile
from starlette.concurrency import run_in_threadpool

from app.models.schemas import (
    DocumentHistoryRequest,
    DocumentHistoryResponse,
    ExtractFieldsRequest,
    ExtractFieldsResponse,
    OcrResponse,
    SimplifyRequest,
    SimplifyResponse,
)
from app.services import agent, ocr, storage

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post(
    "/upload",
    response_model=OcrResponse,
    summary="Extract text from a photo of a form",
)
async def upload_document(
    file: UploadFile = File(..., description="Photo of the form (JPG, PNG, WEBP, BMP or TIFF)."),
    languages: str | None = Form(
        None,
        description=(
            "Optional Tesseract language packs, '+'-joined (e.g. 'eng+kan'). "
            "Defaults to OCR_LANGUAGES from the server config. Packs that are "
            "not installed are skipped with a warning rather than failing."
        ),
    ),
) -> OcrResponse:
    """Step 1 of the Saral flow: read the printed text off the user's document.

    The extracted text is returned as-is; simplification and translation happen
    in a separate call so the frontend can show progress between the two.
    """
    raw = await file.read()
    ocr.validate_upload(file.filename, file.content_type, len(raw))

    # pytesseract shells out to a binary, so keep it off the event loop.
    result = await run_in_threadpool(ocr.extract_text, raw, languages)

    return OcrResponse(
        text=result.text,
        char_count=result.char_count,
        word_count=result.word_count,
        languages_used=result.languages_used,
        mean_confidence=result.mean_confidence,
        warnings=result.warnings,
    )


@router.post(
    "/simplify",
    response_model=SimplifyResponse,
    summary="Explain a document in plain language, translated",
)
async def simplify_document(payload: SimplifyRequest) -> SimplifyResponse:
    """Step 2 of the Saral flow: make the document understandable.

    Simplification and translation happen in a single Gemini call, so the user
    waits once rather than twice and the wording stays consistent.
    """
    result = await agent.simplify_and_translate(payload.text, payload.target_language)
    return SimplifyResponse(**result)


@router.post(
    "/extract-fields",
    response_model=ExtractFieldsResponse,
    summary="List the questions this form asks the user to answer",
)
async def extract_document_fields(payload: ExtractFieldsRequest) -> ExtractFieldsResponse:
    """Turn a form into questions the Voice Answer screen asks one at a time.

    Only the blanks the person has to fill in themselves come back - titles,
    instructions and anything already printed on the form are left out. Each
    field is phrased as a spoken question, so the frontend can read it straight
    out ("What is your date of birth?" rather than "DOB:").

    An empty `fields` array is a successful response, not an error. It means no
    fillable field could be identified, and it is the frontend's cue to fall
    back to the open-ended flow rather than show the user a failure.
    """
    fields = await agent.extract_fields(payload.text)
    return ExtractFieldsResponse(fields=fields)


@router.post(
    "/history",
    response_model=DocumentHistoryResponse,
    status_code=201,
    summary="Save a completed document and its answers",
)
async def save_history(payload: DocumentHistoryRequest) -> DocumentHistoryResponse:
    """Final step of the Saral flow: keep a record of what the user filled in.

    Answers are stored in English (translate them with /api/translate first),
    so a later form can be pre-filled from them without the user having to say
    their name and address all over again.
    """
    record = await run_in_threadpool(
        storage.save_document,
        payload.user_id,
        payload.original_text,
        payload.simplified_text,
        payload.title,
        payload.language,
        payload.answers,
    )
    return DocumentHistoryResponse(**record)
