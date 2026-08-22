import { Link } from 'react-router-dom'
import { Settings as SettingsIcon } from 'lucide-react'
import { SaralLogo } from '@/components/SaralLogo'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export function SiteHeader() {
  const { t } = useLanguage()
  const { user } = useAuth()

  return (
    <header className="border-border/70 flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-8">
      {/* Signed in, the wordmark goes to the dashboard rather than the marketing page. */}
      <Link
        to={user ? '/dashboard' : '/'}
        className="flex items-center gap-3 focus-visible:outline-none"
      >
        <SaralLogo size={40} />
        <span className="text-foreground text-2xl font-bold tracking-tight">
          {t.common.appName}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {/* Settings reachable from every screen in the flow, not just the dashboard. */}
        {user && (
          <Link to="/settings" aria-label={t.dashboard.settings}>
            <Button variant="ghost" size="icon-lg">
              <SettingsIcon />
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
