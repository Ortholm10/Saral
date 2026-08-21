import { motion } from 'framer-motion'
import { Volume2, Square, ScanLine, Ear, Mic, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useLanguage } from '@/context/LanguageContext'
import { useSpeech } from '@/hooks/useSpeech'

const stepIcons = [ScanLine, Ear, Mic]

export default function Landing() {
  const { language, t } = useLanguage()
  const { speak, cancelSpeech, isSpeaking, speechSupported } = useSpeech(language)

  const spokenSummary = `${t.landing.headline}. ${t.landing.subheadline}`

  const handleListenToggle = () => {
    if (isSpeaking) {
      cancelSpeech()
    } else {
      speak(spokenSummary)
    }
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 py-14 text-center sm:px-8 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance sm:text-5xl">
            {t.landing.headline}
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-balance sm:text-xl">
            {t.landing.subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="mt-9 flex flex-col items-center gap-4"
        >
          {speechSupported && (
            <button
              type="button"
              onClick={handleListenToggle}
              aria-pressed={isSpeaking}
              className="border-primary/30 bg-card text-primary hover:bg-accent/40 focus-visible:ring-ring/50 relative inline-flex items-center gap-3 rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
            >
              {isSpeaking && (
                <span className="bg-primary/10 absolute inset-0 animate-pulse rounded-full" aria-hidden />
              )}
              <span className="relative flex items-center gap-3">
                {isSpeaking ? <Square className="size-5" /> : <Volume2 className="size-5" />}
                {isSpeaking ? t.common.stopListening : t.common.listenToThis}
              </span>
            </button>
          )}

          <Link to="/signup">
            <Button size="xl" className="shadow-md">
              {t.common.getStarted}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>

          <p className="text-muted-foreground text-sm">{t.landing.trustLine}</p>

          <p className="text-muted-foreground text-sm">
            {t.landing.haveAccount}{' '}
            <Link to="/login" className="text-primary font-semibold underline-offset-4 hover:underline">
              {t.landing.logIn}
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {t.landing.steps.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <Card
                key={step}
                className="border-border/70 bg-card/70 flex flex-col items-center gap-3 rounded-2xl border p-6 text-center"
              >
                <span className="bg-accent relative flex size-14 items-center justify-center rounded-full">
                  <Icon className="text-accent-foreground size-7" />
                  <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                </span>
                <p className="text-foreground text-base font-semibold text-balance">{step}</p>
              </Card>
            )
          })}
        </motion.div>
      </main>
    </div>
  )
}
