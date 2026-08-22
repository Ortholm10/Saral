// Supported UI languages. Kannada is the priority language and the
// product-wide default — every list below keeps it first.
export type LanguageCode = 'kn-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'ml-IN' | 'bn-IN'

export const DEFAULT_LANGUAGE: LanguageCode = 'kn-IN'

export interface LanguageOption {
  code: LanguageCode
  /** Language name written in its own script, for the switcher UI. */
  nativeName: string
  /** English name, used only in developer-facing contexts. */
  englishName: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'kn-IN', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'hi-IN', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'ta-IN', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te-IN', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { code: 'ml-IN', nativeName: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'bn-IN', nativeName: 'বাংলা', englishName: 'Bengali' },
]

export interface Translation {
  common: {
    languageLabel: string
    appName: string
    getStarted: string
    listenToThis: string
    stopListening: string
  }
  landing: {
    headline: string
    subheadline: string
    trustLine: string
    haveAccount: string
    logIn: string
    /** Three short steps: show the form, listen & understand, answer by speaking. */
    steps: [string, string, string]
  }
  auth: {
    loginTitle: string
    loginSubtitle: string
    signupTitle: string
    signupSubtitle: string
    emailLabel: string
    passwordLabel: string
    confirmPasswordLabel: string
    logInButton: string
    signUpButton: string
    noAccount: string
    signUpLink: string
    haveAccount: string
    logInLink: string
    backToHome: string
    showPassword: string
    hidePassword: string
    genericError: string
    passwordMismatch: string
    invalidCredentials: string
    checkEmailTitle: string
    checkEmailBody: string
  }
  prefs: {
    setupTitle: string
    setupSubtitle: string
    languageLabel: string
    fontSizeLabel: string
    fontSizeNormal: string
    fontSizeLarge: string
    fontSizeXlarge: string
    /** Sample sentence under the size picker, so the choice previews itself. */
    fontPreview: string
    lineFocusLabel: string
    lineFocusHint: string
    readPage: string
    on: string
    off: string
    continueButton: string
  }
  dashboard: {
    title: string
    newDocument: string
    newDocumentHint: string
    historyTitle: string
    historyEmpty: string
    historyLoading: string
    settings: string
  }
  settings: {
    title: string
    back: string
    save: string
    saved: string
    savedDocuments: string
    logOut: string
  }
  capture: {
    title: string
    subtitle: string
    choosePhoto: string
    reading: string
    readingHint: string
    couldNotRead: string
    tryAgain: string
    previewAlt: string
    usePhoto: string
    retake: string
    lowQualityTitle: string
    lowQualityBody: string
    continueAnyway: string
  }
  reader: {
    title: string
    explaining: string
    answerThisForm: string
    newPhoto: string
    simplify: string
    showOriginal: string
    simplifying: string
    simplifyFailed: string
    askTitle: string
    askPlaceholder: string
    askButton: string
    asking: string
    askFailed: string
    answerTitle: string
    originalColumn: string
    simpleColumn: string
    nextLine: string
    prevLine: string
    autoPlay: string
    /** e.g. "Line 2 of 9" — word order differs by language, so it is a function. */
    lineProgress: (current: number, total: number) => string
  }
  voice: {
    preparing: string
    /** e.g. "Question 2 of 5" — word order differs by language, so it is a function. */
    questionProgress: (current: number, total: number) => string
    tapToSpeak: string
    listening: string
    processing: string
    yourAnswer: string
    reRecord: string
    repeat: string
    next: string
    back: string
    finish: string
    /** Fallback mode: one open question instead of a walkthrough. */
    openTitle: string
    openHint: string
    typeHere: string
    micUnsupported: string
  }
  confirm: {
    title: string
    subtitle: string
    yes: string
    no: string
    redo: string
    notAnswered: string
    doneTitle: string
    doneBody: string
    startAnother: string
    goHome: string
  }
}

