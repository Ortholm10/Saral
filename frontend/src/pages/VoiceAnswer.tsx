import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { MicButton, type RecordingState } from '@/components/document/MicButton'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import { useSpeech } from '@/hooks/useSpeech'
import { extractFields, type ExtractedField } from '@/lib/api'
import type { AnswerSet, ConfirmationState, VoiceAnswerState } from '@/lib/documentFlow'
import { cn } from '@/lib/utils'

/**
 * How long to wait for the question list before giving up and using the
 * open-ended flow. Shorter than the backend's own Gemini timeout on purpose:
 * a fallback the user gets quickly beats a walkthrough they wait a minute for.
 */
const EXTRACT_TIMEOUT_MS = 25_000

const QUESTION_SIZE: Record<FontSize, string> = {
  normal: 'text-2xl sm:text-3xl',
  large: 'text-3xl sm:text-4xl',
  xlarge: 'text-4xl sm:text-5xl',
}

const ANSWER_SIZE: Record<FontSize, string> = {
  normal: 'text-lg sm:text-xl',
  large: 'text-xl sm:text-2xl',
  xlarge: 'text-2xl sm:text-3xl',
}

/** Answers are keyed by field_name, so the same question twice would collide. */
function dedupeByName(fields: ExtractedField[]): ExtractedField[] {
  const seen = new Set<string>()
  return fields.filter((field) => {
    const name = field.field_name.trim()
    if (!name || seen.has(name)) return false
    seen.add(name)
    return true
  })
}

/** Where a transcript arriving from the recogniser belongs. */
type Target = { kind: 'field'; name: string } | { kind: 'open' }

type Mode = 'loading' | 'structured' | 'open'

/**
 * Step 3: collect the user's answers by voice.
 *
 * Two modes, chosen by what the backend can find in the document:
 *  - structured: walk the extracted fields one question at a time
 *  - open: a single free-form answer
 *
 * The open mode is also the fallback for every failure of field extraction —
 * empty result, error, or timeout. The user is never told extraction was tried,
 * because from where they sit nothing went wrong: the screen simply asks in a
 * more general way.
 */
