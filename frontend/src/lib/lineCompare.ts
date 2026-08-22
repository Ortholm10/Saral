// Deciding whether a simplify response can drive the line-by-line reveal.
//
// The two arrays come from a language model, so they are not guaranteed to
// line up. Rather than force a pairing onto mismatched data — which reads as a
// bug to the user, with translations sitting beside the wrong originals — the
// Reader asks here first and falls back to a whole-block comparison when the
// answer is no.

export interface LinePair {
  original: string
  translated: string
}

/**
 * How close the two line counts must be, as a ratio of shorter to longer.
 * 0.75 tolerates a model merging or splitting the odd sentence, while still
 * rejecting the case where one side collapsed to a summary.
 */
const MIN_LENGTH_RATIO = 0.75

/**
 * Pair original lines with their translations, or return null when the data is
 * not good enough to sync line by line.
 *
 * Rejects when either array is missing, when either holds a single element (the
 * whole document as one blob — there is nothing to step through), or when the
 * counts differ by more than `MIN_LENGTH_RATIO`.
 *
 * When it does pair, it zips to the *longer* array and pads the short side with
 * an empty string, so no line of either text is silently dropped.
 */
export function pairLines(
  original: string[] | undefined,
  translated: string[] | undefined,
): LinePair[] | null {
  if (!Array.isArray(original) || !Array.isArray(translated)) return null
  if (original.length <= 1 || translated.length <= 1) return null

  const ratio = Math.min(original.length, translated.length) / Math.max(original.length, translated.length)
  if (ratio < MIN_LENGTH_RATIO) return null

  const total = Math.max(original.length, translated.length)
  const pairs: LinePair[] = []
  for (let index = 0; index < total; index++) {
    pairs.push({
      original: original[index] ?? '',
      translated: translated[index] ?? '',
    })
  }
  return pairs
}

/**
 * How long to dwell on a line during auto-play, in milliseconds.
 *
 * Scaled by length so a long sentence is not whipped away at the same speed as
 * a three-word heading. Only used when Read Aloud is off — when it is on, the
 * speech synthesiser's own `onEnd` decides when to advance.
 */
export function autoPlayDelay(line: string): number {
  const BASE_MS = 2500
  const PER_CHARACTER_MS = 40
  const MAX_MS = 9000
  return Math.min(BASE_MS + line.trim().length * PER_CHARACTER_MS, MAX_MS)
}
