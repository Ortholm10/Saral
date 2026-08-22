import { Check, ScanLine } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { usePreferences, FONT_SIZES, type FontSize } from '@/context/PreferencesContext'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The three preference controls, shared by the first-run setup screen and the
 * Settings screen so both stay identical. Each writes straight to
 * PreferencesContext / LanguageContext, which persist to localStorage —
 * the effect is visible immediately, with no save step in between.
 */

const PREVIEW_SIZE: Record<FontSize, string> = {
  normal: 'text-lg',
  large: 'text-2xl',
  xlarge: 'text-3xl',
}

/** The size of each option's own label, so the choice previews itself. */
const OPTION_SIZE: Record<FontSize, string> = {
  normal: 'text-base',
  large: 'text-xl',
  xlarge: 'text-3xl',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-foreground mb-3 text-xl font-bold text-balance">{children}</h2>
}

export function LanguagePicker() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <section>
      <SectionHeading>{t.prefs.languageLabel}</SectionHeading>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUPPORTED_LANGUAGES.map((option) => {
          const selected = option.code === language
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setLanguage(option.code)}
              aria-pressed={selected}
              className={cn(
                'focus-visible:ring-ring/50 relative flex min-h-16 items-center justify-center rounded-2xl border-2 px-4 py-3 text-xl font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {/* Each language names itself, in its own script. */}
              {option.nativeName}
              {selected && <Check className="text-primary absolute top-2 right-2 size-4" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function FontSizePicker() {
  const { t } = useLanguage()
  const { fontSize, setFontSize } = usePreferences()

  const labels: Record<FontSize, string> = {
    normal: t.prefs.fontSizeNormal,
    large: t.prefs.fontSizeLarge,
    xlarge: t.prefs.fontSizeXlarge,
  }

  return (
    <section>
      <SectionHeading>{t.prefs.fontSizeLabel}</SectionHeading>
      <div className="grid grid-cols-3 gap-3">
        {FONT_SIZES.map((size) => {
          const selected = size === fontSize
          return (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              aria-pressed={selected}
              className={cn(
                'focus-visible:ring-ring/50 flex min-h-20 items-center justify-center rounded-2xl border-2 px-3 py-3 font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none',
                OPTION_SIZE[size],
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {labels[size]}
            </button>
          )
        })}
      </div>

      {/* Live preview: re-renders the moment a size is picked. */}
      <div className="border-border bg-card mt-3 rounded-2xl border p-5">
        <p className={cn('text-foreground leading-relaxed', PREVIEW_SIZE[fontSize])}>
          {t.prefs.fontPreview}
        </p>
      </div>
    </section>
  )
}

export function LineFocusToggle() {
  const { t } = useLanguage()
  const { lineFocus, setLineFocus } = usePreferences()

  return (
    <section>
      <button
        type="button"
        role="switch"
        aria-checked={lineFocus}
        onClick={() => setLineFocus(!lineFocus)}
        className={cn(
          'focus-visible:ring-ring/50 flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-colors focus-visible:ring-4 focus-visible:outline-none',
          lineFocus ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted',
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl',
            lineFocus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          <ScanLine className="size-6" />
        </span>

        <span className="flex flex-1 flex-col gap-1">
          <span className="text-foreground text-xl font-bold">{t.prefs.lineFocusLabel}</span>
          <span className="text-muted-foreground text-base leading-relaxed">
            {t.prefs.lineFocusHint}
          </span>
        </span>

        <span
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-base font-bold',
            lineFocus
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {lineFocus ? t.prefs.on : t.prefs.off}
        </span>
      </button>
    </section>
  )
}
