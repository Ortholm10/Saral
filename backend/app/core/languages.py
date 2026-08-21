"""Language names used when prompting Gemini.

The frontend may send either an ISO code ("kn") or a name ("Kannada"). Both
resolve to the same canonical entry. Anything unrecognised is passed straight
through, so an unlisted language still works - it just does not get the native
script hint in the prompt.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Language:
    code: str
    english_name: str
    native_name: str

    def for_prompt(self) -> str:
        """How the language is named to Gemini, e.g. 'Kannada (ಕನ್ನಡ)'."""
        if self.native_name and self.native_name != self.english_name:
            return f"{self.english_name} ({self.native_name})"
        return self.english_name


# Kannada first: it is the priority language for this build.
_LANGUAGES = (
    Language("kn", "Kannada", "ಕನ್ನಡ"),
    Language("hi", "Hindi", "हिन्दी"),
    Language("ml", "Malayalam", "മലയാളം"),
    Language("ta", "Tamil", "தமிழ்"),
    Language("te", "Telugu", "తెలుగు"),
    Language("mr", "Marathi", "मराठी"),
    Language("bn", "Bengali", "বাংলা"),
    Language("gu", "Gujarati", "ગુજરાતી"),
    Language("pa", "Punjabi", "ਪੰਜਾਬੀ"),
    Language("or", "Odia", "ଓଡ଼ିଆ"),
    Language("as", "Assamese", "অসমীয়া"),
    Language("ur", "Urdu", "اردو"),
    Language("en", "English", "English"),
)

_BY_KEY: dict[str, Language] = {}
for _language in _LANGUAGES:
    _BY_KEY[_language.code] = _language
    _BY_KEY[_language.english_name.lower()] = _language
    _BY_KEY[_language.native_name.lower()] = _language


def resolve_language(value: str | None, default: str = "Kannada") -> Language:
    """Turn a code or name into a Language. Unknown values pass through."""
    raw = (value or default).strip()
    if not raw:
        raw = default

    known = _BY_KEY.get(raw.lower())
    if known:
        return known

    # Unlisted language: use the caller's own wording in the prompt.
    return Language(code=raw.lower()[:5], english_name=raw, native_name="")


def supported_languages() -> list[dict]:
    """The languages the UI can offer in a picker."""
    return [
        {"code": lang.code, "name": lang.english_name, "native_name": lang.native_name}
        for lang in _LANGUAGES
    ]
