// Minimal ambient typings for the Web Speech API (SpeechRecognition).
// TypeScript's DOM lib ships SpeechSynthesis but not SpeechRecognition, and
// browsers still expose it under the vendor-prefixed `webkitSpeechRecognition`.

export {}

declare global {
  interface SpeechRecognitionEventMap {
    audiostart: Event
    audioend: Event
    end: Event
    error: SpeechRecognitionErrorEvent
    nomatch: SpeechRecognitionEvent
    result: SpeechRecognitionEvent
    soundstart: Event
    soundend: Event
    speechstart: Event
    speechend: Event
    start: Event
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string
    readonly message: string
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
  }

  interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onerror:
      | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown)
      | null
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null
    onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null
    addEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => unknown,
    ): void
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => unknown,
    ): void
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}
