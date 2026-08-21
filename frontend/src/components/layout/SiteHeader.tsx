import { Link } from 'react-router-dom'
import { SaralLogo } from '@/components/SaralLogo'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'

export function SiteHeader() {
  const { t } = useLanguage()

  return (
    <header className="border-border/70 flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-8">
      <Link to="/" className="flex items-center gap-3 focus-visible:outline-none">
        <SaralLogo size={40} />
        <span className="text-foreground text-2xl font-bold tracking-tight">
          {t.common.appName}
        </span>
      </Link>
      <LanguageSwitcher />
    </header>
  )
}
