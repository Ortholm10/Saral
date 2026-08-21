import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ComingSoon from '@/pages/ComingSoon'
import HelpChatbot from "./components/HelpChatbot"; // 👇 Add this import

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Onboarding, dashboard, and document screens land here next. */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
          
          {/* 👇 Place the chatbot here so it persists across all routes */}
          <HelpChatbot />
          
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App