export default function VoiceAnswer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { fontSize } = usePreferences()
  const {
    speak,
    cancelSpeech,
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    transcript,
    interimTranscript,
    recognitionSupported,
    recognitionError,
  } = useSpeech(language)

  const incoming = location.state as VoiceAnswerState | null
  const documentText = incoming?.documentText ?? ''

  // `fields` present in the incoming state means we have been here before —
  // the user came back from Confirmation to redo something. Reuse it rather
  // than paying for a second extraction, and keep the answers they liked.
  const [mode, setMode] = useState<Mode>(() => {
    if (!incoming?.fields) return 'loading'
    return incoming.fields.length > 0 ? 'structured' : 'open'
  })
  const [fields, setFields] = useState<ExtractedField[]>(() => incoming?.fields ?? [])
  const [index, setIndex] = useState(() => incoming?.startIndex ?? 0)
  const [answers, setAnswers] = useState<Record<string, string>>(() => incoming?.answers ?? {})
  const [openAnswer, setOpenAnswer] = useState(() => incoming?.openAnswer ?? '')
  const [recording, setRecording] = useState<RecordingState>('idle')

  const targetRef = useRef<Target | null>(null)
  const currentField: ExtractedField | undefined = fields[index]

  // Ask the backend which questions this form asks, before showing any input.
  useEffect(() => {
    if (mode !== 'loading' || !documentText) return
    let ignore = false
    const controller = new AbortController()

    extractFields(documentText, { timeoutMs: EXTRACT_TIMEOUT_MS, signal: controller.signal })
      .then((result) => {
        if (ignore) return
        const usable = dedupeByName(result)
        setFields(usable)
        setMode(usable.length > 0 ? 'structured' : 'open')
      })
      .catch(() => {
        // Deliberately silent. There is always a working flow to fall back to,
        // so a failure here is never worth putting in front of the user.
        if (!ignore) setMode('open')
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [mode, documentText])

  // Read each question aloud as it comes up, and start it with a clean slate.
  // `targetRef` is deliberately left pointing at the previous field: a result
  // that arrives late still belongs to the question it was recorded for.
  useEffect(() => {
    if (mode !== 'structured' || !currentField) return
    resetTranscript()
    speak(currentField.field_name)
  }, [mode, currentField, speak, resetTranscript])

  // File a finished transcript against whatever was being recorded when it
  // started — a late result must never land on the question we have moved on to.
  useEffect(() => {
    const target = targetRef.current
    if (!transcript || !target) return
    if (target.kind === 'open') setOpenAnswer(transcript)
    else setAnswers((prev) => ({ ...prev, [target.name]: transcript }))
  }, [transcript])

  // The recogniser stops on its own once the user stops talking.
  useEffect(() => {
    if (!isListening) setRecording((prev) => (prev === 'listening' ? 'processing' : prev))
  }, [isListening])

  useEffect(() => {
    if (recording !== 'processing') return
    const timer = setTimeout(() => setRecording('idle'), 400)
    return () => clearTimeout(timer)
  }, [recording, transcript])

  const beginRecording = useCallback(
    (target: Target) => {
      cancelSpeech() // never let the question be recorded as the answer
      targetRef.current = target
      resetTranscript()
      setRecording('listening')
      startListening()
    },
    [cancelSpeech, resetTranscript, startListening],
  )

  const endRecording = useCallback(() => {
    stopListening()
    setRecording('processing')
  }, [stopListening])

  if (!documentText) return <Navigate to="/documents" replace />

  const finish = (result: AnswerSet) => {
    cancelSpeech()
    const state: ConfirmationState = {
      documentText,
      simplifiedText: incoming?.simplifiedText,
      result,
    }
    navigate('/documents/confirm', { state })
  }

  const micLabels = {
    idle: t.voice.tapToSpeak,
    listening: t.voice.listening,
    processing: t.voice.processing,
  }

  // Typing is offered whenever speech input is unavailable, so neither a
  // browser without SpeechRecognition nor a refused mic can dead-end the flow.
  const showTyping = !recognitionSupported || recognitionError !== null

  if (mode === 'loading') {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-5 py-14 text-center">
          <Loader2 className="text-primary size-12 animate-spin" />
          <p className="text-foreground text-2xl font-semibold" aria-live="polite">
            {t.voice.preparing}
          </p>
        </main>
      </div>
    )
  }

  if (mode === 'open') {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-8 px-5 py-12 text-center sm:px-8">
          <div className="flex flex-col gap-3">
            <h1 className={cn('text-foreground font-bold text-balance', QUESTION_SIZE[fontSize])}>
              {t.voice.openTitle}
            </h1>
            <p className="text-muted-foreground text-lg text-balance">{t.voice.openHint}</p>
          </div>

          {recognitionSupported && (
            <MicButton
              state={recording}
              onStart={() => beginRecording({ kind: 'open' })}
              onStop={endRecording}
              labels={micLabels}
            />
          )}

          {showTyping && (
            <p className="text-muted-foreground text-base">{t.voice.micUnsupported}</p>
          )}

          <textarea
            value={recording === 'listening' && interimTranscript ? interimTranscript : openAnswer}
            onChange={(event) => setOpenAnswer(event.target.value)}
            placeholder={t.voice.typeHere}
            rows={5}
            aria-label={t.voice.typeHere}
            className={cn(
              'border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-2xl border px-5 py-4 leading-relaxed focus-visible:ring-4 focus-visible:outline-none',
              ANSWER_SIZE[fontSize],
            )}
          />

          <div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
            <Button
              size="lg"
              className="flex-1 shadow-md"
              disabled={!openAnswer.trim()}
              onClick={() => finish({ mode: 'open', answer: openAnswer.trim() })}
            >
              {t.voice.finish}
              <Check data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              <ArrowLeft data-icon="inline-start" />
              {t.voice.back}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Structured mode.
  if (!currentField) return <Navigate to="/documents" replace />

  const answer = answers[currentField.field_name] ?? ''
  const isLast = index === fields.length - 1
  const progress = ((index + 1) / fields.length) * 100

  /** Leave the current question tidily, whichever direction we are going. */
  const leaveQuestion = () => {
    if (isListening) stopListening()
    setRecording('idle')
  }

  const goBack = () => {
    // Answers already given are kept — moving back never discards later ones.
    leaveQuestion()
    if (index > 0) setIndex(index - 1)
    else navigate(-1)
  }

  const goNext = () => {
    leaveQuestion()
    if (isLast) finish({ mode: 'structured', fields, answers })
    else setIndex(index + 1)
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-7 px-5 py-10 text-center sm:px-8">
        <div className="w-full">
          <p className="text-muted-foreground text-base font-semibold" aria-live="polite">
            {t.voice.questionProgress(index + 1, fields.length)}
          </p>
          <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        <motion.h1
          key={currentField.field_name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('text-foreground font-bold text-balance', QUESTION_SIZE[fontSize])}
        >
          {currentField.field_name}
        </motion.h1>

        <button
          type="button"
          onClick={() => speak(currentField.field_name)}
          className="text-primary hover:bg-accent/40 focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
        >
          <Volume2 className="size-5" />
          {t.voice.repeat}
        </button>

        {recognitionSupported && (
          <MicButton
            state={recording}
            onStart={() => beginRecording({ kind: 'field', name: currentField.field_name })}
            onStop={endRecording}
            labels={micLabels}
          />
        )}

        {/* The transcript, shown back for the user to check before moving on. */}
        {(answer || (recording === 'listening' && interimTranscript)) && (
          <div className="border-border bg-card w-full rounded-2xl border p-5 text-left">
            <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              {t.voice.yourAnswer}
            </p>
            <p
              className={cn(
                'text-foreground leading-relaxed',
                ANSWER_SIZE[fontSize],
                recording === 'listening' && !answer && 'text-muted-foreground italic',
              )}
            >
              {recording === 'listening' && interimTranscript ? interimTranscript : answer}
            </p>
            {answer && recording === 'idle' && (
              <button
                type="button"
                onClick={() => beginRecording({ kind: 'field', name: currentField.field_name })}
                className="text-primary mt-3 inline-flex items-center gap-2 text-base font-semibold underline-offset-4 hover:underline"
              >
                <RotateCcw className="size-4" />
                {t.voice.reRecord}
              </button>
            )}
          </div>
        )}

        {showTyping && (
          <div className="w-full text-left">
            <p className="text-muted-foreground mb-2 text-base">{t.voice.micUnsupported}</p>
            <textarea
              value={answer}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [currentField.field_name]: event.target.value }))
              }
              placeholder={t.voice.typeHere}
              rows={3}
              aria-label={t.voice.typeHere}
              className={cn(
                'border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-2xl border px-5 py-4 leading-relaxed focus-visible:ring-4 focus-visible:outline-none',
                ANSWER_SIZE[fontSize],
              )}
            />
          </div>
        )}

        <div className="mt-auto flex w-full flex-col gap-3 pt-4 sm:flex-row-reverse">
          <Button size="lg" className="flex-1 shadow-md" onClick={goNext}>
            {isLast ? t.voice.finish : t.voice.next}
            {isLast ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={goBack}>
            <ArrowLeft data-icon="inline-start" />
            {t.voice.back}
          </Button>
        </div>
      </main>
    </div>
  )
}
