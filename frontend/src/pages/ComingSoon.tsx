import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useLanguage } from '@/context/LanguageContext'

/** Placeholder for screens not yet built (auth, dashboard, etc). Routed to so links from Landing never dead-end during development. */
export default function ComingSoon() {
  const { t } = useLanguage()

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-5 py-20 text-center">
        <p className="text-muted-foreground text-lg">This screen is under construction.</p>
        <Link to="/">
          <Button size="lg" variant="secondary">
            {t.common.appName}
          </Button>
        </Link>
      </main>
    </div>
  )
}
