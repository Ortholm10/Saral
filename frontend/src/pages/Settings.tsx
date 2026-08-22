import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DocumentHistoryList } from '@/components/document/DocumentHistoryList'
import {
  FontSizePicker,
  LanguagePicker,
  LineFocusToggle,
} from '@/components/preferences/PreferenceControls'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentHistory } from '@/hooks/useDocumentHistory'
import { saveProfile } from '@/lib/api'

/**
 * Settings: the same three controls as first-run setup, plus saved documents
 * and sign-out.
 *
 * The controls read from PreferencesContext, which is backed by localStorage,
 * so they open already showing the user's current values — there is nothing to
 * load and nothing to reset. Saving to `/api/profile` is best-effort on top,
 * exactly as on the setup screen.
 */
export default function Settings() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { fontSize } = usePreferences()
  const { user, loading: authLoading, signOut } = useAuth()
  const documents = useDocumentHistory(user?.id)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (authLoading) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="text-primary size-10 animate-spin" />
        </main>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveProfile(user.id, {
        language,
        accessibility: { large_text: fontSize !== 'normal' },
      })
    } catch {
      // Already saved on this device by the controls themselves.
    }
    setSaving(false)
    // The confirmation is the same either way: the preference did take effect.
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-lg" aria-label={t.settings.back} onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-foreground text-3xl font-bold text-balance sm:text-4xl">
            {t.settings.title}
          </h1>
        </div>

        <LanguagePicker />
        <FontSizePicker />
        <LineFocusToggle />

        <Button
          size="lg"
          className="shadow-md"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saved ? <Check data-icon="inline-start" /> : null}
          {saved ? t.settings.saved : t.settings.save}
        </Button>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-2xl font-bold">{t.settings.savedDocuments}</h2>
          <DocumentHistoryList documents={documents} />
        </section>

        <Button
          size="lg"
          variant="destructive"
          className="mt-2"
          onClick={() => void handleSignOut()}
        >
          <LogOut data-icon="inline-start" />
          {t.settings.logOut}
        </Button>
      </main>
    </div>
  )
}
