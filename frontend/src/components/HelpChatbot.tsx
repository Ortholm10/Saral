import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, MicOff, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  suggestions?: string[];
  navigateTo?: string;
  timestamp: Date;
}

interface GuideApiResponse {
  reply: string;
  suggestions: string[];
  navigate_to: string | null;
}

// ── Screen mapper ─────────────────────────────────────────────────────

const SCREEN_MAP: Record<string, string> = {
  "/": "landing",
  "/login": "login",
  "/signup": "signup",
  "/dashboard": "dashboard",
  "/capture": "document-capture",
  "/reader": "document-reader",
  "/voice-answer": "voice-answer",
  "/confirm": "confirmation",
  "/settings": "settings",
  "/history": "document-history",
};

// ── Safe speech hook wrapper ──────────────────────────────────────────

function useSafeSpeech() {
  // Try to use your existing hook, fallback to no-ops if it breaks
  let speechHook: any = null;
  try {
    // Dynamic import to avoid crash on load if hook is missing
    const mod = require("@/hooks/useSpeech");
    speechHook = mod.useSpeech || mod.default;
  } catch {
    speechHook = null;
  }

  const hookResult = speechHook ? speechHook() : null;

  const speak = useCallback(
    (text: string, _lang?: string) => {
      try {
        if (hookResult?.speak) hookResult.speak(text, _lang);
        else if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(u);
        }
      } catch (e) {
        console.warn("TTS failed:", e);
      }
    },
    [hookResult]
  );

  const listen = useCallback(
    (onResult: (t: string) => void, onError?: (e: any) => void) => {
      try {
        if (hookResult?.listen) {
          hookResult.listen(onResult, onError);
          return;
        }
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const rec = new SR();
          rec.lang = "en-IN";
          rec.interimResults = false;
          rec.maxAlternatives = 1;
          rec.onresult = (e: any) => onResult(e.results[0][0].transcript);
          rec.onerror = (e: any) => onError?.(e);
          rec.start();
        } else {
          onError?.("Speech recognition not supported");
        }
      } catch (e) {
        console.warn("STT failed:", e);
        onError?.(e);
      }
    },
    [hookResult]
  );

  const stopListening = useCallback(() => {
    try {
      if (hookResult?.stopListening) hookResult.stopListening();
    } catch (e) {
      console.warn("Stop listening failed:", e);
    }
  }, [hookResult]);

  return { speak, listen, stopListening, isSpeaking: false, isListening: false };
}

// ── Component ─────────────────────────────────────────────────────────

export default function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { speak, listen, stopListening } = useSafeSpeech();

  const currentScreen = SCREEN_MAP[location.pathname] || "unknown";

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: ChatMessage = {
        id: "welcome",
        role: "bot",
        text: "Hi! I'm your Saral guide. Ask me how to use any screen, or tap a quick question below.",
        suggestions: [
          "How do I upload a form?",
          "Read this screen to me",
          "Where is my profile?",
        ],
        timestamp: new Date(),
      };
      setMessages([welcome]);
      speak(welcome.text, "en");
    }
  }, [isOpen, messages.length, speak]);

  // ── Send ───────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const apiUrl =
          (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:8001";

        const res = await fetch(`${apiUrl}/api/agent/guide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_screen: currentScreen,
            question: text.trim(),
            language: localStorage.getItem("saral-language") || "en",
            history: messages.map((m) => ({
              role: m.role,
              content: m.text,
            })),
          }),
        });

        if (!res.ok) throw new Error("Guide API error");

        const data: GuideApiResponse = await res.json();

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.reply,
          suggestions: data.suggestions,
          navigateTo: data.navigate_to || undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);

        const lang = localStorage.getItem("saral-language") || "en";
        speak(data.reply, lang);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "Sorry, I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, currentScreen, speak]
  );

  // ── Voice ──────────────────────────────────────────────────────────

  const toggleVoice = useCallback(() => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      listen(
        (transcript: string) => {
          setInput(transcript);
          setIsRecording(false);
          sendMessage(transcript);
        },
        (_err: any) => {
          setIsRecording(false);
        }
      );
    }
  }, [isRecording, listen, stopListening, sendMessage]);

  // ── Navigate ───────────────────────────────────────────────────────

  const handleNavigate = (path: string) => {
    const routeMap: Record<string, string> = {
      dashboard: "/dashboard",
      "document-capture": "/capture",
      capture: "/capture",
      "document-reader": "/reader",
      reader: "/reader",
      "voice-answer": "/voice-answer",
      confirmation: "/confirm",
      settings: "/settings",
      profile: "/settings",
      history: "/history",
    };
    const target = routeMap[path.toLowerCase()];
    if (target) {
      navigate(target);
      setIsOpen(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-orange-700 to-orange-500 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center border-2 border-white text-2xl"
            aria-label="Open help guide"
          >
            🦫
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                1
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="w-9 h-9 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-lg"
                >
                  🦫
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Saral Guide</h3>
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 bg-green-300 rounded-full"
                    />
                    <span className="text-orange-100 text-[11px]">Here to help</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-orange-50/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-orange-600 text-white rounded-2xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-md border border-orange-100 shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[85%]">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="px-2.5 py-1 text-[11px] rounded-full border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.role === "bot" && msg.navigateTo && (
                    <button
                      onClick={() => handleNavigate(msg.navigateTo!)}
                      className="mt-1.5 flex items-center gap-1 px-3 py-1 text-[11px] rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors"
                    >
                      Go to {msg.navigateTo}
                      <ChevronRight size={12} />
                    </button>
                  )}
                </motion.div>
              ))}

              {/* Loading animation */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 self-start"
                >
                  <div className="bg-white border border-orange-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3 shadow-sm">
                    <motion.div
                      animate={{ x: [0, 6, 0], rotate: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                      className="text-xl"
                    >
                      🦫
                    </motion.div>
                    <div className="flex gap-1">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: d }}
                          className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-orange-100 bg-white flex items-center gap-2 shrink-0">
              <button
                onClick={toggleVoice}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
                aria-label={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Type or speak your question..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-800 placeholder-gray-400"
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  input.trim() && !isLoading
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-100 text-gray-300"
                }`}
                aria-label="Send message"
              >
                <Send size={15} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}