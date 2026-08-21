import asyncio
import re
import google.generativeai as genai
from app.core.config import settings

# ── Demo fallback responses (used when Gemini quota is exhausted) ─────

DEMO_RESPONSES = {
    "default": {
        "reply": "I'm here to help you use Saral. You can ask me how to upload a form, fill it out with your voice, or navigate to any screen. What would you like to do?",
        "suggestions": ["How do I upload a form?", "How do I fill a form?", "Where is my profile?"],
        "navigate_to": None,
    },
    "upload": {
        "reply": "To upload a form, tap the orange 'Capture Document' button on your dashboard. Take a clear photo of the form. I will read it aloud in your language and explain each field.",
        "suggestions": ["How do I fill the form?", "Go to dashboard"],
        "navigate_to": "capture",
    },
    "fill": {
        "reply": "After uploading a form, I will read each field aloud. You can answer by speaking into the microphone. I will repeat your answer back to you so you can confirm it is correct.",
        "suggestions": ["How do I upload a form?", "Where is my profile?"],
        "navigate_to": "voice-answer",
    },
    "profile": {
        "reply": "Your profile is in the Settings screen. Tap the menu icon and then 'Settings' to update your language, name, or other details.",
        "suggestions": ["How do I upload a form?", "How do I fill a form?"],
        "navigate_to": "settings",
    },
    "read": {
        "reply": "I can read any screen aloud for you. Right now you are on the dashboard. This screen shows your documents and a button to capture new forms.",
        "suggestions": ["How do I upload a form?", "How do I fill a form?"],
        "navigate_to": None,
    },
}

def _get_demo_response(question: str) -> dict:
    q = question.lower()
    if any(w in q for w in ["upload", "capture", "photo", "document", "picture"]):
        return DEMO_RESPONSES["upload"]
    if any(w in q for w in ["fill", "answer", "voice", "speak", "talk"]):
        return DEMO_RESPONSES["fill"]
    if any(w in q for w in ["profile", "setting", "account", "name"]):
        return DEMO_RESPONSES["profile"]
    if any(w in q for w in ["read", "screen", "aloud", "listen"]):
        return DEMO_RESPONSES["read"]
    return DEMO_RESPONSES["default"]

# ── Health check ──────────────────────────────────────────────────────

def gemini_health() -> dict:
    api_key = getattr(settings, "gemini_api_key", None)
    model_name = getattr(settings, "gemini_model", "gemini-1.5-flash-latest")
    if not api_key:
        return {"configured": False, "model": None, "status": "no_api_key"}
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        model.generate_content("hi", generation_config={"max_output_tokens": 1})
        return {"configured": True, "model": model_name, "status": "ok"}
    except Exception as e:
        return {"configured": True, "model": model_name, "status": f"error: {e}"}

# ── Guide / Navigation Agent ──────────────────────────────────────────

GUIDE_SYSTEM_PROMPT = """You are Saral Guide — a patient, warm navigation helper inside a voice-first accessibility app for Indian users with low vision or low digital literacy.

RULES:
- Use VERY short sentences. One idea per sentence.
- Use plain words. No jargon.
- Be warm, never condescending.
- If the user asks about legal outcomes, DO NOT guess.
- Always respond in the same language the user asked in.
- Keep responses under 120 words.

CURRENT SCREEN CONTEXT: The user is currently on the "{current_screen}" screen.
"""

def _sync_call_gemini(model, contents):
    return model.generate_content(contents)

async def guide_user(
    current_screen: str,
    user_question: str,
    language: str = "en",
    history: list[dict] | None = None,
) -> dict:
    api_key = getattr(settings, "gemini_api_key", None)
    model_name = getattr(settings, "gemini_model", "gemini-1.5-flash-latest")
    
    if not api_key:
        return _get_demo_response(user_question)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=GUIDE_SYSTEM_PROMPT.format(current_screen=current_screen),
    )

    contents = []
    if history:
        for turn in history[-6:]:
            role = "user" if turn.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [turn.get("content", "")]})

    contents.append({"role": "user", "parts": [user_question]})

    try:
        response = await asyncio.to_thread(_sync_call_gemini, model, contents)
        raw = response.text.strip()
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str or "resourceexhausted" in err_str:
            # FALLBACK: return demo response when quota exceeded
            return _get_demo_response(user_question)
        raise

    navigate_to = None
    nav_match = re.search(r'(?i)(?:go to|navigate to|open|visit)\s+([\w\s/]+)', raw)
    if nav_match:
        navigate_to = nav_match.group(1).strip().lower().replace(" ", "-")

    suggestions = [
        l.strip("- •").strip() 
        for l in raw.splitlines() 
        if l.strip().startswith(("-", "•"))
    ][:3]

    return {
        "reply": raw,
        "suggestions": suggestions,
        "navigate_to": navigate_to,
    }