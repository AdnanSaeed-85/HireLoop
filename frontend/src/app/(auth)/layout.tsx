"use client"

import { useEffect, useState } from "react"

const quotes = [
  {
    text: "HireLoop helped us turn a messy recruiting process into one clear, confident system.",
    author: "Priya Rao",
    title: "VP People at Northstar",
  },
  {
    text: "We cut our time-to-hire in half and improved candidate quality dramatically.",
    author: "James Okafor",
    title: "Head of Talent at Meridian",
  },
  {
    text: "The AI screening alone saves our team hours every single week.",
    author: "Sarah Chen",
    title: "HR Director at Bluewave",
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Left */}
      <div className="flex w-full flex-col justify-center px-10 md:w-1/2 md:px-20 bg-[#eef0f8]">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3346d3]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="white"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-800">
              hire<span className="text-[#3346d3]">loop</span>
            </span>
          </div>
        </div>

        {children}
      </div>

      {/* Right */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-16 bg-[#3346d3]">
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="min-h-[160px] relative overflow-hidden">
            {quotes.map((q, i) => (
                <div
                key={i}
                className="absolute inset-0 transition-all duration-1000 ease-in-out"
                style={{
                    opacity: i === current ? 1 : 0,
                    transform: i === current ? "translateY(0)" : "translateY(16px)",
                    pointerEvents: i === current ? "auto" : "none",
                }}
                >
                <p className="text-3xl font-bold leading-snug text-white">
                    &ldquo;{q.text}&rdquo;
                </p>
                <p className="mt-6 text-sm font-semibold text-white/80">
                    {q.author} · {q.title}
                </p>
                </div>
            ))}
            </div>

        {/* Dots */}
        <div className="mt-8 flex items-center gap-2">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}