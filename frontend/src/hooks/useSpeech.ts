import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeakOptions {
  /** Called with the character index whenever the browser reports a word boundary — used to drive read-along highlighting. */
  onBoundary?: (charIndex: number) => void
  onEnd?: () => void
  rate?: number
}

interface UseSpeechResult {
  // Text-to-speech (SpeechSynthesis)
  speak: (text: string, options?: SpeakOptions) => void
  cancelSpeech: () => void
  isSpeaking: boolean
  speechSupported: boolean

  // Speech-to-text (SpeechRecognition)
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isListening: boolean
  transcript: string
  interimTranscript: string
  recognitionSupported: boolean
  recognitionError: string | null
}

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

/**
 * Wraps the browser's native Web Speech API (SpeechRecognition +
 * SpeechSynthesis) for a given BCP-47 language code, e.g. "kn-IN".
 * All speech in Saral is handled client-side — nothing here touches the backend.
 */
export function useSpeech(lang: string): UseSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [recognitionError, setRecognitionError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const recognitionSupported = typeof window !== 'undefined' && !!getRecognitionConstructor()

  // Voice lists load asynchronously in most browsers.
  useEffect(() => {
    if (!speechSupported) return
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [speechSupported])

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel()
      recognitionRef.current?.abort()
    }
  }, [speechSupported])

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!speechSupported || !text.trim()) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = options?.rate ?? 0.95

      const matchingVoice = voicesRef.current.find((voice) => voice.lang === lang)
      const looseMatch = voicesRef.current.find((voice) =>
        voice.lang.startsWith(lang.split('-')[0]),
      )
      if (matchingVoice ?? looseMatch) {
        utterance.voice = matchingVoice ?? looseMatch ?? null
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        options?.onEnd?.()
      }
      utterance.onerror = () => setIsSpeaking(false)
      utterance.onboundary = (event) => {
        if (event.name === 'word') options?.onBoundary?.(event.charIndex)
      }

      window.speechSynthesis.speak(utterance)
    },
    [lang, speechSupported],
  )

  const cancelSpeech = useCallback(() => {
    if (!speechSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [speechSupported])

  const startListening = useCallback(() => {
    const RecognitionCtor = getRecognitionConstructor()
    if (!RecognitionCtor) return

    setRecognitionError(null)
    setInterimTranscript('')

    const recognition = new RecognitionCtor()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => {
      setRecognitionError(event.error)
      setIsListening(false)
    }
    recognition.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalChunk += result[0].transcript
        else interimChunk += result[0].transcript
      }
      if (finalChunk) setTranscript((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk).trim())
      setInterimTranscript(interimChunk)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    speak,
    cancelSpeech,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    transcript,
    interimTranscript,
    recognitionSupported,
    recognitionError,
  }
}
