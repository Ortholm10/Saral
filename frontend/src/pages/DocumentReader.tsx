import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  Volume2,
  Square,
  Loader2,
  Mic,
  Camera,
  Sparkles,
  Send,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { MicButton, type RecordingState } from '@/components/document/MicButton'
import { LineCompare } from '@/components/document/LineCompare'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import { useSpeech } from '@/hooks/useSpeech'
import { askQuestion, simplifyDocument, type SimplifyResult } from '@/lib/api'
import { autoPlayDelay, pairLines } from '@/lib/lineCompare'
import type { DocumentContext, VoiceAnswerState } from '@/lib/documentFlow'
import { cn } from '@/lib/utils'

const BODY_SIZE: Record<FontSize, string> = {
  normal: 'text-lg sm:text-xl',
  large: 'text-xl sm:text-2xl',
  xlarge: 'text-2xl sm:text-3xl',
}

/** Lines kept bright around the active one when Line Focus is on. */
const FOCUS_RADIUS = 1

type AsyncState = 'idle' | 'loading' | 'failed'

/**
 * Split into lines that keep their offset in the original string, so a
 * SpeechSynthesis word-boundary charIndex can be matched back to one of them.
 * Blank lines are dropped: they carry no text to focus on.
 */
function toLines(text: string): { text: string; start: number; end: number }[] {
  const lines: { text: string; start: number; end: number }[] = []
  let offset = 0
  for (const raw of text.split('\n')) {
    const trimmed = raw.trim()
    if (trimmed) lines.push({ text: raw, start: offset, end: offset + raw.length })
    offset += raw.length + 1 // + the newline itself
  }
  return lines
}

