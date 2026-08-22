import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, PartyPopper, RotateCcw, Square, Volume2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import { useSpeech } from '@/hooks/useSpeech'
import { buildSpokenSummary, type ConfirmationState, type VoiceAnswerState } from '@/lib/documentFlow'
import { cn } from '@/lib/utils'

const ANSWER_SIZE: Record<FontSize, string> = {
  normal: 'text-lg sm:text-xl',
  large: 'text-xl sm:text-2xl',
  xlarge: 'text-2xl sm:text-3xl',
}

/**
 * Step 4: read the answers back and let the user accept or redo them.
 *
 * Takes either answer shape. A structured set is listed question by question so
 * it is obvious which answer belongs where; a single open answer keeps the plain
 * summary it always had. "Read aloud" narrates whichever shape it was given.
 */
export default function Confirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { fontSize } = usePreferences()
  const { speak, cancelSpeech, isSpeaking, speechSupported } = useSpeech(language)
  const [accepted, setAccepted] = useState(false)

  const incoming = location.state as ConfirmationState | null

  if (!incoming?.result) return <Navigate to="/documents" replace />

  const { result, documentText, simplifiedText } = incoming

  const handleListenToggle = () => {
    if (isSpeaking) {
      cancelSpeech()
      return
    }
    speak(buildSpokenSummary(result, t.confirm.notAnswered))
  }

  /** Back into the Voice Answer flow, keeping every answer the user liked. */
  const redo = (startIndex = 0) => {
    cancelSpeech()
    const state: VoiceAnswerState =
      result.mode === 'structured'
        ? {
            documentText,
            simplifiedText,
            fields: result.fields,
            answers: result.answers,
            startIndex,
          }
        : // An empty field list is how the Voice Answer screen recognises the
          // open-ended flow, so a redo skips extraction and reopens as it was.
          { documentText, simplifiedText, fields: [], openAnswer: result.answer }
    navigate('/documents/answer', { state, replace: true })
  }

  if (accepted) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-5 py-14 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-accent flex size-20 items-center justify-center rounded-full"
          >
            <PartyPopper className="text-accent-foreground size-10" />
          </motion.div>
          <h1 className="text-foreground text-3xl font-bold text-balance">
            {t.confirm.doneTitle}
          </h1>
          <p className="text-muted-foreground text-lg text-balance">{t.confirm.doneBody}</p>
          <div className="flex w-full flex-col gap-3 sm:flex-row-reverse sm:justify-center">
            <Button size="lg" className="shadow-md" onClick={() => navigate('/documents')}>
              {t.confirm.startAnother}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
              {t.confirm.goHome}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold text-balance">{t.confirm.title}</h1>
          <p className="text-muted-foreground text-lg text-balance">{t.confirm.subtitle}</p>
        </div>

        {speechSupported && (
          <button
            type="button"
            onClick={handleListenToggle}
            aria-pressed={isSpeaking}
            className="border-primary/30 bg-card text-primary hover:bg-accent/40 focus-visible:ring-ring/50 inline-flex items-center justify-center gap-3 self-start rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
          >
            {isSpeaking ? <Square className="size-5" /> : <Volume2 className="size-5" />}
            {isSpeaking ? t.common.stopListening : t.common.listenToThis}
          </button>
        )}

        {result.mode === 'structured' ? (
          <ul className="flex flex-col gap-3">
            {result.fields.map((field, position) => {
              const answer = result.answers[field.field_name]?.trim()
              return (
                <li
                  key={field.field_name}
                  className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-5"
                >
                  <p className="text-muted-foreground text-base font-semibold">
                    {field.field_name}
                  </p>
                  <p
                    className={cn(
                      'leading-relaxed',
                      ANSWER_SIZE[fontSize],
                      answer ? 'text-foreground font-semibold' : 'text-muted-foreground italic',
                    )}
                  >
                    {answer || t.confirm.notAnswered}
                  </p>
                  <button
                    type="button"
                    onClick={() => redo(position)}
                    className="text-primary inline-flex items-center gap-2 self-start text-base font-semibold underline-offset-4 hover:underline"
                  >
                    <RotateCcw className="size-4" />
                    {t.confirm.redo}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="border-border bg-card rounded-2xl border p-5">
            <p className={cn('text-foreground leading-relaxed', ANSWER_SIZE[fontSize])}>
              {result.answer}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            size="lg"
            className="flex-1 shadow-md"
            onClick={() => {
              cancelSpeech()
              setAccepted(true)
            }}
          >
            <Check data-icon="inline-start" />
            {t.confirm.yes}
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={() => redo(0)}>
            <X data-icon="inline-start" />
            {t.confirm.no}
          </Button>
        </div>
      </main>
    </div>
  )
}
