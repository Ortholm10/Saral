// Client for the FastAPI backend. Only OCR, language AI and persistence go
// through here — audio in/out is handled entirely client-side via the Web Speech API.
//
// The backend returns one error shape for every failure:
//   { "error": { "code": "...", "message": "...", "hint": "..." } }
// so `ApiError.message` is always something that can be shown, or read aloud,
// to the user rather than an HTML traceback.

import type { LanguageCode } from '@/lib/i18n'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/** Long enough for a Gemini round-trip, short enough that nobody stares at a spinner forever. */
const DEFAULT_TIMEOUT_MS = 30_000

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  /** Developer-facing detail from the backend. Never shown to the user. */
  readonly hint?: string

  constructor(message: string, options: { code: string; status: number; hint?: string }) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code
    this.status = options.status
    this.hint = options.hint
  }

  /** True when the call never got a verdict — offline, timed out, or aborted. */
  get isUnreachable(): boolean {
    return this.code === 'timeout' || this.code === 'network_error'
  }
}

interface RequestOptions {
  timeoutMs?: number
  /** Aborts the request early, e.g. when the screen unmounts. */
  signal?: AbortSignal
}

async function request<T>(
  path: string,
  init: RequestInit,
  { timeoutMs = DEFAULT_TIMEOUT_MS, signal }: RequestOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('The app is not connected to its server.', {
      code: 'not_configured',
      status: 0,
      hint: 'Set VITE_API_BASE_URL in frontend/.env, then restart the dev server.',
    })
  }

  const controller = new AbortController()
  const abort = () => controller.abort()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    abort()
  }, timeoutMs)
  signal?.addEventListener('abort', abort, { once: true })

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal })
  } catch (error) {
    // fetch only rejects for transport failures; an HTTP error status resolves.
    if (timedOut) {
      throw new ApiError('The server took too long to answer. Please try again.', {
        code: 'timeout',
        status: 0,
      })
    }
    if (signal?.aborted) {
      throw new ApiError('The request was cancelled.', { code: 'aborted', status: 0 })
    }
    throw new ApiError('Could not reach the server. Please check your connection.', {
      code: 'network_error',
      status: 0,
      hint: error instanceof Error ? error.message : undefined,
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }

  if (!response.ok) {
    let payload: { error?: { code?: string; message?: string; hint?: string } } | null = null
    try {
      payload = await response.json()
    } catch {
      // A proxy or crash can return HTML. Fall through to the generic message.
    }
    throw new ApiError(payload?.error?.message ?? 'Something went wrong. Please try again.', {
      code: payload?.error?.code ?? `http_${response.status}`,
      status: response.status,
      hint: payload?.error?.hint,
    })
  }

  return (await response.json()) as T
}

/**
 * The backend takes a language name or an ISO code; our UI codes are BCP-47
 * ("kn-IN"), so drop the region. `resolve_language` recognises the rest.
 */
export function toBackendLanguage(language: LanguageCode): string {
  return language.split('-')[0]
}

export interface OcrResult {
  text: string
  char_count: number
  word_count: number
  languages_used: string[]
  mean_confidence: number | null
  warnings: string[]
}

export async function uploadDocument(file: File, options?: RequestOptions): Promise<OcrResult> {
  const body = new FormData()
  body.append('file', file)
  // OCR shells out to Tesseract over a full-page photo; give it room.
  return request<OcrResult>('/api/documents/upload', { method: 'POST', body }, {
    timeoutMs: 60_000,
    ...options,
  })
}

export interface SimplifyResult {
  simplified_text: string
  language: string
  language_code: string
  model: string | null
  /**
   * The document split into lines, paired with their translations, for the
   * side-by-side reveal. Optional: older backends omit both, and the Reader
   * falls back to comparing whole blocks rather than forcing an alignment.
   */
  original_lines?: string[]
  translated_lines?: string[]
}

export async function simplifyDocument(
  text: string,
  language: LanguageCode,
  options?: RequestOptions,
): Promise<SimplifyResult> {
  return request<SimplifyResult>(
    '/api/documents/simplify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_language: toBackendLanguage(language) }),
    },
    options,
  )
}

