import { Mic, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RecordingState = 'idle' | 'listening' | 'processing'

interface MicButtonProps {
  state: RecordingState
  onStart: () => void
  onStop: () => void
  /** Spoken-language labels for each state, from the active translation. */
  labels: { idle: string; listening: string; processing: string }
  disabled?: boolean
}

const stateIcons = {
  idle: Mic,
  listening: Square,
  processing: Loader2,
} as const

/**
 * The one recording control in Saral: a large tap target that carries its own
 * state label, so the flow never depends on the user noticing a separate status
 * line. Both the structured and the open-ended Voice Answer modes use it as-is.
 */
export function MicButton({ state, onStart, onStop, labels, disabled }: MicButtonProps) {
  const Icon = stateIcons[state]
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={isListening ? onStop : onStart}
        disabled={disabled || isProcessing}
        aria-pressed={isListening}
        aria-label={labels[state]}
        className={cn(
          'relative flex size-28 items-center justify-center rounded-full border-2 transition-colors focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60',
          isListening
            ? 'animate-pulse-ring border-primary bg-primary text-primary-foreground'
            : 'border-primary/30 bg-card text-primary hover:bg-accent/40',
        )}
      >
        <Icon className={cn('size-11', isProcessing && 'animate-spin')} />
      </button>
      <p
        aria-live="polite"
        className={cn(
          'text-lg font-semibold',
          isListening ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {labels[state]}
      </p>
    </div>
  )
}
