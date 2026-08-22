import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, Loader2, RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { useLanguage } from '@/context/LanguageContext'
import { uploadDocument, type OcrResult } from '@/lib/api'
import type { DocumentContext } from '@/lib/documentFlow'

/**
 * Below this mean OCR confidence the backend flags the scan as hard to read.
 * Matched to the threshold in `ocr.py`, so the user is warned about exactly the
 * scans the server considers doubtful.
 */
const LOW_CONFIDENCE = 60

type Phase = 'idle' | 'preview' | 'reading' | 'warned' | 'failed'

/** Step 1: photograph the form and pull the printed text off it with OCR. */
export default function DocumentCapture() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<OcrResult | null>(null)

  // Object URLs are a manual resource; release the old one whenever it changes.
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const chooseFile = (chosen: File | undefined) => {
    if (!chosen) return
    setFile(chosen)
    setPreviewUrl(URL.createObjectURL(chosen))
    setResult(null)
    setPhase('preview')
  }

  const retake = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setPhase('idle')
    inputRef.current?.click()
  }

  const goToReader = (text: string) => {
    const state: DocumentContext = { documentText: text }
    navigate('/documents/read', { state })
  }

  const submit = async () => {
    if (!file) return
    setPhase('reading')
    try {
      const ocr = await uploadDocument(file)
      if (!ocr.text.trim()) {
        setPhase('failed')
        return
      }
      setResult(ocr)

      // Only the confidence score is worth stopping for. The other entries in
      // `warnings` are server-configuration notes (missing language packs) that
      // the person holding the phone can do nothing about.
      const hardToRead = ocr.mean_confidence !== null && ocr.mean_confidence < LOW_CONFIDENCE
      if (hardToRead) {
        setPhase('warned')
        return
      }
      goToReader(ocr.text)
    } catch {
      // Any failure here means the same thing to the user: this photo did not
      // work. The specific cause is for the console, not for them.
      setPhase('failed')
    }
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-7 px-5 py-12 text-center sm:px-8">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            chooseFile(event.target.files?.[0])
            // Let the same file be chosen again after a retake.
            event.target.value = ''
          }}
        />

        {phase === 'reading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="text-primary size-12 animate-spin" />
            <p className="text-foreground text-2xl font-semibold" aria-live="polite">
              {t.capture.reading}
            </p>
            <p className="text-muted-foreground text-base">{t.capture.readingHint}</p>
          </motion.div>
        )}

        {phase === 'idle' && (
          <>
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-foreground text-3xl leading-tight font-bold text-balance sm:text-4xl">
                {t.capture.title}
              </h1>
              <p className="text-muted-foreground text-lg text-balance">{t.capture.subtitle}</p>
            </div>
            <Button size="xl" className="shadow-md" onClick={() => inputRef.current?.click()}>
              <Camera data-icon="inline-start" />
              {t.capture.choosePhoto}
            </Button>
          </>
        )}

        {phase === 'failed' && (
          <>
            <p
              role="status"
              className="border-border bg-card text-foreground rounded-2xl border px-5 py-4 text-base text-balance"
            >
              {t.capture.couldNotRead}
            </p>
            <Button size="xl" className="shadow-md" onClick={retake}>
              <RotateCcw data-icon="inline-start" />
              {t.capture.tryAgain}
            </Button>
          </>
        )}

        {/* Preview before submitting, and again alongside a quality warning. */}
        {(phase === 'preview' || phase === 'warned') && previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex w-full flex-col items-center gap-5"
          >
            <img
              src={previewUrl}
              alt={t.capture.previewAlt}
              className="border-border max-h-[45vh] w-full rounded-2xl border object-contain"
            />

            {phase === 'warned' && (
              <div
                role="status"
                className="border-accent bg-accent/25 flex w-full items-start gap-3 rounded-2xl border-2 p-5 text-left"
              >
                <TriangleAlert className="text-accent-foreground mt-0.5 size-6 shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-lg font-bold">{t.capture.lowQualityTitle}</p>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t.capture.lowQualityBody}
                  </p>
                </div>
              </div>
            )}

            <div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
              {phase === 'preview' ? (
                <Button size="lg" className="flex-1 shadow-md" onClick={() => void submit()}>
                  {t.capture.usePhoto}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1 shadow-md"
                  onClick={() => result && goToReader(result.text)}
                >
                  {t.capture.continueAnyway}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="flex-1" onClick={retake}>
                <RotateCcw data-icon="inline-start" />
                {t.capture.retake}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
