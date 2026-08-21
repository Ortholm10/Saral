import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/context/LanguageContext'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const current = SUPPORTED_LANGUAGES.find((option) => option.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full"
            aria-label={t.common.languageLabel}
          >
            <Languages data-icon="inline-start" />
            {current?.nativeName}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => setLanguage(value as LanguageCode)}
        >
          <DropdownMenuLabel>{t.common.languageLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_LANGUAGES.map((option) => (
            <DropdownMenuRadioItem
              key={option.code}
              value={option.code}
              className="text-base py-2.5"
            >
              <span className="flex w-full items-baseline justify-between gap-3">
                <span>{option.nativeName}</span>
                <span className="text-muted-foreground text-xs">{option.englishName}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
