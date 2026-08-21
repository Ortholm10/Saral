"""Pydantic request/response schemas for the Saral API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class OcrResponse(BaseModel):
    """Result of running OCR over an uploaded form photo."""

    text: str = Field(..., description="Raw text extracted from the image.")
    char_count: int = Field(..., description="Number of characters extracted.")
    word_count: int = Field(..., description="Number of words extracted.")
    languages_used: list[str] = Field(
        ..., description="Tesseract language packs actually used, e.g. ['eng']."
    )
    mean_confidence: float | None = Field(
        None, description="Average per-word OCR confidence, 0-100. Under ~60 means a poor scan."
    )
    warnings: list[str] = Field(
        default_factory=list,
        description="Non-fatal notes for the user, e.g. a blurry photo or a missing language pack.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "APPLICATION FOR NEW RATION CARD\n\nName of applicant:",
                "char_count": 52,
                "word_count": 8,
                "languages_used": ["eng"],
                "mean_confidence": 91.4,
                "warnings": [],
            }
        }
    }


class HealthResponse(BaseModel):
    """Dependency status, so the demo machine can be checked before going on stage."""

    status: str
    ocr: dict
    supabase: dict
    gemini: dict


class SimplifyRequest(BaseModel):
    """Ask for a document to be explained in the user's own language."""

    text: str = Field(
        ...,
        min_length=1,
        description="Document text to explain, normally straight from /api/documents/upload.",
    )
    target_language: str | None = Field(
        None,
        description=(
            "Language name or ISO code, e.g. 'Kannada' or 'kn'. "
            "Defaults to the server's DEFAULT_LANGUAGE."
        ),
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "APPLICATION FOR NEW RATION CARD\nAnnual household income (Rs.):",
                "target_language": "Kannada",
            }
        }
    }


class SimplifyResponse(BaseModel):
    """A plain-language explanation, already translated, ready to be spoken."""

    simplified_text: str = Field(
        ..., description="Plain-language explanation in the target language. No markdown."
    )
    language: str = Field(..., description="Resolved language name, e.g. 'Kannada'.")
    language_code: str = Field(..., description="Resolved ISO code, e.g. 'kn'.")
    model: str | None = Field(None, description="Gemini model that produced this.")


class TranslateRequest(BaseModel):
    """Pure translation, in either direction."""

    text: str = Field(..., min_length=1, description="Text to translate verbatim.")
    target_language: str = Field(
        ...,
        description=(
            "Language name or ISO code. Use 'English' to store a spoken answer, "
            "or the user's language to read a summary back to them."
        ),
    )

    model_config = {
        "json_schema_extra": {
            "example": {"text": "ನನ್ನ ಹೆಸರು ರೇಹಾನ್", "target_language": "English"}
        }
    }


class TranslateResponse(BaseModel):
    translated_text: str = Field(..., description="The translation, with nothing added.")
    language: str = Field(..., description="Resolved language name.")
    language_code: str = Field(..., description="Resolved ISO code.")
    model: str | None = Field(None, description="Gemini model that produced this.")


class AskRequest(BaseModel):
    """A free-form question about a document the user has photographed."""

    document_text: str = Field(
        ..., min_length=1, description="The document the question is about."
    )
    question: str = Field(..., min_length=1, description="The user's spoken question.")
    language: str | None = Field(
        None, description="Language to answer in. Defaults to DEFAULT_LANGUAGE."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "document_text": "APPLICATION FOR NEW RATION CARD\n8. Annual household income (Rs.):",
                "question": "ಆದಾಯ ಎಷ್ಟು ಬರೆಯಬೇಕು?",
                "language": "Kannada",
            }
        }
    }


class AskResponse(BaseModel):
    answer: str = Field(..., description="Short spoken-style answer, grounded in the document.")
    language: str = Field(..., description="Resolved language name.")
    language_code: str = Field(..., description="Resolved ISO code.")
    model: str | None = Field(None, description="Gemini model that produced this.")


class AccessibilityPreferences(BaseModel):
    """How the frontend should present itself for this user."""

    speech_rate: float = Field(
        1.0, ge=0.5, le=2.0, description="Speech synthesis rate. 1.0 is normal."
    )
    voice_guidance: bool = Field(True, description="Read every screen aloud automatically.")
    high_contrast: bool = Field(False, description="Use the high-contrast theme.")
    large_text: bool = Field(False, description="Use the enlarged text size.")


class ProfileUpdateRequest(BaseModel):
    """Create or update a user's language and accessibility preferences."""

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Stable id for this user or device, chosen by the frontend.",
    )
    display_name: str | None = Field(None, max_length=200, description="What to call the user.")
    language: str | None = Field(
        None, description="Preferred language, name or ISO code, e.g. 'Kannada' or 'kn'."
    )
    accessibility: AccessibilityPreferences | None = Field(
        None, description="Omit to leave existing preferences untouched."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "device-8f2a1c",
                "display_name": "Rehan",
                "language": "Kannada",
                "accessibility": {"speech_rate": 0.9, "voice_guidance": True},
            }
        }
    }


class ProfileResponse(BaseModel):
    user_id: str
    display_name: str | None = None
    language: str = Field(..., description="Preferred language name, e.g. 'Kannada'.")
    language_code: str = Field(..., description="Preferred language ISO code, e.g. 'kn'.")
    accessibility: AccessibilityPreferences
    created_at: str | None = None
    updated_at: str | None = None


class DocumentHistoryRequest(BaseModel):
    """Save a completed document and the answers the user gave."""

    user_id: str = Field(..., min_length=1, max_length=128)
    title: str | None = Field(
        None, max_length=300, description="Short label for the document, shown in history."
    )
    original_text: str = Field(..., min_length=1, description="Text as extracted by OCR.")
    simplified_text: str | None = Field(
        None, description="The plain-language version that was read to the user."
    )
    language: str | None = Field(None, description="Language the user worked in.")
    answers: dict[str, str] = Field(
        default_factory=dict,
        description="Field label to answer, stored in English for later reuse.",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "device-8f2a1c",
                "title": "Ration card application",
                "original_text": "APPLICATION FOR NEW RATION CARD ...",
                "simplified_text": "ಇದು ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್ ಅರ್ಜಿ ...",
                "language": "Kannada",
                "answers": {"Full name of head of family": "Rehan Ismail Ahmed"},
            }
        }
    }


class DocumentHistoryResponse(BaseModel):
    id: str = Field(..., description="Id of the saved record.")
    user_id: str
    title: str | None = None
    language: str | None = None
    answers: dict[str, str] = Field(default_factory=dict)
    created_at: str | None = None
