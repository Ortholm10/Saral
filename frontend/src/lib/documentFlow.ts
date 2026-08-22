// The state that travels along the document flow:
//
//   Capture --(ocr text)--> Reader --(text + explanation)--> Voice Answer
//          --(answers)--> Confirmation --("no, redo")--> Voice Answer
//
// It moves through react-router's location state rather than a store: the flow
// is strictly linear, and a reload landing on an empty screen (rather than a
// stale half-finished form) is the behaviour we want.

import type { ExtractedField } from '@/lib/api'

/** What the Reader hands the Voice Answer screen. */
export interface DocumentContext {
  /** Raw OCR text. This is what field extraction reads. */
  documentText: string
  /** The plain-language explanation the user just heard, if it was produced. */
  simplifiedText?: string
}

/**
 * How the user answered. Both screens downstream accept either shape, so the
 * Confirmation screen does not care which mode the Voice Answer screen ran in.
 */
export type AnswerSet =
  | {
      mode: 'structured'
      /** In form order — the Confirmation screen lists answers in this order. */
      fields: ExtractedField[]
      /** Keyed by `field_name`. A field the user skipped is simply absent. */
      answers: Record<string, string>
    }
  | {
      mode: 'open'
      /** One free-form answer, in whatever way the user chose to give it. */
      answer: string
    }

/** Navigation state for the Voice Answer screen. */
export interface VoiceAnswerState extends DocumentContext {
  /**
   * Fields already extracted on a previous visit. Present only when coming
   * back from Confirmation, so a redo never spends another Gemini call.
   */
  fields?: ExtractedField[]
  /** Answers to keep. Anything the user was happy with survives a redo. */
  answers?: Record<string, string>
  /** Question to open on, so "redo this one" lands on the right question. */
  startIndex?: number
  /** Existing text when returning to redo an open-ended answer. */
  openAnswer?: string
}

/** Navigation state for the Confirmation screen. */
export interface ConfirmationState extends DocumentContext {
  result: AnswerSet
}

/**
 * Flatten an answer set into one string for SpeechSynthesis.
 *
 * Structured answers are read as question-then-answer pairs, so someone
 * listening can tell which answer belongs to which question. Sentence-ending
 * punctuation is added between them because the synthesiser needs it to pause;
 * a run-on string is read as one breathless sentence.
 */
export function buildSpokenSummary(
  result: AnswerSet,
  notAnsweredLabel: string,
): string {
  if (result.mode === 'open') return result.answer

  return result.fields
    .map((field) => {
      const answer = result.answers[field.field_name]?.trim()
      const question = field.field_name.replace(/[.:\s]+$/, '')
      return `${question}. ${answer || notAnsweredLabel}.`
    })
    .join(' ')
}

/** True when there is nothing worth sending on to Confirmation. */
export function isEmptyAnswerSet(result: AnswerSet): boolean {
  if (result.mode === 'open') return result.answer.trim().length === 0
  return Object.values(result.answers).every((answer) => !answer.trim())
}
