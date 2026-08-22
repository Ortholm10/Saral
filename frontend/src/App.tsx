import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from '@/context/LanguageContext'
import { PreferencesProvider } from '@/context/PreferencesContext'
import { AuthProvider } from '@/context/AuthContext'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Preferences from '@/pages/Preferences'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import DocumentCapture from '@/pages/DocumentCapture'
import DocumentReader from '@/pages/DocumentReader'
import VoiceAnswer from '@/pages/VoiceAnswer'
import Confirmation from '@/pages/Confirmation'
import ComingSoon from '@/pages/ComingSoon'

function App() {
  return (
    <LanguageProvider>
      <PreferencesProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Where Signup sends the user: first-run language and accessibility setup. */}
              <Route path="/preferences" element={<Preferences />} />
              {/* Where Login sends the user once a session exists. */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              {/* The document flow, in the order the user walks it. Each screen
                  hands the next one its state, and redirects to the start if
                  opened without it. */}
              <Route path="/documents" element={<DocumentCapture />} />
              <Route path="/documents/read" element={<DocumentReader />} />
              <Route path="/documents/answer" element={<VoiceAnswer />} />
              <Route path="/documents/confirm" element={<Confirmation />} />
              {/* Onboarding, dashboard, and settings screens land here next. */}
              <Route path="*" element={<ComingSoon />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PreferencesProvider>
    </LanguageProvider>
  )
}

export default App
