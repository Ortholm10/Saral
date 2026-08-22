import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

const FONT_SIZE_KEY = 'saral.fontSize'
const LINE_FOCUS_KEY = 'saral.lineFocus'

/**
 * Text size the user has chosen for the screens they read answers off.
 * "normal" is already large by app-wide default (see `html { font-size: 18px }`
 * in index.css) — these step up from there, they do not start from a browser default.
 */
export type FontSize = 'normal' | 'large' | 'xlarge'

export const FONT_SIZES: FontSize[] = ['normal', 'large', 'xlarge']

interface PreferencesContextValue {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  /** Dim everything but the line being read, so the eye keeps its place. */
  lineFocus: boolean
  setLineFocus: (enabled: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function isFontSize(value: string | null): value is FontSize {
  return value !== null && (FONT_SIZES as string[]).includes(value)
}

function readStoredFontSize(): FontSize {
  if (typeof window === 'undefined') return 'normal'
  const stored = window.localStorage.getItem(FONT_SIZE_KEY)
  return isFontSize(stored) ? stored : 'normal'
}

function readStoredLineFocus(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(LINE_FOCUS_KEY) === 'true'
}

/**
 * Accessibility preferences that outlive a single document.
 *
 * localStorage is the source of truth, not the profile endpoint: the app has to
 * respect these before sign-in and while the backend is unreachable. Saving to
 * `/api/profile` is a best-effort sync on top, never a precondition.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(readStoredFontSize)
  const [lineFocus, setLineFocusState] = useState<boolean>(readStoredLineFocus)

  const setFontSize = (next: FontSize) => {
    setFontSizeState(next)
    window.localStorage.setItem(FONT_SIZE_KEY, next)
  }

  const setLineFocus = (next: boolean) => {
    setLineFocusState(next)
    window.localStorage.setItem(LINE_FOCUS_KEY, String(next))
  }

  const value = useMemo<PreferencesContextValue>(
    () => ({ fontSize, setFontSize, lineFocus, setLineFocus }),
    [fontSize, lineFocus],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider')
  return ctx
}
