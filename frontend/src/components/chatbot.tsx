"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Sparkles, Loader2 } from "lucide-react"
import { sendChatMessage, getChatHistory, startChatSession } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Message {
  message_id?: string
  role: "user" | "assistant"
  content: string
  created_at?: string
}

const DUMMY_CANDIDATE_ID = "00000000-0000-0000-0000-000000000000"

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Start session when chat opens
  useEffect(() => {
    if (open && !sessionId) {
      setStarting(true)
      startChatSession(DUMMY_CANDIDATE_ID)
        .then((session) => {
          setSessionId(session.conversation_id)
          setMessages([
            {
              role: "assistant",
              content: "Hi! I'm HireLoop AI — your recruiting copilot. I can help you summarize your pipeline or prioritize candidates.",
            },
          ])
        })
        .catch(() => {
          setMessages([
            {
              role: "assistant",
              content: "Hi! I'm HireLoop AI. Ask me anything about your pipeline.",
            },
          ])
        })
        .finally(() => setStarting(false))
    }
  }, [open, sessionId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      if (sessionId) {
        await sendChatMessage(sessionId, userMessage.content)
      }
      // Placeholder AI response — replace when backend AI is ready
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Got it! I'm processing your request. AI responses will be available once the backend is connected.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 flex w-[340px] sm:w-[380px] flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-[#3346d3] px-4 py-3.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-white/20">
                <Sparkles className="size-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">HireLoop AI</p>
                <p className="text-[11px] text-white/70">Recruiting copilot</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 0, maxHeight: "360px" }}>
              {starting ? (
                <div className="flex items-center justify-center h-full py-8">
                  <Loader2 className="size-5 animate-spin text-[#3346d3]" />
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "ml-auto bg-[#3346d3] text-white rounded-br-sm"
                        : "mr-auto bg-gray-100 text-gray-800 rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))
              )}
              {loading && (
                <div className="mr-auto flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2.5">
                  <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3 flex items-center gap-2 text-gray-700">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your pipeline..."
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20 placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3346d3] text-white hover:bg-[#2a3ab8] disabled:opacity-50 transition-colors"
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle bubble */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#3346d3] shadow-lg text-white"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <Sparkles className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}