/** Step 2: read the form, explain it, and answer questions about it. */
export default function DocumentReader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { fontSize, lineFocus } = usePreferences()
  const {
    speak,
    cancelSpeech,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    transcript,
    interimTranscript,
    recognitionSupported,
  } = useSpeech(language)

  const incoming = location.state as DocumentContext | null
  const documentText = incoming?.documentText ?? ''

  const [simplified, setSimplified] = useState<SimplifyResult | null>(null)
  const [simplifyOn, setSimplifyOn] = useState(false)
  const [simplifyState, setSimplifyState] = useState<AsyncState>('idle')

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [askState, setAskState] = useState<AsyncState>('idle')
  const [recording, setRecording] = useState<RecordingState>('idle')

  const [activeLine, setActiveLine] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  /** True while Read Aloud is stepping the comparison line by line. */
  const [readingLines, setReadingLines] = useState(false)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  // One call per document: the pairing is derived from data already fetched,
  // never from another request per line or per advance.
  const pairs = useMemo(
    () => pairLines(simplified?.original_lines, simplified?.translated_lines),
    [simplified],
  )
  const compareMode = simplifyOn && pairs !== null
  const totalLines = pairs?.length ?? 0

  const singleColumnText = simplifyOn && simplified ? simplified.simplified_text : documentText
  const lines = useMemo(() => toLines(singleColumnText), [singleColumnText])

  // Spoken questions land in the question box, same as typed ones.
  useEffect(() => {
    if (transcript) setQuestion(transcript)
  }, [transcript])

  useEffect(() => {
    if (!isListening) setRecording((prev) => (prev === 'listening' ? 'idle' : prev))
  }, [isListening])

  const advance = useCallback(() => {
    setActiveLine((current) => {
      if (current >= totalLines - 1) {
        setAutoPlay(false)
        setReadingLines(false)
        return current
      }
      return current + 1
    })
  }, [totalLines])

  // Read Aloud in comparison mode: speak the translated line, then move on when
  // the synthesiser says it has finished. Highlight, translation and audio stay
  // in step without a timer trying to guess how long a sentence takes.
  useEffect(() => {
    if (!readingLines || !compareMode || !pairs) return
    const line = pairs[activeLine]?.translated?.trim()
    if (!line) {
      advance()
      return
    }
    speak(line, { onEnd: advance })
  }, [readingLines, compareMode, pairs, activeLine, speak, advance])

  // Auto-play without audio: dwell on each line for a length-scaled moment.
  useEffect(() => {
    if (!autoPlay || readingLines || !compareMode || !pairs) return
    const line = pairs[activeLine]
    const timer = setTimeout(advance, autoPlayDelay(line?.translated || line?.original || ''))
    return () => clearTimeout(timer)
  }, [autoPlay, readingLines, compareMode, pairs, activeLine, advance])

  // Single-column view: follow the reader down the page while Read Aloud runs.
  useEffect(() => {
    if (compareMode || !isSpeaking || !lineFocus) return
    lineRefs.current[activeLine]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeLine, isSpeaking, lineFocus, compareMode])

  const handleBoundary = useCallback(
    (charIndex: number) => {
      const index = lines.findIndex((line) => charIndex >= line.start && charIndex <= line.end)
      if (index >= 0) setActiveLine(index)
    },
    [lines],
  )

  if (!documentText) return <Navigate to="/documents" replace />

  const stopEverything = () => {
    cancelSpeech()
    setReadingLines(false)
    setAutoPlay(false)
  }

  const handleListenToggle = () => {
    if (isSpeaking || readingLines) {
      stopEverything()
      return
    }
    if (compareMode) {
      // Start narrating the comparison from wherever the user is looking.
      setAutoPlay(false)
      setReadingLines(true)
      return
    }
    speak(singleColumnText, { onBoundary: handleBoundary })
  }

  const handleSimplifyToggle = async () => {
    // Swapping the text swaps the line numbering with it, so reading restarts.
    stopEverything()
    setActiveLine(0)
    if (simplifyOn) {
      setSimplifyOn(false)
      return
    }
    if (simplified) {
      setSimplifyOn(true) // already fetched once; don't spend another call
      return
    }

    setSimplifyState('loading')
    try {
      const result = await simplifyDocument(documentText, language)
      setSimplified(result)
      setSimplifyOn(true)
      setSimplifyState('idle')
    } catch {
      // The original text is still on screen and still readable aloud, so this
      // is a missing extra, not a broken screen.
      setSimplifyState('failed')
    }
  }

  const handleAsk = async () => {
    const asked = question.trim()
    if (!asked) return
    stopEverything()
    setAskState('loading')
    setAnswer(null)
    try {
      const result = await askQuestion(documentText, asked, language)
      setAnswer(result.answer)
      setAskState('idle')
    } catch {
      setAskState('failed')
    }
  }

  const startDictation = () => {
    stopEverything()
    resetTranscript()
    setRecording('listening')
    startListening()
  }

  const goToAnswers = () => {
    stopEverything()
    const state: VoiceAnswerState = {
      documentText,
      simplifiedText: simplified?.simplified_text,
    }
    navigate('/documents/answer', { state })
  }

  const narrating = isSpeaking || readingLines

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-10 sm:px-8">
        <h1 className="text-foreground text-3xl font-bold text-balance">{t.reader.title}</h1>

        <div className="flex flex-wrap gap-3">
          {speechSupported && (
            <button
              type="button"
              onClick={handleListenToggle}
              aria-pressed={narrating}
              className="border-primary/30 bg-card text-primary hover:bg-accent/40 focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
            >
              {narrating ? <Square className="size-5" /> : <Volume2 className="size-5" />}
              {narrating ? t.common.stopListening : t.common.listenToThis}
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleSimplifyToggle()}
            aria-pressed={simplifyOn}
            disabled={simplifyState === 'loading'}
            className={cn(
              'focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:opacity-60',
              simplifyOn
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-primary/30 bg-card text-primary hover:bg-accent/40',
            )}
          >
            {simplifyState === 'loading' ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
            {simplifyState === 'loading'
              ? t.reader.simplifying
              : simplifyOn
                ? t.reader.showOriginal
                : t.reader.simplify}
          </button>
        </div>

        {simplifyState === 'failed' && (
          <p role="status" className="text-muted-foreground text-base">
            {t.reader.simplifyFailed}
          </p>
        )}

        {compareMode && pairs ? (
          <>
            <LineCompare pairs={pairs} activeIndex={activeLine} onSelectLine={setActiveLine} />

            {/* Manual advance is the default; auto-play is opt-in and can be
                stopped at any time, and either is overridden by Read Aloud. */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground mr-1 text-base font-semibold" aria-live="polite">
                {t.reader.lineProgress(activeLine + 1, totalLines)}
              </p>

              <Button
                size="lg"
                variant="outline"
                disabled={activeLine === 0}
                onClick={() => {
                  stopEverything()
                  setActiveLine((current) => Math.max(0, current - 1))
                }}
              >
                <ChevronLeft data-icon="inline-start" />
                {t.reader.prevLine}
              </Button>

              <Button
                size="lg"
                className="shadow-md"
                disabled={activeLine >= totalLines - 1}
                onClick={() => {
                  stopEverything()
                  advance()
                }}
              >
                {t.reader.nextLine}
                <ChevronRight data-icon="inline-end" />
              </Button>

              <button
                type="button"
                role="switch"
                aria-checked={autoPlay}
                onClick={() => {
                  cancelSpeech()
                  setReadingLines(false)
                  setAutoPlay((on) => !on)
                }}
                className={cn(
                  'focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full border-2 px-5 py-3 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none',
                  autoPlay
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary/30 bg-card text-primary hover:bg-accent/40',
                )}
              >
                {autoPlay ? <Pause className="size-5" /> : <Play className="size-5" />}
                {t.reader.autoPlay}
              </button>
            </div>
          </>
        ) : simplifyOn && simplified ? (
          /* Line data was missing or too mismatched to sync — compare whole
             blocks instead of inventing an alignment. */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                {t.reader.originalColumn}
              </h3>
              <div className="border-border bg-card max-h-[45vh] overflow-y-auto rounded-2xl border p-4">
                <p className={cn('text-foreground whitespace-pre-line', BODY_SIZE[fontSize])}>
                  {documentText}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                {t.reader.simpleColumn}
              </h3>
              <div className="border-border bg-card max-h-[45vh] overflow-y-auto rounded-2xl border p-4">
                <p className={cn('text-foreground whitespace-pre-line', BODY_SIZE[fontSize])}>
                  {simplified.simplified_text}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Simplify off: the extracted text on its own, with Line Focus. */
          <div className={cn('text-foreground leading-relaxed', BODY_SIZE[fontSize])}>
            {lines.map((line, index) => {
              const focused = !lineFocus || Math.abs(index - activeLine) <= FOCUS_RADIUS
              const current = lineFocus && index === activeLine
              return (
                <span
                  key={line.start}
                  ref={(node) => {
                    lineRefs.current[index] = node
                  }}
                  onClick={() => setActiveLine(index)}
                  className={cn(
                    'block rounded-sm transition-opacity duration-200',
                    lineFocus && 'cursor-pointer px-2 py-0.5',
                    focused ? 'opacity-100' : 'opacity-30',
                    current && 'bg-highlight text-highlight-foreground',
                  )}
                >
                  {line.text}
                </span>
              )
            })}
          </div>
        )}

        {/* Ask a question about this form. */}
        <section className="border-border bg-card/60 mt-2 flex flex-col gap-4 rounded-2xl border p-5">
          <h2 className="text-foreground text-xl font-bold">{t.reader.askTitle}</h2>

          <textarea
            value={recording === 'listening' && interimTranscript ? interimTranscript : question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t.reader.askPlaceholder}
            rows={2}
            aria-label={t.reader.askTitle}
            className={cn(
              'border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-2xl border px-5 py-4 leading-relaxed focus-visible:ring-4 focus-visible:outline-none',
              BODY_SIZE[fontSize],
            )}
          />

          <div className="flex flex-wrap items-center gap-4">
            {recognitionSupported && (
              <MicButton
                state={recording}
                onStart={startDictation}
                onStop={stopListening}
                labels={{
                  idle: t.voice.tapToSpeak,
                  listening: t.voice.listening,
                  processing: t.voice.processing,
                }}
              />
            )}
            <Button
              size="lg"
              className="shadow-md"
              disabled={!question.trim() || askState === 'loading'}
              onClick={() => void handleAsk()}
            >
              {askState === 'loading' ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Send data-icon="inline-start" />
              )}
              {askState === 'loading' ? t.reader.asking : t.reader.askButton}
            </Button>
          </div>

          {askState === 'failed' && (
            <p role="status" className="text-muted-foreground text-base">
              {t.reader.askFailed}
            </p>
          )}

          {answer && (
            <div className="border-border bg-card rounded-2xl border p-5">
              <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                {t.reader.answerTitle}
              </p>
              <p className={cn('text-foreground leading-relaxed', BODY_SIZE[fontSize])}>
                {answer}
              </p>
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => (isSpeaking ? cancelSpeech() : speak(answer))}
                  className="text-primary mt-3 inline-flex items-center gap-2 text-base font-semibold underline-offset-4 hover:underline"
                >
                  <Volume2 className="size-4" />
                  {t.common.listenToThis}
                </button>
              )}
            </div>
          )}
        </section>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="shadow-md" onClick={goToAnswers}>
            <Mic data-icon="inline-start" />
            {t.reader.answerThisForm}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/documents')}>
            <Camera data-icon="inline-start" />
            {t.reader.newPhoto}
          </Button>
        </div>
      </main>
    </div>
  )
}