/**
 * The accessibility flags the backend stores. Deliberately narrower than what
 * the app tracks locally: `large_text` is a boolean, so the exact font size and
 * the Line Focus setting stay in localStorage. Nothing is lost — the profile is
 * a sync, not the source of truth.
 */
export interface AccessibilityPreferences {
  speech_rate?: number
  voice_guidance?: boolean
  high_contrast?: boolean
  large_text?: boolean
}

export interface ProfileResult {
  user_id: string
  display_name: string | null
  language: string
  language_code: string
  accessibility: Required<AccessibilityPreferences>
  created_at: string | null
  updated_at: string | null
}

/** Read saved preferences. 404 (`profile_not_found`) means onboarding has not run. */
export async function fetchProfile(
  userId: string,
  options?: RequestOptions,
): Promise<ProfileResult> {
  return request<ProfileResult>(
    `/api/profile?user_id=${encodeURIComponent(userId)}`,
    { method: 'GET' },
    { timeoutMs: 10_000, ...options },
  )
}

/** Save preferences. Omitted fields keep whatever the server already has. */
export async function saveProfile(
  userId: string,
  payload: {
    display_name?: string
    language?: LanguageCode
    accessibility?: AccessibilityPreferences
  },
  options?: RequestOptions,
): Promise<ProfileResult> {
  return request<ProfileResult>(
    '/api/profile',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        display_name: payload.display_name,
        language: payload.language ? toBackendLanguage(payload.language) : undefined,
        accessibility: payload.accessibility,
      }),
    },
    { timeoutMs: 10_000, ...options },
  )
}

export interface DocumentHistoryItem {
  id: string
  user_id: string
  title: string | null
  language: string | null
  answers: Record<string, string>
  created_at: string | null
}

/**
 * The user's finished documents, newest first.
 *
 * The listing route is not implemented on the backend yet; it follows the shape
 * of `GET /api/profile?user_id=` so it will work unchanged once it lands. Until
 * then this throws, and the Dashboard shows its empty state — which is the same
 * thing it shows for a user who genuinely has no documents.
 */
export async function fetchDocumentHistory(
  userId: string,
  options?: RequestOptions,
): Promise<DocumentHistoryItem[]> {
  const result = await request<DocumentHistoryItem[] | { documents: DocumentHistoryItem[] }>(
    `/api/documents/history?user_id=${encodeURIComponent(userId)}`,
    { method: 'GET' },
    { timeoutMs: 10_000, ...options },
  )
  return Array.isArray(result) ? result : (result.documents ?? [])
}

export interface AskResult {
  answer: string
  language: string
  language_code: string
  model: string | null
}

/** Answer a free-form question about the document, grounded in its text. */
export async function askQuestion(
  documentText: string,
  question: string,
  language: LanguageCode,
  options?: RequestOptions,
): Promise<AskResult> {
  return request<AskResult>(
    '/api/agent/ask',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_text: documentText,
        question,
        language: toBackendLanguage(language),
      }),
    },
    options,
  )
}

export type FieldType = 'text' | 'date' | 'number' | 'address' | 'name'

/** One question the Voice Answer screen asks out loud. */
export interface ExtractedField {
  field_name: string
  field_type: FieldType
}

interface ExtractFieldsResult {
  fields: ExtractedField[]
}

/**
 * List the questions this form asks the person to answer.
 *
 * An empty array is a normal, successful result — it means no fillable field
 * could be identified, and the caller should fall back to the open-ended flow.
 * Callers should treat a thrown error the same way: there is always a working
 * flow to fall back to, so field extraction never needs to block the user.
 */
export async function extractFields(
  text: string,
  options?: RequestOptions,
): Promise<ExtractedField[]> {
  const result = await request<ExtractFieldsResult>(
    '/api/documents/extract-fields',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    },
    options,
  )
  return result.fields ?? []
}
