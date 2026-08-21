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
  },
}
