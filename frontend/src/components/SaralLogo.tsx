interface SaralLogoProps {
  size?: number
  className?: string
}

/** Bespoke wordmark glyph — a warm gradient disc with a voice waveform, not a stock icon. */
export function SaralLogo({ size = 40, className }: SaralLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Saral"
      className={className}
    >
      <defs>
        <linearGradient id="saral-logo-gradient" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="oklch(0.7 0.14 75)" />
          <stop offset="100%" stopColor="oklch(0.56 0.16 39)" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#saral-logo-gradient)" />
      <rect x="11" y="17" width="3" height="6" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="16.5" y="12" width="3" height="16" rx="1.5" fill="white" />
      <rect x="22" y="15" width="3" height="10" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="27.5" y="18" width="3" height="4" rx="1.5" fill="white" fillOpacity="0.85" />
    </svg>
  )
}