export const translations: Record<LanguageCode, Translation> = {
  'kn-IN': {
    common: {
      languageLabel: 'ಭಾಷೆ',
      appName: 'ಸರಳ್',
      getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
      listenToThis: 'ಇದನ್ನು ಕೇಳಿ',
      stopListening: 'ನಿಲ್ಲಿಸಿ',
    },
    landing: {
      headline: 'ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ, ಮಾತನಾಡುತ್ತಾ ಫಾರ್ಮ್ ತುಂಬಿ',
      subheadline:
        'ಸರಳ್ ಫಾರ್ಮ್‌ಗಳನ್ನು ಓದಿ ಹೇಳುತ್ತದೆ, ಸುಲಭ ಮಾತಿನಲ್ಲಿ ವಿವರಿಸುತ್ತದೆ, ಮತ್ತು ನಿಮ್ಮ ಧ್ವನಿಯಿಂದಲೇ ತುಂಬುತ್ತದೆ. ಬೇರೆಯವರ ಸಹಾಯ ಬೇಕಿಲ್ಲ.',
      trustLine: 'ಬಳಸಲು ಉಚಿತ. ನಿಮ್ಮ ಧ್ವನಿ, ನಿಮ್ಮ ಫಾರ್ಮ್, ನಿಮ್ಮ ಗೌಪ್ಯತೆ.',
      haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      logIn: 'ಲಾಗಿನ್ ಮಾಡಿ',
      steps: ['ಫಾರ್ಮ್ ತೋರಿಸಿ', 'ಕೇಳಿ, ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಿ', 'ಮಾತನಾಡಿ ಉತ್ತರಿಸಿ'],
    },
    auth: {
      loginTitle: 'ಮತ್ತೆ ಸ್ವಾಗತ',
      loginSubtitle: 'ಮುಂದುವರಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ',
      signupTitle: 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ',
      signupSubtitle: 'ಇದಕ್ಕೆ ಒಂದು ನಿಮಿಷ ಸಾಕು',
      emailLabel: 'ಇಮೇಲ್',
      passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
      confirmPasswordLabel: 'ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ',
      logInButton: 'ಲಾಗಿನ್ ಮಾಡಿ',
      signUpButton: 'ಖಾತೆ ರಚಿಸಿ',
      noAccount: 'ಸರಳ್‌ಗೆ ಹೊಸಬರೇ?',
      signUpLink: 'ಖಾತೆ ರಚಿಸಿ',
      haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      logInLink: 'ಲಾಗಿನ್ ಮಾಡಿ',
      backToHome: 'ಹಿಂದೆ',
      showPassword: 'ತೋರಿಸಿ',
      hidePassword: 'ಮರೆಮಾಡಿ',
      genericError: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      passwordMismatch: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.',
      invalidCredentials: 'ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.',
      checkEmailTitle: 'ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ',
      checkEmailBody:
        'ನಾವು ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಖಚಿತೀಕರಣ ಲಿಂಕ್ ಕಳುಹಿಸಿದ್ದೇವೆ. ಖಾತೆ ರಚನೆ ಪೂರ್ಣಗೊಳಿಸಲು ಅದನ್ನು ತೆರೆಯಿರಿ.',
    },
    prefs: {
      setupTitle: 'ನಿಮಗೆ ಅನುಕೂಲವಾಗುವಂತೆ ಹೊಂದಿಸೋಣ',
      setupSubtitle: 'ಇವೆಲ್ಲವನ್ನೂ ನಂತರ ಬದಲಾಯಿಸಬಹುದು.',
      languageLabel: 'ನಿಮಗೆ ಯಾವ ಭಾಷೆ ಬೇಕು?',
      fontSizeLabel: 'ಅಕ್ಷರಗಳು ಎಷ್ಟು ದೊಡ್ಡದಾಗಿರಬೇಕು?',
      fontSizeNormal: 'ಸಾಮಾನ್ಯ',
      fontSizeLarge: 'ದೊಡ್ಡದು',
      fontSizeXlarge: 'ಬಹಳ ದೊಡ್ಡದು',
      fontPreview: 'ಅಕ್ಷರಗಳು ಹೀಗೆ ಕಾಣಿಸುತ್ತವೆ.',
      lineFocusLabel: 'ಸಾಲಿನ ಗಮನ',
      lineFocusHint:
        'ಓದುವಾಗ ಒಂದೊಂದೇ ಸಾಲನ್ನು ಎತ್ತಿ ತೋರಿಸುತ್ತದೆ, ನೀವು ಎಲ್ಲಿದ್ದೀರಿ ಎಂದು ಮರೆಯುವುದಿಲ್ಲ.',
      readPage: 'ಈ ಪುಟವನ್ನು ಓದಿ ಹೇಳಿ',
      on: 'ಆನ್',
      off: 'ಆಫ್',
      continueButton: 'ಮುಂದುವರಿಸಿ',
    },
    dashboard: {
      title: 'ನೀವು ಏನು ಮಾಡಬೇಕು?',
      newDocument: 'ಹೊಸ ಫಾರ್ಮ್ ಓದಿಸಿ',
      newDocumentHint: 'ಫಾರ್ಮಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ, ನಾನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತೇನೆ.',
      historyTitle: 'ನಿಮ್ಮ ಹಿಂದಿನ ಫಾರ್ಮ್‌ಗಳು',
      historyEmpty: 'ಇನ್ನೂ ಯಾವ ಫಾರ್ಮ್ ಇಲ್ಲ. ನೀವು ಮುಗಿಸಿದವು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
      historyLoading: 'ನಿಮ್ಮ ಫಾರ್ಮ್‌ಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ...',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    },
    capture: {
      title: 'ನಿಮ್ಮ ಫಾರ್ಮ್ ತೋರಿಸಿ',
      subtitle: 'ಫೋಟೋ ತೆಗೆಯಿರಿ, ಅಥವಾ ನಿಮ್ಮ ಫೋನಿನಿಂದ ಒಂದನ್ನು ಆರಿಸಿ.',
      choosePhoto: 'ಫೋಟೋ ಆರಿಸಿ',
      reading: 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಓದುತ್ತಿದ್ದೇನೆ...',
      readingHint: 'ಇದಕ್ಕೆ ಕೆಲವು ಸೆಕೆಂಡುಗಳು ಬೇಕು.',
      couldNotRead:
        'ಈ ಫೋಟೋದಲ್ಲಿನ ಅಕ್ಷರಗಳು ಓದಲು ಆಗಲಿಲ್ಲ. ಬೆಳಕಿನಲ್ಲಿ, ಪುಟದ ನೇರ ಮೇಲಿನಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
      tryAgain: 'ಬೇರೆ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ',
      previewAlt: 'ನೀವು ತೆಗೆದ ಫೋಟೋ',
      usePhoto: 'ಈ ಫೋಟೋ ಬಳಸಿ',
      retake: 'ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ',
      lowQualityTitle: 'ಈ ಫೋಟೋ ಓದಲು ಕಷ್ಟವಾಯಿತು',
      lowQualityBody:
        'ಕೆಲವು ಪದಗಳು ತಪ್ಪಾಗಿರಬಹುದು. ಹೆಚ್ಚು ಬೆಳಕಿನಲ್ಲಿ, ಸ್ಪಷ್ಟವಾದ ಫೋಟೋ ತೆಗೆದರೆ ಚೆನ್ನಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',
      continueAnyway: 'ಹೀಗೇ ಮುಂದುವರಿಸಿ',
    },
    reader: {
      title: 'ಈ ಫಾರ್ಮ್ ಏನು ಹೇಳುತ್ತದೆ',
      explaining: 'ಸುಲಭ ಮಾತಿನಲ್ಲಿ ವಿವರಿಸುತ್ತಿದ್ದೇನೆ...',
      answerThisForm: 'ಮಾತನಾಡಿ ಈ ಫಾರ್ಮ್ ತುಂಬಿ',
      newPhoto: 'ಬೇರೆ ಫೋಟೋ ಬಳಸಿ',
      simplify: 'ಸುಲಭ ಮಾಡಿ',
      showOriginal: 'ಮೂಲ ಪಠ್ಯ ತೋರಿಸಿ',
      simplifying: 'ಸುಲಭ ಮಾಡುತ್ತಿದ್ದೇನೆ...',
      simplifyFailed: 'ಸುಲಭ ಆವೃತ್ತಿ ಈಗ ಸಿಗುತ್ತಿಲ್ಲ.',
      askTitle: 'ಈ ಫಾರ್ಮ್ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ',
      askPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ, ಅಥವಾ ಮೈಕ್ ಬಳಸಿ',
      askButton: 'ಕೇಳಿ',
      asking: 'ಉತ್ತರ ಹುಡುಕುತ್ತಿದ್ದೇನೆ...',
      askFailed: 'ಈಗ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲು ಆಗುತ್ತಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
      answerTitle: 'ಉತ್ತರ',
      originalColumn: 'ಮೂಲ ಪಠ್ಯ',
      simpleColumn: 'ಸುಲಭ ಮಾತಿನಲ್ಲಿ',
      nextLine: 'ಮುಂದಿನ ಸಾಲು',
      prevLine: 'ಹಿಂದಿನ ಸಾಲು',
      autoPlay: 'ತಾನಾಗಿಯೇ ನಡೆಸಿ',
      lineProgress: (current, total) => `${total} ರಲ್ಲಿ ${current} ನೇ ಸಾಲು`,
    },
    settings: {
      title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      back: 'ಹಿಂದೆ',
      save: 'ಉಳಿಸಿ',
      saved: 'ಉಳಿಸಲಾಗಿದೆ',
      savedDocuments: 'ನಿಮ್ಮ ಉಳಿಸಿದ ಫಾರ್ಮ್‌ಗಳು',
      logOut: 'ಲಾಗ್ ಔಟ್',
    },
    voice: {
      preparing: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇನೆ...',
      questionProgress: (current, total) => `${total} ರಲ್ಲಿ ${current} ನೇ ಪ್ರಶ್ನೆ`,
      tapToSpeak: 'ಒತ್ತಿ, ನಿಮ್ಮ ಉತ್ತರ ಹೇಳಿ',
      listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ... ನಿಲ್ಲಿಸಲು ಒತ್ತಿ',
      processing: 'ಒಂದು ಕ್ಷಣ...',
      yourAnswer: 'ನಿಮ್ಮ ಉತ್ತರ',
      reRecord: 'ಮತ್ತೆ ಹೇಳಿ',
      repeat: 'ಪ್ರಶ್ನೆ ಮತ್ತೆ ಕೇಳಿ',
      next: 'ಮುಂದೆ',
      back: 'ಹಿಂದೆ',
      finish: 'ಮುಗಿಯಿತು',
      openTitle: 'ನೀವು ಏನು ತುಂಬಬೇಕು ಎಂದು ಹೇಳಿ',
      openHint: 'ನಿಮ್ಮ ಉತ್ತರ ಹೇಳಿ, ಅಥವಾ ಕೆಳಗೆ ಬರೆಯಿರಿ.',
      typeHere: 'ನಿಮ್ಮ ಉತ್ತರ ಇಲ್ಲಿ ಬರೆಯಿರಿ',
      micUnsupported: 'ಈ ಬ್ರೌಸರ್‌ಗೆ ಕೇಳಲು ಆಗುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಉತ್ತರ ಬರೆಯಿರಿ.',
    },
    confirm: {
      title: 'ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
      subtitle: 'ಕೇಳಿ ಅಥವಾ ಓದಿ, ನಂತರ ಸರಿಯಾಗಿದೆಯೇ ಹೇಳಿ.',
      yes: 'ಹೌದು, ಇದು ಸರಿಯಾಗಿದೆ',
      no: 'ಇಲ್ಲ, ಮತ್ತೆ ಮಾಡುತ್ತೇನೆ',
      redo: 'ಮತ್ತೆ ಮಾಡಿ',
      notAnswered: 'ಉತ್ತರಿಸಿಲ್ಲ',
      doneTitle: 'ಎಲ್ಲಾ ಮುಗಿಯಿತು',
      doneBody:
        'ನಿಮ್ಮ ಉತ್ತರಗಳು ಸಿದ್ಧವಾಗಿವೆ. ಅವುಗಳನ್ನು ಫಾರ್ಮಿನಲ್ಲಿ ಬರೆಯಬಹುದು, ಅಥವಾ ಕಚೇರಿಯಲ್ಲಿ ಈ ಪರದೆ ತೋರಿಸಬಹುದು.',
      startAnother: 'ಇನ್ನೊಂದು ಫಾರ್ಮ್ ಪ್ರಾರಂಭಿಸಿ',
      goHome: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ',
    },
  },
  'hi-IN': {
    common: {
      languageLabel: 'भाषा',
      appName: 'सरल',
      getStarted: 'शुरू करें',
      listenToThis: 'इसे सुनें',
      stopListening: 'रोकें',
    },
    landing: {
      headline: 'अपनी भाषा में, बोलकर फॉर्म भरें',
      subheadline:
        'सरल फॉर्म को पढ़कर सुनाता है, आसान भाषा में समझाता है, और आपकी आवाज़ से भरता है। किसी और की मदद की ज़रूरत नहीं।',
      trustLine: 'इस्तेमाल करना मुफ़्त है। आपकी आवाज़, आपका फॉर्म, आपकी गोपनीयता।',
      haveAccount: 'पहले से खाता है?',
      logIn: 'लॉग इन करें',
      steps: ['फॉर्म दिखाएं', 'सुनें, समझें', 'बोलकर जवाब दें'],
    },
    auth: {
      loginTitle: 'वापसी पर स्वागत है',
      loginSubtitle: 'जारी रखने के लिए लॉग इन करें',
      signupTitle: 'अपना खाता बनाएं',
      signupSubtitle: 'इसमें बस एक मिनट लगेगा',
      emailLabel: 'ईमेल',
      passwordLabel: 'पासवर्ड',
      confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
      logInButton: 'लॉग इन करें',
      signUpButton: 'खाता बनाएं',
      noAccount: 'सरल में नए हैं?',
      signUpLink: 'खाता बनाएं',
      haveAccount: 'पहले से खाता है?',
      logInLink: 'लॉग इन करें',
      backToHome: 'वापस',
      showPassword: 'दिखाएं',
      hidePassword: 'छुपाएं',
      genericError: 'कुछ गलत हो गया। कृपया फिर से कोशिश करें।',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते।',
      invalidCredentials: 'ईमेल या पासवर्ड गलत है।',
      checkEmailTitle: 'अपना ईमेल जांचें',
      checkEmailBody:
        'हमने आपके ईमेल पर एक पुष्टिकरण लिंक भेजा है। खाता बनाना पूरा करने के लिए उसे खोलें।',
    },
    prefs: {
      setupTitle: 'आइए आपके हिसाब से सेट करें',
      setupSubtitle: 'यह सब आप बाद में बदल सकते हैं।',
      languageLabel: 'आपको कौन सी भाषा चाहिए?',
      fontSizeLabel: 'अक्षर कितने बड़े होने चाहिए?',
      fontSizeNormal: 'सामान्य',
      fontSizeLarge: 'बड़ा',
      fontSizeXlarge: 'बहुत बड़ा',
      fontPreview: 'अक्षर ऐसे दिखेंगे।',
      lineFocusLabel: 'लाइन फोकस',
      lineFocusHint:
        'पढ़ते समय एक-एक लाइन को उजागर करता है, जिससे आप अपनी जगह नहीं भूलते।',
      readPage: 'यह पन्ना पढ़कर सुनाएं',
      on: 'चालू',
      off: 'बंद',
      continueButton: 'आगे बढ़ें',
    },
    dashboard: {
      title: 'आप क्या करना चाहते हैं?',
      newDocument: 'नया फॉर्म पढ़वाएं',
      newDocumentHint: 'फॉर्म की फोटो लें, मैं आपकी भाषा में समझा दूंगा।',
      historyTitle: 'आपके पिछले फॉर्म',
      historyEmpty: 'अभी कोई फॉर्म नहीं। जो आप पूरे करेंगे वे यहाँ दिखेंगे।',
      historyLoading: 'आपके फॉर्म खोज रहे हैं...',
      settings: 'सेटिंग्स',
    },
    capture: {
      title: 'अपना फॉर्म दिखाएं',
      subtitle: 'फोटो लें, या अपने फोन से एक चुनें।',
      choosePhoto: 'फोटो चुनें',
      reading: 'आपका फॉर्म पढ़ रहे हैं...',
      readingHint: 'इसमें कुछ सेकंड लगेंगे।',
      couldNotRead:
        'इस फोटो के अक्षर पढ़े नहीं जा सके। रोशनी में, पन्ने के सीधे ऊपर से फोटो लें।',
      tryAgain: 'दूसरी फोटो आज़माएं',
      previewAlt: 'आपकी ली हुई फोटो',
      usePhoto: 'यही फोटो इस्तेमाल करें',
      retake: 'दोबारा फोटो लें',
      lowQualityTitle: 'यह फोटो पढ़ने में मुश्किल रही',
      lowQualityBody:
        'कुछ शब्द गलत हो सकते हैं। ज़्यादा रोशनी में ली गई साफ़ फोटो बेहतर काम करेगी।',
      continueAnyway: 'फिर भी आगे बढ़ें',
    },
    reader: {
      title: 'यह फॉर्म क्या कहता है',
      explaining: 'आसान भाषा में समझा रहे हैं...',
      answerThisForm: 'बोलकर यह फॉर्म भरें',
      newPhoto: 'दूसरी फोटो लें',
      simplify: 'आसान करें',
      showOriginal: 'मूल पाठ दिखाएं',
      simplifying: 'आसान कर रहे हैं...',
      simplifyFailed: 'आसान रूप अभी उपलब्ध नहीं है।',
      askTitle: 'इस फॉर्म के बारे में सवाल पूछें',
      askPlaceholder: 'अपना सवाल लिखें, या माइक इस्तेमाल करें',
      askButton: 'पूछें',
      asking: 'जवाब खोज रहे हैं...',
      askFailed: 'अभी सवालों के जवाब नहीं दे पा रहे। थोड़ी देर बाद कोशिश करें।',
      answerTitle: 'जवाब',
      originalColumn: 'मूल पाठ',
      simpleColumn: 'आसान भाषा में',
      nextLine: 'अगली लाइन',
      prevLine: 'पिछली लाइन',
      autoPlay: 'अपने आप चलाएं',
      lineProgress: (current, total) => `${total} में से ${current}वीं लाइन`,
    },
    settings: {
      title: 'सेटिंग्स',
      back: 'पीछे',
      save: 'सेव करें',
      saved: 'सेव हो गया',
      savedDocuments: 'आपके सेव किए फॉर्म',
      logOut: 'लॉग आउट',
    },
    voice: {
      preparing: 'आपके सवाल तैयार कर रहे हैं...',
      questionProgress: (current, total) => `${total} में से ${current}वां सवाल`,
      tapToSpeak: 'दबाएं और अपना जवाब बोलें',
      listening: 'सुन रहे हैं... रोकने के लिए दबाएं',
      processing: 'एक पल...',
      yourAnswer: 'आपका जवाब',
      reRecord: 'फिर से बोलें',
      repeat: 'सवाल दोबारा सुनें',
      next: 'आगे',
      back: 'पीछे',
      finish: 'हो गया',
      openTitle: 'बताइए आपको क्या भरना है',
      openHint: 'अपना जवाब बोलें, या नीचे लिखें।',
      typeHere: 'अपना जवाब यहाँ लिखें',
      micUnsupported: 'यह ब्राउज़र सुन नहीं सकता। कृपया जवाब लिखें।',
    },
    confirm: {
      title: 'अपने जवाब जांच लें',
      subtitle: 'सुनें या पढ़ें, फिर बताएं कि सही हैं या नहीं।',
      yes: 'हाँ, यह सही है',
      no: 'नहीं, मैं दोबारा करूंगा',
      redo: 'दोबारा करें',
      notAnswered: 'जवाब नहीं दिया',
      doneTitle: 'सब हो गया',
      doneBody:
        'आपके जवाब तैयार हैं। इन्हें फॉर्म पर लिख सकते हैं, या दफ़्तर में यह स्क्रीन दिखा सकते हैं।',
      startAnother: 'दूसरा फॉर्म शुरू करें',
      goHome: 'होम पर जाएं',
    },
  },
  'ta-IN': {
    common: {
      languageLabel: 'மொழி',
      appName: 'சரள்',
      getStarted: 'தொடங்குங்கள்',
      listenToThis: 'இதைக் கேளுங்கள்',
      stopListening: 'நிறுத்துங்கள்',
    },
    landing: {
      headline: 'உங்கள் சொந்த மொழியில், பேசி படிவம் நிரப்புங்கள்',
      subheadline:
        'சரள் படிவங்களைப் படித்துக் காட்டுகிறது, எளிய வார்த்தைகளில் விளக்குகிறது, உங்கள் குரலால் நிரப்புகிறது. வேறு யாருடைய உதவியும் தேவையில்லை.',
      trustLine: 'பயன்படுத்த இலவசம். உங்கள் குரல், உங்கள் படிவம், உங்கள் தனியுரிமை.',
      haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      logIn: 'உள்நுழையவும்',
      steps: ['படிவத்தைக் காட்டுங்கள்', 'கேளுங்கள், புரிந்துகொள்ளுங்கள்', 'பேசி பதில் சொல்லுங்கள்'],
    },
    auth: {
      loginTitle: 'மீண்டும் வருக',
      loginSubtitle: 'தொடர உள்நுழையவும்',
      signupTitle: 'உங்கள் கணக்கை உருவாக்குங்கள்',
      signupSubtitle: 'இதற்கு ஒரு நிமிடம் போதும்',
      emailLabel: 'மின்னஞ்சல்',
      passwordLabel: 'கடவுச்சொல்',
      confirmPasswordLabel: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      logInButton: 'உள்நுழையவும்',
      signUpButton: 'கணக்கை உருவாக்குங்கள்',
      noAccount: 'சரளுக்கு புதியவரா?',
      signUpLink: 'கணக்கை உருவாக்குங்கள்',
      haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      logInLink: 'உள்நுழையவும்',
      backToHome: 'பின்',
      showPassword: 'காட்டு',
      hidePassword: 'மறை',
      genericError: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
      passwordMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
      invalidCredentials: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு.',
      checkEmailTitle: 'உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்',
      checkEmailBody:
        'உங்கள் மின்னஞ்சலுக்கு உறுதிப்படுத்தல் இணைப்பை அனுப்பியுள்ளோம். கணக்கு உருவாக்கத்தை முடிக்க அதைத் திறக்கவும்.',
    },
    prefs: {
      setupTitle: 'உங்களுக்கு ஏற்றவாறு அமைப்போம்',
      setupSubtitle: 'இவை அனைத்தையும் பிறகு மாற்றலாம்.',
      languageLabel: 'உங்களுக்கு எந்த மொழி வேண்டும்?',
      fontSizeLabel: 'எழுத்துக்கள் எவ்வளவு பெரியதாக இருக்க வேண்டும்?',
      fontSizeNormal: 'சாதாரண',
      fontSizeLarge: 'பெரிய',
      fontSizeXlarge: 'மிகப் பெரிய',
      fontPreview: 'எழுத்துக்கள் இப்படித் தெரியும்.',
      lineFocusLabel: 'வரி கவனம்',
      lineFocusHint:
        'படிக்கும்போது ஒவ்வொரு வரியாக தனித்துக் காட்டும், நீங்கள் இடத்தை மறக்க மாட்டீர்கள்.',
      readPage: 'இந்தப் பக்கத்தைப் படித்துக் காட்டு',
      on: 'ஆன்',
      off: 'ஆஃப்',
      continueButton: 'தொடரவும்',
    },
    dashboard: {
      title: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
      newDocument: 'புதிய படிவத்தைப் படிக்கச் சொல்லுங்கள்',
      newDocumentHint: 'படிவத்தின் புகைப்படம் எடுங்கள், நான் உங்கள் மொழியில் விளக்குகிறேன்.',
      historyTitle: 'உங்கள் முந்தைய படிவங்கள்',
      historyEmpty: 'இன்னும் படிவம் இல்லை. நீங்கள் முடித்தவை இங்கே தெரியும்.',
      historyLoading: 'உங்கள் படிவங்களைத் தேடுகிறோம்...',
      settings: 'அமைப்புகள்',
    },
    capture: {
      title: 'உங்கள் படிவத்தைக் காட்டுங்கள்',
      subtitle: 'புகைப்படம் எடுங்கள், அல்லது உங்கள் ஃபோனிலிருந்து ஒன்றைத் தேர்ந்தெடுங்கள்.',
      choosePhoto: 'படத்தைத் தேர்ந்தெடுங்கள்',
      reading: 'உங்கள் படிவத்தைப் படிக்கிறோம்...',
      readingHint: 'இதற்கு சில வினாடிகள் ஆகும்.',
      couldNotRead:
        'இந்தப் படத்தில் உள்ள எழுத்துக்களைப் படிக்க முடியவில்லை. வெளிச்சத்தில், பக்கத்திற்கு நேர் மேலிருந்து படம் எடுங்கள்.',
      tryAgain: 'வேறு படத்தை முயற்சிக்கவும்',
      previewAlt: 'நீங்கள் எடுத்த படம்',
      usePhoto: 'இந்தப் படத்தைப் பயன்படுத்து',
      retake: 'மீண்டும் படம் எடுங்கள்',
      lowQualityTitle: 'இந்தப் படத்தைப் படிப்பது கடினமாக இருந்தது',
      lowQualityBody:
        'சில வார்த்தைகள் தவறாக இருக்கலாம். அதிக வெளிச்சத்தில் தெளிவான படம் எடுத்தால் நன்றாக இருக்கும்.',
      continueAnyway: 'இருந்தாலும் தொடரவும்',
    },
    reader: {
      title: 'இந்தப் படிவம் என்ன சொல்கிறது',
      explaining: 'எளிய வார்த்தைகளில் விளக்குகிறோம்...',
      answerThisForm: 'பேசி இந்தப் படிவத்தை நிரப்புங்கள்',
      newPhoto: 'வேறு படத்தைப் பயன்படுத்துங்கள்',
      simplify: 'எளிதாக்கு',
      showOriginal: 'மூலப் பாடத்தைக் காட்டு',
      simplifying: 'எளிதாக்குகிறோம்...',
      simplifyFailed: 'எளிய வடிவம் இப்போது கிடைக்கவில்லை.',
      askTitle: 'இந்தப் படிவம் பற்றி கேள்வி கேளுங்கள்',
      askPlaceholder: 'உங்கள் கேள்வியை எழுதுங்கள், அல்லது மைக்கைப் பயன்படுத்துங்கள்',
      askButton: 'கேள்',
      asking: 'பதிலைத் தேடுகிறோம்...',
      askFailed: 'இப்போது கேள்விகளுக்குப் பதிலளிக்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.',
      answerTitle: 'பதில்',
      originalColumn: 'மூலப் பாடம்',
      simpleColumn: 'எளிய வார்த்தைகளில்',
      nextLine: 'அடுத்த வரி',
      prevLine: 'முந்தைய வரி',
      autoPlay: 'தானாக இயக்கு',
      lineProgress: (current, total) => `${total}ல் ${current}வது வரி`,
    },
    settings: {
      title: 'அமைப்புகள்',
      back: 'பின்',
      save: 'சேமி',
      saved: 'சேமிக்கப்பட்டது',
      savedDocuments: 'நீங்கள் சேமித்த படிவங்கள்',
      logOut: 'வெளியேறு',
    },
    voice: {
      preparing: 'உங்கள் கேள்விகளைத் தயார் செய்கிறோம்...',
      questionProgress: (current, total) => `${total}ல் ${current}வது கேள்வி`,
      tapToSpeak: 'அழுத்தி உங்கள் பதிலைச் சொல்லுங்கள்',
      listening: 'கேட்கிறோம்... நிறுத்த அழுத்துங்கள்',
      processing: 'ஒரு நிமிடம்...',
      yourAnswer: 'உங்கள் பதில்',
      reRecord: 'மீண்டும் சொல்லுங்கள்',
      repeat: 'கேள்வியை மீண்டும் கேளுங்கள்',
      next: 'அடுத்து',
      back: 'பின்',
      finish: 'முடிந்தது',
      openTitle: 'நீங்கள் என்ன நிரப்ப வேண்டும் என்று சொல்லுங்கள்',
      openHint: 'உங்கள் பதிலைச் சொல்லுங்கள், அல்லது கீழே எழுதுங்கள்.',
      typeHere: 'உங்கள் பதிலை இங்கே எழுதுங்கள்',
      micUnsupported: 'இந்த உலாவியால் கேட்க முடியாது. தயவுசெய்து பதிலை எழுதுங்கள்.',
    },
    confirm: {
      title: 'உங்கள் பதில்களைச் சரிபார்க்கவும்',
      subtitle: 'கேளுங்கள் அல்லது படியுங்கள், பிறகு சரியா என்று சொல்லுங்கள்.',
      yes: 'ஆம், இது சரி',
      no: 'இல்லை, மீண்டும் செய்கிறேன்',
      redo: 'மீண்டும் செய்',
      notAnswered: 'பதில் இல்லை',
      doneTitle: 'எல்லாம் முடிந்தது',
      doneBody:
        'உங்கள் பதில்கள் தயார். அவற்றைப் படிவத்தில் எழுதலாம், அல்லது அலுவலகத்தில் இந்தத் திரையைக் காட்டலாம்.',
      startAnother: 'வேறு படிவத்தைத் தொடங்குங்கள்',
      goHome: 'முகப்புக்குச் செல்',
    },
  },
  'te-IN': {
    common: {
      languageLabel: 'భాష',
      appName: 'సరళ్',
      getStarted: 'ప్రారంభించండి',
      listenToThis: 'దీన్ని వినండి',
      stopListening: 'ఆపండి',
    },
    landing: {
      headline: 'మీ సొంత భాషలో, మాట్లాడుతూ ఫారం నింపండి',
      subheadline:
        'సరళ్ ఫారాలను చదివి వినిపిస్తుంది, సులభమైన మాటల్లో వివరిస్తుంది, మీ స్వరంతో నింపుతుంది. వేరే ఎవరి సహాయం అవసరం లేదు.',
      trustLine: 'ఉపయోగించడం ఉచితం. మీ స్వరం, మీ ఫారం, మీ గోప్యత.',
      haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      logIn: 'లాగిన్ చేయండి',
      steps: ['ఫారం చూపించండి', 'వినండి, అర్థం చేసుకోండి', 'మాట్లాడి సమాధానం ఇవ్వండి'],
    },
    auth: {
      loginTitle: 'మళ్ళీ స్వాగతం',
      loginSubtitle: 'కొనసాగించడానికి లాగిన్ చేయండి',
      signupTitle: 'మీ ఖాతాను సృష్టించండి',
      signupSubtitle: 'దీనికి ఒక్క నిమిషం చాలు',
      emailLabel: 'ఇమెయిల్',
      passwordLabel: 'పాస్‌వర్డ్',
      confirmPasswordLabel: 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
      logInButton: 'లాగిన్ చేయండి',
      signUpButton: 'ఖాతా సృష్టించండి',
      noAccount: 'సరళ్‌కి కొత్తా?',
      signUpLink: 'ఖాతా సృష్టించండి',
      haveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      logInLink: 'లాగిన్ చేయండి',
      backToHome: 'వెనుకకు',
      showPassword: 'చూపించు',
      hidePassword: 'దాచు',
      genericError: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
      passwordMismatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.',
      invalidCredentials: 'ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు.',
      checkEmailTitle: 'మీ ఇమెయిల్ చూడండి',
      checkEmailBody:
        'మేము మీ ఇమెయిల్‌కు నిర్ధారణ లింక్ పంపాము. ఖాతా సృష్టిని పూర్తి చేయడానికి దాన్ని తెరవండి.',
    },
    prefs: {
      setupTitle: 'మీకు అనుకూలంగా అమర్చుకుందాం',
      setupSubtitle: 'వీటన్నింటినీ తర్వాత మార్చుకోవచ్చు.',
      languageLabel: 'మీకు ఏ భాష కావాలి?',
      fontSizeLabel: 'అక్షరాలు ఎంత పెద్దగా ఉండాలి?',
      fontSizeNormal: 'సాధారణం',
      fontSizeLarge: 'పెద్దది',
      fontSizeXlarge: 'చాలా పెద్దది',
      fontPreview: 'అక్షరాలు ఇలా కనిపిస్తాయి.',
      lineFocusLabel: 'లైన్ ఫోకస్',
      lineFocusHint:
        'చదివేటప్పుడు ఒక్కో లైన్‌ను ప్రత్యేకంగా చూపిస్తుంది, మీరు ఎక్కడ ఉన్నారో మర్చిపోరు.',
      readPage: 'ఈ పేజీని చదివి వినిపించు',
      on: 'ఆన్',
      off: 'ఆఫ్',
      continueButton: 'కొనసాగించండి',
    },
    dashboard: {
      title: 'మీరు ఏమి చేయాలనుకుంటున్నారు?',
      newDocument: 'కొత్త ఫారం చదివించండి',
      newDocumentHint: 'ఫారం ఫోటో తీయండి, నేను మీ భాషలో వివరిస్తాను.',
      historyTitle: 'మీ గత ఫారాలు',
      historyEmpty: 'ఇంకా ఫారం లేదు. మీరు పూర్తి చేసినవి ఇక్కడ కనిపిస్తాయి.',
      historyLoading: 'మీ ఫారాలు వెతుకుతున్నాం...',
      settings: 'సెట్టింగ్‌లు',
    },
    capture: {
      title: 'మీ ఫారం చూపించండి',
      subtitle: 'ఫోటో తీయండి, లేదా మీ ఫోన్ నుండి ఒకటి ఎంచుకోండి.',
      choosePhoto: 'ఫోటో ఎంచుకోండి',
      reading: 'మీ ఫారం చదువుతున్నాం...',
      readingHint: 'దీనికి కొన్ని సెకన్లు పడుతుంది.',
      couldNotRead:
        'ఈ ఫోటోలోని అక్షరాలు చదవలేకపోయాం. వెలుతురులో, పేజీకి నేరుగా పైనుండి ఫోటో తీయండి.',
      tryAgain: 'వేరే ఫోటో ప్రయత్నించండి',
      previewAlt: 'మీరు తీసిన ఫోటో',
      usePhoto: 'ఈ ఫోటోనే వాడండి',
      retake: 'మళ్ళీ ఫోటో తీయండి',
      lowQualityTitle: 'ఈ ఫోటో చదవడం కష్టమైంది',
      lowQualityBody:
        'కొన్ని పదాలు తప్పు కావచ్చు. ఎక్కువ వెలుతురులో స్పష్టమైన ఫోటో తీస్తే బాగా పని చేస్తుంది.',
      continueAnyway: 'అయినా కొనసాగించండి',
    },
    reader: {
      title: 'ఈ ఫారం ఏమి చెబుతోంది',
      explaining: 'సులభమైన మాటల్లో వివరిస్తున్నాం...',
      answerThisForm: 'మాట్లాడి ఈ ఫారం నింపండి',
      newPhoto: 'వేరే ఫోటో వాడండి',
      simplify: 'సులభం చేయండి',
      showOriginal: 'అసలు పాఠం చూపించు',
      simplifying: 'సులభం చేస్తున్నాం...',
      simplifyFailed: 'సులభ రూపం ఇప్పుడు అందుబాటులో లేదు.',
      askTitle: 'ఈ ఫారం గురించి ప్రశ్న అడగండి',
      askPlaceholder: 'మీ ప్రశ్న రాయండి, లేదా మైక్ వాడండి',
      askButton: 'అడగండి',
      asking: 'సమాధానం వెతుకుతున్నాం...',
      askFailed: 'ఇప్పుడు ప్రశ్నలకు సమాధానం ఇవ్వలేకపోతున్నాం. కొంతసేపటి తర్వాత ప్రయత్నించండి.',
      answerTitle: 'సమాధానం',
      originalColumn: 'అసలు పాఠం',
      simpleColumn: 'సులభమైన మాటల్లో',
      nextLine: 'తర్వాత లైన్',
      prevLine: 'ముందు లైన్',
      autoPlay: 'దానికదే నడపండి',
      lineProgress: (current, total) => `${total}లో ${current}వ లైన్`,
    },
    settings: {
      title: 'సెట్టింగ్‌లు',
      back: 'వెనుకకు',
      save: 'సేవ్ చేయండి',
      saved: 'సేవ్ అయ్యింది',
      savedDocuments: 'మీరు సేవ్ చేసిన ఫారాలు',
      logOut: 'లాగ్ అవుట్',
    },
    voice: {
      preparing: 'మీ ప్రశ్నలు సిద్ధం చేస్తున్నాం...',
      questionProgress: (current, total) => `${total}లో ${current}వ ప్రశ్న`,
      tapToSpeak: 'నొక్కి మీ సమాధానం చెప్పండి',
      listening: 'వింటున్నాం... ఆపడానికి నొక్కండి',
      processing: 'ఒక్క క్షణం...',
      yourAnswer: 'మీ సమాధానం',
      reRecord: 'మళ్ళీ చెప్పండి',
      repeat: 'ప్రశ్న మళ్ళీ వినండి',
      next: 'తర్వాత',
      back: 'వెనుకకు',
      finish: 'అయిపోయింది',
      openTitle: 'మీరు ఏమి నింపాలో చెప్పండి',
      openHint: 'మీ సమాధానం చెప్పండి, లేదా కింద రాయండి.',
      typeHere: 'మీ సమాధానం ఇక్కడ రాయండి',
      micUnsupported: 'ఈ బ్రౌజర్ వినలేదు. దయచేసి సమాధానం రాయండి.',
    },
    confirm: {
      title: 'మీ సమాధానాలు సరిచూసుకోండి',
      subtitle: 'వినండి లేదా చదవండి, తర్వాత సరైనవా అని చెప్పండి.',
      yes: 'అవును, ఇది సరైనది',
      no: 'కాదు, మళ్ళీ చేస్తాను',
      redo: 'మళ్ళీ చేయి',
      notAnswered: 'సమాధానం ఇవ్వలేదు',
      doneTitle: 'అంతా అయిపోయింది',
      doneBody:
        'మీ సమాధానాలు సిద్ధంగా ఉన్నాయి. వాటిని ఫారంలో రాయవచ్చు, లేదా కార్యాలయంలో ఈ స్క్రీన్ చూపవచ్చు.',
      startAnother: 'మరో ఫారం ప్రారంభించండి',
      goHome: 'హోమ్‌కు వెళ్లండి',
    },
  },
  'ml-IN': {
    common: {
      languageLabel: 'ഭാഷ',
      appName: 'സരള്‍',
      getStarted: 'ആരംഭിക്കുക',
      listenToThis: 'ഇത് കേൾക്കുക',
      stopListening: 'നിർത്തുക',
    },
    landing: {
      headline: 'നിങ്ങളുടെ സ്വന്തം ഭാഷയിൽ, സംസാരിച്ച് ഫോം പൂരിപ്പിക്കുക',
      subheadline:
        'സരള്‍ ഫോമുകൾ വായിച്ചു കേൾപ്പിക്കുന്നു, ലളിതമായ വാക്കുകളിൽ വിശദീകരിക്കുന്നു, നിങ്ങളുടെ ശബ്ദം കൊണ്ട് പൂരിപ്പിക്കുന്നു. മറ്റാരുടെയും സഹായം വേണ്ട.',
      trustLine: 'ഉപയോഗിക്കാൻ സൗജന്യം. നിങ്ങളുടെ ശബ്ദം, നിങ്ങളുടെ ഫോം, നിങ്ങളുടെ സ്വകാര്യത.',
      haveAccount: 'നേരത്തെ അക്കൗണ്ട് ഉണ്ടോ?',
      logIn: 'ലോഗിൻ ചെയ്യുക',
      steps: ['ഫോം കാണിക്കുക', 'കേൾക്കുക, മനസ്സിലാക്കുക', 'സംസാരിച്ച് ഉത്തരം നൽകുക'],
    },
    auth: {
      loginTitle: 'വീണ്ടും സ്വാഗതം',
      loginSubtitle: 'തുടരാൻ ലോഗിൻ ചെയ്യുക',
      signupTitle: 'നിങ്ങളുടെ അക്കൗണ്ട് ഉണ്ടാക്കുക',
      signupSubtitle: 'ഇതിന് ഒരു മിനിറ്റ് മതി',
      emailLabel: 'ഇമെയിൽ',
      passwordLabel: 'പാസ്‌വേഡ്',
      confirmPasswordLabel: 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക',
      logInButton: 'ലോഗിൻ ചെയ്യുക',
      signUpButton: 'അക്കൗണ്ട് ഉണ്ടാക്കുക',
      noAccount: 'സരളിൽ പുതിയ ആളാണോ?',
      signUpLink: 'അക്കൗണ്ട് ഉണ്ടാക്കുക',
      haveAccount: 'നേരത്തെ അക്കൗണ്ട് ഉണ്ടോ?',
      logInLink: 'ലോഗിൻ ചെയ്യുക',
      backToHome: 'തിരികെ',
      showPassword: 'കാണിക്കുക',
      hidePassword: 'മറയ്ക്കുക',
      genericError: 'എന്തോ പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.',
      passwordMismatch: 'പാസ്‌വേഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.',
      invalidCredentials: 'ഇമെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ്.',
      checkEmailTitle: 'നിങ്ങളുടെ ഇമെയിൽ പരിശോധിക്കുക',
      checkEmailBody:
        'ഞങ്ങൾ നിങ്ങളുടെ ഇമെയിലിലേക്ക് ഒരു സ്ഥിരീകരണ ലിങ്ക് അയച്ചിട്ടുണ്ട്. അക്കൗണ്ട് നിർമ്മാണം പൂർത്തിയാക്കാൻ അത് തുറക്കുക.',
    },
    prefs: {
      setupTitle: 'നിങ്ങൾക്ക് സൗകര്യപ്രദമായി ക്രമീകരിക്കാം',
      setupSubtitle: 'ഇവയെല്ലാം പിന്നീട് മാറ്റാം.',
      languageLabel: 'നിങ്ങൾക്ക് ഏത് ഭാഷ വേണം?',
      fontSizeLabel: 'അക്ഷരങ്ങൾ എത്ര വലുതായിരിക്കണം?',
      fontSizeNormal: 'സാധാരണം',
      fontSizeLarge: 'വലുത്',
      fontSizeXlarge: 'വളരെ വലുത്',
      fontPreview: 'അക്ഷരങ്ങൾ ഇങ്ങനെ കാണപ്പെടും.',
      lineFocusLabel: 'ലൈൻ ഫോക്കസ്',
      lineFocusHint:
        'വായിക്കുമ്പോൾ ഓരോ വരിയായി എടുത്തുകാണിക്കും, നിങ്ങൾ എവിടെയാണെന്ന് മറക്കില്ല.',
      readPage: 'ഈ പേജ് വായിച്ചു കേൾപ്പിക്കുക',
      on: 'ഓൺ',
      off: 'ഓഫ്',
      continueButton: 'തുടരുക',
    },
    dashboard: {
      title: 'നിങ്ങൾക്ക് എന്ത് ചെയ്യണം?',
      newDocument: 'പുതിയ ഫോം വായിപ്പിക്കുക',
      newDocumentHint: 'ഫോമിന്റെ ഫോട്ടോ എടുക്കുക, ഞാൻ നിങ്ങളുടെ ഭാഷയിൽ വിശദീകരിക്കാം.',
      historyTitle: 'നിങ്ങളുടെ പഴയ ഫോമുകൾ',
      historyEmpty: 'ഇതുവരെ ഫോം ഇല്ല. നിങ്ങൾ പൂർത്തിയാക്കുന്നവ ഇവിടെ കാണാം.',
      historyLoading: 'നിങ്ങളുടെ ഫോമുകൾ തിരയുന്നു...',
      settings: 'ക്രമീകരണങ്ങൾ',
    },
    capture: {
      title: 'നിങ്ങളുടെ ഫോം കാണിക്കുക',
      subtitle: 'ഫോട്ടോ എടുക്കുക, അല്ലെങ്കിൽ ഫോണിൽ നിന്ന് ഒന്ന് തിരഞ്ഞെടുക്കുക.',
      choosePhoto: 'ഫോട്ടോ തിരഞ്ഞെടുക്കുക',
      reading: 'നിങ്ങളുടെ ഫോം വായിക്കുന്നു...',
      readingHint: 'ഇതിന് കുറച്ച് സെക്കൻഡ് വേണം.',
      couldNotRead:
        'ഈ ഫോട്ടോയിലെ അക്ഷരങ്ങൾ വായിക്കാൻ കഴിഞ്ഞില്ല. വെളിച്ചത്തിൽ, പേജിന് നേരെ മുകളിൽ നിന്ന് ഫോട്ടോ എടുക്കുക.',
      tryAgain: 'മറ്റൊരു ഫോട്ടോ ശ്രമിക്കുക',
      previewAlt: 'നിങ്ങൾ എടുത്ത ഫോട്ടോ',
      usePhoto: 'ഈ ഫോട്ടോ ഉപയോഗിക്കുക',
      retake: 'വീണ്ടും ഫോട്ടോ എടുക്കുക',
      lowQualityTitle: 'ഈ ഫോട്ടോ വായിക്കാൻ പ്രയാസമായിരുന്നു',
      lowQualityBody:
        'ചില വാക്കുകൾ തെറ്റായിരിക്കാം. കൂടുതൽ വെളിച്ചത്തിൽ വ്യക്തമായ ഫോട്ടോ എടുത്താൽ നന്നായി പ്രവർത്തിക്കും.',
      continueAnyway: 'എന്നാലും തുടരുക',
    },
    reader: {
      title: 'ഈ ഫോം എന്താണ് പറയുന്നത്',
      explaining: 'ലളിതമായ വാക്കുകളിൽ വിശദീകരിക്കുന്നു...',
      answerThisForm: 'സംസാരിച്ച് ഈ ഫോം പൂരിപ്പിക്കുക',
      newPhoto: 'മറ്റൊരു ഫോട്ടോ ഉപയോഗിക്കുക',
      simplify: 'ലളിതമാക്കുക',
      showOriginal: 'യഥാർത്ഥ വാചകം കാണിക്കുക',
      simplifying: 'ലളിതമാക്കുന്നു...',
      simplifyFailed: 'ലളിതമായ പതിപ്പ് ഇപ്പോൾ ലഭ്യമല്ല.',
      askTitle: 'ഈ ഫോമിനെക്കുറിച്ച് ചോദ്യം ചോദിക്കുക',
      askPlaceholder: 'നിങ്ങളുടെ ചോദ്യം എഴുതുക, അല്ലെങ്കിൽ മൈക്ക് ഉപയോഗിക്കുക',
      askButton: 'ചോദിക്കുക',
      asking: 'ഉത്തരം തിരയുന്നു...',
      askFailed: 'ഇപ്പോൾ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാൻ കഴിയുന്നില്ല. കുറച്ച് കഴിഞ്ഞ് ശ്രമിക്കുക.',
      answerTitle: 'ഉത്തരം',
      originalColumn: 'യഥാർത്ഥ വാചകം',
      simpleColumn: 'ലളിതമായ വാക്കുകളിൽ',
      nextLine: 'അടുത്ത വരി',
      prevLine: 'മുൻ വരി',
      autoPlay: 'സ്വയം പ്ലേ ചെയ്യുക',
      lineProgress: (current, total) => `${total}ൽ ${current}-ാം വരി`,
    },
    settings: {
      title: 'ക്രമീകരണങ്ങൾ',
      back: 'തിരികെ',
      save: 'സേവ് ചെയ്യുക',
      saved: 'സേവ് ചെയ്തു',
      savedDocuments: 'നിങ്ങൾ സേവ് ചെയ്ത ഫോമുകൾ',
      logOut: 'ലോഗ് ഔട്ട്',
    },
    voice: {
      preparing: 'നിങ്ങളുടെ ചോദ്യങ്ങൾ തയ്യാറാക്കുന്നു...',
      questionProgress: (current, total) => `${total}ൽ ${current}-ാം ചോദ്യം`,
      tapToSpeak: 'അമർത്തി നിങ്ങളുടെ ഉത്തരം പറയുക',
      listening: 'കേൾക്കുന്നു... നിർത്താൻ അമർത്തുക',
      processing: 'ഒരു നിമിഷം...',
      yourAnswer: 'നിങ്ങളുടെ ഉത്തരം',
      reRecord: 'വീണ്ടും പറയുക',
      repeat: 'ചോദ്യം വീണ്ടും കേൾക്കുക',
      next: 'അടുത്തത്',
      back: 'തിരികെ',
      finish: 'കഴിഞ്ഞു',
      openTitle: 'നിങ്ങൾക്ക് എന്താണ് പൂരിപ്പിക്കേണ്ടതെന്ന് പറയുക',
      openHint: 'നിങ്ങളുടെ ഉത്തരം പറയുക, അല്ലെങ്കിൽ താഴെ എഴുതുക.',
      typeHere: 'നിങ്ങളുടെ ഉത്തരം ഇവിടെ എഴുതുക',
      micUnsupported: 'ഈ ബ്രൗസറിന് കേൾക്കാൻ കഴിയില്ല. ദയവായി ഉത്തരം എഴുതുക.',
    },
    confirm: {
      title: 'നിങ്ങളുടെ ഉത്തരങ്ങൾ പരിശോധിക്കുക',
      subtitle: 'കേൾക്കുക അല്ലെങ്കിൽ വായിക്കുക, എന്നിട്ട് ശരിയാണോ എന്ന് പറയുക.',
      yes: 'അതെ, ഇത് ശരിയാണ്',
      no: 'അല്ല, ഞാൻ വീണ്ടും ചെയ്യാം',
      redo: 'വീണ്ടും ചെയ്യുക',
      notAnswered: 'ഉത്തരം നൽകിയില്ല',
      doneTitle: 'എല്ലാം കഴിഞ്ഞു',
      doneBody:
        'നിങ്ങളുടെ ഉത്തരങ്ങൾ തയ്യാറാണ്. അവ ഫോമിൽ എഴുതാം, അല്ലെങ്കിൽ ഓഫീസിൽ ഈ സ്ക്രീൻ കാണിക്കാം.',
      startAnother: 'മറ്റൊരു ഫോം തുടങ്ങുക',
      goHome: 'ഹോമിലേക്ക് പോകുക',
    },
  },
  'bn-IN': {
    common: {
      languageLabel: 'ভাষা',
      appName: 'সরল',
      getStarted: 'শুরু করুন',
      listenToThis: 'এটি শুনুন',
      stopListening: 'থামুন',
    },
    landing: {
      headline: 'নিজের ভাষায়, কথা বলে ফর্ম পূরণ করুন',
      subheadline:
        'সরল ফর্ম পড়ে শোনায়, সহজ ভাষায় বুঝিয়ে দেয়, আর আপনার নিজের কণ্ঠ দিয়ে পূরণ করে। অন্য কারও সাহায্যের দরকার নেই।',
      trustLine: 'ব্যবহার করা বিনামূল্যে। আপনার কণ্ঠ, আপনার ফর্ম, আপনার গোপনীয়তা।',
      haveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে?',
      logIn: 'লগ ইন করুন',
      steps: ['ফর্ম দেখান', 'শুনুন, বুঝুন', 'কথা বলে উত্তর দিন'],
    },
    auth: {
      loginTitle: 'আবার স্বাগতম',
      loginSubtitle: 'চালিয়ে যেতে লগ ইন করুন',
      signupTitle: 'আপনার অ্যাকাউন্ট তৈরি করুন',
      signupSubtitle: 'এতে মাত্র এক মিনিট লাগবে',
      emailLabel: 'ইমেল',
      passwordLabel: 'পাসওয়ার্ড',
      confirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
      logInButton: 'লগ ইন করুন',
      signUpButton: 'অ্যাকাউন্ট তৈরি করুন',
      noAccount: 'সরল-এ নতুন?',
      signUpLink: 'অ্যাকাউন্ট তৈরি করুন',
      haveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে?',
      logInLink: 'লগ ইন করুন',
      backToHome: 'পেছনে',
      showPassword: 'দেখান',
      hidePassword: 'লুকান',
      genericError: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।',
      passwordMismatch: 'পাসওয়ার্ড মিলছে না।',
      invalidCredentials: 'ইমেল বা পাসওয়ার্ড ভুল।',
      checkEmailTitle: 'আপনার ইমেল দেখুন',
      checkEmailBody:
        'আমরা আপনার ইমেলে একটি নিশ্চিতকরণ লিঙ্ক পাঠিয়েছি। অ্যাকাউন্ট তৈরি সম্পূর্ণ করতে এটি খুলুন।',
    },
    prefs: {
      setupTitle: 'আপনার সুবিধা মতো সাজিয়ে নিই',
      setupSubtitle: 'এসব পরে বদলে নিতে পারবেন।',
      languageLabel: 'আপনার কোন ভাষা চাই?',
      fontSizeLabel: 'অক্ষর কত বড় হবে?',
      fontSizeNormal: 'সাধারণ',
      fontSizeLarge: 'বড়',
      fontSizeXlarge: 'খুব বড়',
      fontPreview: 'অক্ষর এইরকম দেখাবে।',
      lineFocusLabel: 'লাইন ফোকাস',
      lineFocusHint:
        'পড়ার সময় এক-একটি লাইন আলাদা করে দেখায়, যাতে আপনি জায়গা হারিয়ে না ফেলেন।',
      readPage: 'এই পাতাটি পড়ে শোনান',
      on: 'চালু',
      off: 'বন্ধ',
      continueButton: 'এগিয়ে যান',
    },
    dashboard: {
      title: 'আপনি কী করতে চান?',
      newDocument: 'নতুন ফর্ম পড়িয়ে নিন',
      newDocumentHint: 'ফর্মের ছবি তুলুন, আমি আপনার ভাষায় বুঝিয়ে দেব।',
      historyTitle: 'আপনার আগের ফর্ম',
      historyEmpty: 'এখনও কোনো ফর্ম নেই। আপনি যেগুলি শেষ করবেন সেগুলি এখানে দেখা যাবে।',
      historyLoading: 'আপনার ফর্ম খুঁজছি...',
      settings: 'সেটিংস',
    },
    capture: {
      title: 'আপনার ফর্ম দেখান',
      subtitle: 'ছবি তুলুন, বা আপনার ফোন থেকে একটি বেছে নিন।',
      choosePhoto: 'ছবি বেছে নিন',
      reading: 'আপনার ফর্ম পড়ছি...',
      readingHint: 'এতে কয়েক সেকেন্ড লাগবে।',
      couldNotRead:
        'এই ছবির লেখা পড়া গেল না। আলোয়, পাতার ঠিক উপর থেকে ছবি তুলুন।',
      tryAgain: 'অন্য ছবি চেষ্টা করুন',
      previewAlt: 'আপনার তোলা ছবি',
      usePhoto: 'এই ছবিটাই ব্যবহার করুন',
      retake: 'আবার ছবি তুলুন',
      lowQualityTitle: 'এই ছবিটি পড়তে কষ্ট হয়েছে',
      lowQualityBody:
        'কিছু শব্দ ভুল হতে পারে। বেশি আলোয় তোলা পরিষ্কার ছবি আরও ভালো কাজ করবে।',
      continueAnyway: 'তবুও এগিয়ে যান',
    },
    reader: {
      title: 'এই ফর্ম কী বলছে',
      explaining: 'সহজ ভাষায় বুঝিয়ে দিচ্ছি...',
      answerThisForm: 'কথা বলে এই ফর্ম পূরণ করুন',
      newPhoto: 'অন্য ছবি ব্যবহার করুন',
      simplify: 'সহজ করুন',
      showOriginal: 'মূল লেখা দেখান',
      simplifying: 'সহজ করছি...',
      simplifyFailed: 'সহজ সংস্করণ এখন পাওয়া যাচ্ছে না।',
      askTitle: 'এই ফর্ম সম্পর্কে প্রশ্ন করুন',
      askPlaceholder: 'আপনার প্রশ্ন লিখুন, বা মাইক ব্যবহার করুন',
      askButton: 'জিজ্ঞাসা করুন',
      asking: 'উত্তর খুঁজছি...',
      askFailed: 'এখন প্রশ্নের উত্তর দিতে পারছি না। কিছুক্ষণ পরে চেষ্টা করুন।',
      answerTitle: 'উত্তর',
      originalColumn: 'মূল লেখা',
      simpleColumn: 'সহজ ভাষায়',
      nextLine: 'পরের লাইন',
      prevLine: 'আগের লাইন',
      autoPlay: 'নিজে থেকে চালান',
      lineProgress: (current, total) => `${total}টির মধ্যে ${current} নম্বর লাইন`,
    },
    settings: {
      title: 'সেটিংস',
      back: 'পেছনে',
      save: 'সেভ করুন',
      saved: 'সেভ হয়েছে',
      savedDocuments: 'আপনার সেভ করা ফর্ম',
      logOut: 'লগ আউট',
    },
    voice: {
      preparing: 'আপনার প্রশ্ন তৈরি করছি...',
      questionProgress: (current, total) => `${total}টির মধ্যে ${current} নম্বর প্রশ্ন`,
      tapToSpeak: 'চাপুন আর আপনার উত্তর বলুন',
      listening: 'শুনছি... থামাতে চাপুন',
      processing: 'এক মুহূর্ত...',
      yourAnswer: 'আপনার উত্তর',
      reRecord: 'আবার বলুন',
      repeat: 'প্রশ্নটি আবার শুনুন',
      next: 'পরের',
      back: 'পেছনে',
      finish: 'হয়ে গেছে',
      openTitle: 'আপনি কী পূরণ করতে চান বলুন',
      openHint: 'আপনার উত্তর বলুন, বা নিচে লিখুন।',
      typeHere: 'আপনার উত্তর এখানে লিখুন',
      micUnsupported: 'এই ব্রাউজার শুনতে পারে না। দয়া করে উত্তর লিখুন।',
    },
    confirm: {
      title: 'আপনার উত্তরগুলি দেখে নিন',
      subtitle: 'শুনুন বা পড়ুন, তারপর বলুন ঠিক আছে কিনা।',
      yes: 'হ্যাঁ, এটি ঠিক আছে',
      no: 'না, আমি আবার করব',
      redo: 'আবার করুন',
      notAnswered: 'উত্তর দেওয়া হয়নি',
      doneTitle: 'সব হয়ে গেছে',
      doneBody:
        'আপনার উত্তর তৈরি। এগুলি ফর্মে লিখতে পারেন, বা অফিসে এই স্ক্রিন দেখাতে পারেন।',
      startAnother: 'আরেকটি ফর্ম শুরু করুন',
      goHome: 'হোমে যান',
    },
  },
}
