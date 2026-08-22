import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DocumentHistoryList } from '@/components/document/DocumentHistoryList'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import { useDocumentHistory } from '@/hooks/useDocumentHistory'
import { cn } from '@/lib/utils'

const BODY_SIZE: Record<FontSize, string> = {
  normal: 'text-base sm:text-lg',
  large: 'text-lg sm:text-xl',
  xlarge: 'text-xl sm:text-2xl',
}

/**
 * Home base after signing in: start a new document, or revisit a finished one.
 *
 * The history list is the only part that needs the backend, and it is treated
 * as optional — see `useDocumentHistory`, which folds every failure into the
 * same calm empty state a brand new user sees.
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { fontSize } = usePreferences()
  const { user, loading: authLoading } = useAuth()
  const documents = useDocumentHistory(user?.id)

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

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10 sm:px-8">
        {/* Settings lives in SiteHeader now, so it is reachable from every screen. */}
        <h1 className="text-foreground text-3xl font-bold text-balance sm:text-4xl">
          {t.dashboard.title}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="border-primary/20 bg-card flex flex-col items-start gap-4 rounded-3xl border p-7">
            <span className="bg-accent flex size-14 items-center justify-center rounded-full">
              <Camera className="text-accent-foreground size-7" />
            </span>
            <p className={cn('text-muted-foreground text-balance', BODY_SIZE[fontSize])}>
              {t.dashboard.newDocumentHint}
            </p>
            <Button size="xl" className="w-full shadow-md" onClick={() => navigate('/documents')}>
              {t.dashboard.newDocument}
            </Button>
          </Card>
        </motion.div>

        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-2xl font-bold">{t.dashboard.historyTitle}</h2>
          <DocumentHistoryList documents={documents} />
        </section>
      </main>
    </div>
  )
}
