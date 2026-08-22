# Saral - Backend

Voice-first help for understanding and filling government and banking forms in
your own Indian language.

This service does OCR, language AI (Google Gemini) and persistence (Supabase).
**Speech recognition and speech synthesis are not here** - they run in the
browser via the Web Speech API.

## The flow this backend supports

1. User photographs a form -> `POST /api/documents/upload` returns the raw text.
2. That text is simplified **and** translated in one Gemini call -> `POST /api/documents/simplify`.
3. The form is broken into the questions it actually asks -> `POST /api/documents/extract-fields`,
   so the Voice Answer screen can walk the user through it one question at a time.
4. The user asks free-form questions about the document -> `POST /api/agent/ask`.
5. Spoken answers are translated back to English for storage -> `POST /api/translate`.
6. The finished form is saved -> `POST /api/documents/history`.

## Prerequisites

- **Python 3.10+** (developed and tested on 3.14)
- **Tesseract OCR engine** - the `pytesseract` package is only a wrapper; the
  binary is a separate install.
- A **Supabase** project (URL + key)
- A **Google Gemini** API key - https://aistudio.google.com/apikey

### Installing Tesseract on Windows

```powershell
winget install UB-Mannheim.TesseractOCR
```

This needs administrator rights, so approve the UAC prompt when it appears.
It installs to `C:\Program Files\Tesseract-OCR\` and the app finds it there
automatically - no PATH edit needed. If you install somewhere else, set
`TESSERACT_CMD` in `.env` to the full path of `tesseract.exe`.

Verify with:

```powershell
& "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
```

#### Reading Kannada text off the page

The default install only recognises English. To also read printed Kannada,
download `kan.traineddata` from
https://github.com/tesseract-ocr/tessdata/blob/main/kan.traineddata into
`C:\Program Files\Tesseract-OCR\tessdata\`, then set in `.env`:

```
OCR_LANGUAGES=eng+kan
```

Note this is only about recognising Kannada **printed on the form**. Producing
Kannada output for the user is Gemini's job and needs no language pack.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Then create your `.env`:

```powershell
copy .env.example .env
```

and fill in `SUPABASE_URL`, `SUPABASE_KEY` and `GEMINI_API_KEY`. Every other
setting in the file is optional and has a working default. `.env` is gitignored
- keep it that way.

`SUPABASE_URL` must be the bare project URL, `https://<project>.supabase.co`,
not the REST URL. If you paste one ending in `/rest/v1`, the server trims it and
logs a warning rather than failing with an unhelpful "Invalid path" error.

### Creating the database tables

Open your Supabase project, go to **SQL Editor -> New query**, paste the
contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This
creates `profiles` and `document_history`.

Until you do, `/api/profile` and `/api/documents/history` return
503-style guidance (`schema_missing`) telling you exactly this. Every other
endpoint works without the database.

## Running the server

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

- Interactive API docs: http://localhost:8000/docs
- Dependency check: http://localhost:8000/api/health

`/api/health` reports whether Tesseract, Supabase and Gemini are each wired up.
**Check it before demoing** - it catches a missing key or a missing OCR engine
in one request.

## Endpoints

| Method | Path | Purpose | Needs | Status |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Dependency status | - | Done |
| POST | `/api/documents/upload` | Photo -> extracted text (OCR) | Tesseract | Done |
| POST | `/api/documents/simplify` | Text -> simplified + translated | Gemini | Done |
| POST | `/api/documents/extract-fields` | Text -> the questions the form asks | Gemini | Done |
| POST | `/api/translate` | Pure translation | Gemini | Done |
| POST | `/api/agent/ask` | Free-form Q&A about a document | Gemini | Done |
| GET/POST | `/api/profile` | Language + accessibility preferences | Supabase | Done |
| POST | `/api/documents/history` | Save a processed document | Supabase | Done |

### `POST /api/documents/upload`

