import { useEffect, useRef } from 'react'
import { usePreferences, type FontSize } from '@/context/PreferencesContext'
import { useLanguage } from '@/context/LanguageContext'
import type { LinePair } from '@/lib/lineCompare'
import { cn } from '@/lib/utils'

const BODY_SIZE: Record<FontSize, string> = {
  normal: 'text-lg sm:text-xl',
  large: 'text-xl sm:text-2xl',
  xlarge: 'text-2xl sm:text-3xl',
}

/** Lines kept bright either side of the active one when Line Focus is on. */
const FOCUS_RADIUS = 1

/**
 * Scroll a line to the middle of its own column, by setting scrollTop directly.
 * `scrollIntoView` would drag the whole page along with it, which on the mobile
 * stacked layout yanks the user away from the controls.
 */
function centreLine(container: HTMLDivElement | null, line: HTMLElement | null) {
  if (!container || !line) return
  container.scrollTop = line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2
}

interface LineCompareProps {
  pairs: LinePair[]
  activeIndex: number
  onSelectLine: (index: number) => void
}

/**
 * The original text and its translation side by side, with the same line
 * highlighted in both at once.
 *
 * Purely presentational: it renders and scrolls, but never decides when to
 * advance. That belongs to the Reader, which is where Read Aloud lives.
 *
 * Columns stack on narrow screens rather than squeezing — two columns of
 * Kannada at the "very large" text size are unreadable side by side on a phone.
 */
export function LineCompare({ pairs, activeIndex, onSelectLine }: LineCompareProps) {
  const { t } = useLanguage()
  const { fontSize, lineFocus } = usePreferences()

  const leftColumn = useRef<HTMLDivElement>(null)
  const rightColumn = useRef<HTMLDivElement>(null)
  const leftLines = useRef<(HTMLParagraphElement | null)[]>([])
  const rightLines = useRef<(HTMLParagraphElement | null)[]>([])

  // Keep the active line centred in both columns at once.
  useEffect(() => {
    centreLine(leftColumn.current, leftLines.current[activeIndex])
    centreLine(rightColumn.current, rightLines.current[activeIndex])
  }, [activeIndex])

  const renderColumn = (
    side: 'original' | 'translated',
    columnRef: React.RefObject<HTMLDivElement | null>,
    lineRefs: React.MutableRefObject<(HTMLParagraphElement | null)[]>,
  ) => (
    <div className="flex min-w-0 flex-col gap-2">
      <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        {side === 'original' ? t.reader.originalColumn : t.reader.simpleColumn}
      </h3>
      <div
        ref={columnRef}
        className="border-border bg-card relative max-h-[45vh] overflow-y-auto rounded-2xl border p-4"
      >
        {pairs.map((pair, index) => {
          const active = index === activeIndex
          const near = !lineFocus || Math.abs(index - activeIndex) <= FOCUS_RADIUS
          return (
            <p
              key={index}
              ref={(node) => {
                lineRefs.current[index] = node
              }}
              onClick={() => onSelectLine(index)}
              className={cn(
                'cursor-pointer rounded-md px-2 py-1 leading-relaxed transition-all duration-200',
                BODY_SIZE[fontSize],
                near ? 'opacity-100' : 'opacity-30',
                active
                  ? 'bg-highlight text-highlight-foreground font-semibold'
                  : 'text-foreground',
              )}
            >
              {side === 'original' ? pair.original : pair.translated}
            </p>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {renderColumn('original', leftColumn, leftLines)}
      {renderColumn('translated', rightColumn, rightLines)}
    </div>
  )
}
