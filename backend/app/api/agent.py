from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.agent import guide_user

router = APIRouter()

# ── Guide / Navigation Chatbot ────────────────────────────────────────

class GuideRequest(BaseModel):
    current_screen: str
    question: str
    language: str = "en"
    history: Optional[List[dict]] = None

class GuideResponse(BaseModel):
    reply: str
    suggestions: List[str]
    navigate_to: Optional[str] = None

@router.post("/guide", response_model=GuideResponse)
async def agent_guide(req: GuideRequest):
    try:
        result = await guide_user(
            current_screen=req.current_screen,
            user_question=req.question,
            language=req.language,
            history=req.history or [],
        )
        return GuideResponse(**result)
    except Exception as e:
        print(f"🔴 GUIDE ENDPOINT ERROR: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "GUIDE_AGENT_ERROR",
                    "message": "The guide is having trouble right now.",
                    "hint": "Please try again in a moment.",
                }
            },
        )