`multipart/form-data`:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `file` | file | yes | JPG, PNG, WEBP, BMP or TIFF, up to `MAX_UPLOAD_MB`. |
| `languages` | text | no | Tesseract packs, e.g. `eng+kan`. Defaults to `OCR_LANGUAGES`. Missing packs are skipped with a warning, never an error. |

```powershell
curl.exe -X POST http://localhost:8000/api/documents/upload -F "file=@form.jpg"
```

```json
{
  "text": "APPLICATION FOR NEW RATION CARD\n\nName of applicant:",
  "char_count": 52,
  "word_count": 8,
  "languages_used": ["eng"],
  "mean_confidence": 91.4,
  "warnings": []
}
```

`mean_confidence` is the average per-word OCR confidence (0-100). Below about
60 the scan is poor, and a warning is added telling the user to retake the
photo - worth surfacing in the UI before spending a Gemini call on bad text.

### `POST /api/documents/simplify`

```json
{ "text": "APPLICATION FOR NEW RATION CARD ...", "target_language": "Kannada" }
```

Returns `simplified_text` (plain language, already translated, no markdown),
plus `language`, `language_code` and `model`. Simplification and translation
happen in one Gemini call, so the user waits once and the wording stays
consistent.

It also returns the same explanation split for a side-by-side view:

```json
{
  "simplified_text": "...",
  "original_lines": ["APPLICATION FOR NEW RATION CARD", "1. Name of head of family:"],
  "translated_lines": ["ಇದು ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್ ...", "ಇಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬದ ..."]
}
```

`original_lines` and `translated_lines` are always the same length, and entry
`i` of each describes the same piece of content, so the two can be shown line
against line. Blank lines are dropped from both sides - OCR sprinkles them
unpredictably and Gemini will not reproduce them.

**A length of 1 means the lines could not be matched up.** Gemini merged two
lines, split one, or added a remark of its own, and there is no honest way to
say which line pairs with which - guessing would put the wrong translation
beside the wrong original. Both arrays then hold the whole text as a single
element, which is the frontend's cue to show one side-by-side block instead of
a line-by-line view. A one-line document lands here too, which is the right
outcome for it.

`simplified_text` is unchanged and still carries the full explanation, so a
caller that ignores the two new arrays keeps working exactly as before.

`target_language` accepts a name or an ISO code: `Kannada`, `kn`, `Hindi`,
`hi`, and so on. An unlisted language is passed through to Gemini as written.

### `POST /api/documents/extract-fields`

```json
{ "text": "APPLICATION FOR NEW RATION CARD\n1. Name of head of family:\n2. Date of birth:" }
```

Returns the questions this form actually asks, in the order they appear:

```json
{
  "fields": [
    { "field_name": "What is the name of the head of your family?", "field_type": "name" },
    { "field_name": "What is your date of birth?", "field_type": "date" }
  ]
}
```

This is what lets the Voice Answer screen walk the user through a form one
question at a time instead of reading one long blob at them.

Only blanks the person has to fill in themselves come back. Titles, section
headings, instructions, penalty warnings, signature boxes and anything already
printed on the form (the office address, a reference number the office assigns)
are all left out. Each field is phrased as a spoken question rather than copied
as a raw label, so the frontend can read it straight out: `DOB:` comes back as
"What is your date of birth?".

`field_type` is one of `text`, `date`, `number`, `address`, `name`, chosen as
the closest match. Anything unrecognised is reported as `text`, which the
frontend can always prompt for.

**An empty `fields` array is a successful `200`, not an error.** It means no
fillable field could be identified - a public notice, a scrap of text, a scan
too garbled to read - and it is the frontend's cue to fall back to the
open-ended flow. Anything unusable from Gemini degrades to `[]` the same way,
because failing loudly here would take away a fallback the user could otherwise
have had. Genuine failures (Gemini unreachable, rate-limited, or not
configured) still return the normal error shape.

