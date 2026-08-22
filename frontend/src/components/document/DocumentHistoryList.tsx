import { FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import type { DocumentHistoryItem } from '@/lib/api'
import { cn } from '@/lib/utils'

const BODY_SIZE: Record<FontSize, string> = {
  normal: 'text-base sm:text-lg',
  large: 'text-lg sm:text-xl',
  xlarge: 'text-xl sm:text-2xl',
}

/** Documents are labelled by date, not by time — the hour is noise here. */
function formatDate(iso: string | null, language: string): string {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Renders the three states of a history list: loading, empty, and populated.
 * Shared by the Dashboard and Settings so both look and behave identically.
 */
export function DocumentHistoryList({
  documents,
}: {
  documents: DocumentHistoryItem[] | null
}) {
  const { language, t } = useLanguage()
  const { fontSize } = usePreferences()

  if (documents === null) {
    return (
      <div className="text-muted-foreground flex items-center gap-3 py-6">
        <Loader2 className="size-5 animate-spin" />
        <p aria-live="polite" className={BODY_SIZE[fontSize]}>
          {t.dashboard.historyLoading}
        </p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <Card className="border-border/70 bg-card/60 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
        <FileText className="text-muted-foreground size-8" />
        <p className={cn('text-muted-foreground text-balance', BODY_SIZE[fontSize])}>
          {t.dashboard.historyEmpty}
        </p>
      </Card>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((document) => (
        <li key={document.id}>
          <Card className="border-border bg-card flex flex-col gap-1 rounded-2xl border p-5">
            <p className={cn('text-foreground font-semibold', BODY_SIZE[fontSize])}>
              {document.title || t.dashboard.historyTitle}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatDate(document.created_at, language)}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
