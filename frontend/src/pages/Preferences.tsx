import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Square, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import {
  FontSizePicker,
  LanguagePicker,
  LineFocusToggle,
} from '@/components/preferences/PreferenceControls'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useSpeech } from '@/hooks/useSpeech'
import { saveProfile } from '@/lib/api'

/**
 * First-run setup, reached straight after signing up.
 *
 * Every control writes to localStorage the moment it is touched, so the user's
 * choices are already safe before they press Continue. The POST to
 * `/api/profile` is a best-effort sync on top: if it fails, times out, or the
 * backend is not running, we carry on to the Dashboard exactly as if it had
 * worked. Nothing here is worth stopping a first-time user for.
 */
export default function Preferences() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { fontSize } = usePreferences()
  const { user } = useAuth()
  const { speak, cancelSpeech, isSpeaking, speechSupported } = useSpeech(language)
  const [saving, setSaving] = useState(false)

  const handleReadPage = () => {
    if (isSpeaking) {
      cancelSpeech()
      return
    }
    speak(
      [
        t.prefs.setupTitle,
        t.prefs.languageLabel,
        t.prefs.fontSizeLabel,
        t.prefs.lineFocusLabel,
        t.prefs.lineFocusHint,
      ].join('. '),
    )
  }

  const handleContinue = async () => {
    cancelSpeech()
    setSaving(true)

    if (user) {
      try {
        await saveProfile(user.id, {
          language,
          // The backend stores a boolean; the exact size lives in localStorage.
          accessibility: { large_text: fontSize !== 'normal' },
        })
      } catch {
        // Preferences are already saved on this device, so there is nothing to
        // recover and nothing to tell the user about.
      }
    }

    setSaving(false)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold text-balance sm:text-4xl">
            {t.prefs.setupTitle}
          </h1>
          <p className="text-muted-foreground text-lg text-balance">{t.prefs.setupSubtitle}</p>
        </div>

        {speechSupported && (
          <button
            type="button"
            onClick={handleReadPage}
            aria-pressed={isSpeaking}
            className="border-primary/30 bg-card text-primary hover:bg-accent/40 focus-visible:ring-ring/50 inline-flex items-center justify-center gap-3 self-start rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
          >
            {isSpeaking ? <Square className="size-5" /> : <Volume2 className="size-5" />}
            {isSpeaking ? t.common.stopListening : t.prefs.readPage}
          </button>
        )}

        <LanguagePicker />
        <FontSizePicker />
        <LineFocusToggle />

        <Button
          size="xl"
          className="mt-2 w-full shadow-md"
          disabled={saving}
          onClick={() => void handleContinue()}
        >
          {t.prefs.continueButton}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </main>
    </div>
  )
}
