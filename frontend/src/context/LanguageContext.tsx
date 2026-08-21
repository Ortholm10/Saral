import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_LANGUAGE,
  translations,
  type LanguageCode,
  type Translation,
} from '@/lib/i18n'

const STORAGE_KEY = 'saral.language'

interface LanguageContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && stored in translations) return stored as LanguageCode
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage)

  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: translations[language] }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