Field names come back in English. Run them through `/api/translate` to speak
them in the user's language, which also keeps stored answers in English for
`/api/documents/history`.

### `POST /api/translate`

```json
{ "text": "ನನ್ನ ಹೆಸರು ರೇಹಾನ್", "target_language": "English" }
```

Returns `translated_text`. Faithful translation only - nothing is simplified,
shortened or explained, because a stored answer must survive round-tripping.
Names and places are transliterated rather than translated, and numbers,
dates and identifiers are left exactly as given.

### `POST /api/agent/ask`

```json
{
  "document_text": "APPLICATION FOR NEW RATION CARD ...",
  "question": "BPL ಅಂದರೆ ಏನು?",
  "language": "Kannada"
}
```

Returns a short `answer` in the requested language. Two rules shape it:

- Anything specific to the document - fees, dates, deadlines, eligibility - is
  answered only from the document. If it is not in there, the agent says so and
  suggests who to ask, rather than inventing a number.
- Standard official terms printed on the form (APL, BPL, Antyodaya, Aadhaar,
  the name of an Act) are explained in one sentence, because the person is
  asking precisely because the form does not explain them.

Stateless: the frontend passes the document text with each question, so a page
reload mid-conversation loses nothing.

### `GET /api/profile?user_id=...` and `POST /api/profile`

Saral has no login - asking someone who cannot read to type a password would
defeat the point - so `user_id` is a stable id the frontend generates per
device.

`GET` returns 404 `profile_not_found` the first time a device is seen. That is
the cue to ask the user which language they want, then `POST` it back.

```json
{
  "user_id": "device-8f2a1c",
  "display_name": "Rehan",
  "language": "kn",
  "accessibility": { "speech_rate": 0.9, "large_text": true }
}
```

`POST` merges: fields you leave out keep their stored values, so the frontend
can change the speech rate alone without resending the whole profile.

### `POST /api/documents/history`

Saves a finished form and the answers given for it, returning `201` with the
new record's `id`. Store answers in English (run them through
`/api/translate` first) so a later form can be pre-filled from them without the
user repeating their name and address.

## Error format

Every failure - expected or not - comes back with the same shape and an HTTP
status, so the frontend can read `error.message` aloud without special-casing:

```json
{
  "error": {
    "code": "no_text_found",
    "message": "No text could be read from that image.",
    "hint": "Hold the camera steady, fill the frame with the page, and make sure the document is well lit."
  }
}
```

| Status | When |
| --- | --- |
| 400 | Bad upload: empty, too large, or an unsupported file type |
| 404 | No such record |
| 422 | Request failed validation, or OCR found no text |
| 429 | Gemini's free tier rate-limited us |
| 502 | Gemini or Supabase failed |
| 503 | A dependency is not configured on the server (missing key or binary) |

Nothing raises at import time, so the server always starts. A missing
credential becomes a clean 503 on the endpoints that need it, and the rest of
the API keeps working.

## Project layout

```
backend/
  app/
    api/        FastAPI routers (one file per resource)
    core/       config, error types + handlers, Supabase client
    models/     Pydantic request/response schemas
    services/   business logic: OCR, Gemini, persistence
    main.py     app factory, CORS, router registration
  requirements.txt
  .env.example
```

## Troubleshooting

**503 `not_configured` from `/api/documents/upload`** - Tesseract is not
installed or not found. Check `/api/health` -> `ocr.binary`, then either
install it or set `TESSERACT_CMD`.

**422 `no_text_found`** - OCR ran but the photo had no readable text. Usually
blur, glare, or the page not filling the frame.

**CORS errors in the browser** - the frontend origin must be listed in
`CORS_ORIGINS`. The default covers Vite on port 5173 only.

**The first variable in `.env` seems to be ignored** - the file was probably
saved with a BOM. This is already handled (the loader uses `utf-8-sig`), but if
you write your own loader, watch for it.
