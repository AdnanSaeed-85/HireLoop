"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Bot, BriefcaseBusiness, CheckSquare2, LayoutDashboard, Menu, MessageCircle, Search, Send, Settings, Sparkles, Users, X } from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/hitl", label: "Human review", icon: CheckSquare2, badge: 3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

function NavLinks({ close }: { close?: () => void }) {
  const pathname = usePathname()
  return <nav className="flex flex-col gap-1" aria-label="Primary navigation">{nav.map((item) => {
    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
    const Icon = item.icon
    return <Link onClick={close} key={item.href} href={item.href} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors", active ? "text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-primary/8" />}<Icon className="relative size-4"/><span className="relative">{item.label}</span>{item.badge && <span className="relative ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">{item.badge}</span>}</Link>
  })}</nav>
}

function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState(["Hi Sam — I can summarize your pipeline or help prioritize candidates."])
  function send() {
    if (!input.trim()) return
    setMessages((items) => [...items, input, "Your strongest pipeline is Product Design. Maya Chen is the top candidate at 96% and ready for interview feedback."])
    setInput("")
  }
  return <><AnimatePresence>{open && <motion.aside initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} className="fixed bottom-24 right-4 z-40 flex h-[420px] w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:right-6">
    <header className="flex items-center justify-between bg-primary p-4 text-primary-foreground"><div className="flex items-center gap-2"><Bot className="size-5"/><div><p className="font-bold">HireLoop AI</p><p className="text-xs opacity-80">Recruiting copilot</p></div></div><button onClick={() => setOpen(false)} aria-label="Close assistant"><X className="size-5"/></button></header>
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted/40 p-4">{messages.map((message, i) => <div key={`${message}-${i}`} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed", i % 2 ? "ml-auto bg-primary text-primary-foreground" : "bg-card text-card-foreground shadow-sm")}>{message}</div>)}</div>
    <div className="flex gap-2 border-t bg-card p-3"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.nativeEvent.isComposing || e.keyCode === 229) return; if (e.key === "Enter") send() }} className="min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Ask about your pipeline…"/><button onClick={send} className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="Send message"><Send className="size-4"/></button></div>
  </motion.aside>}</AnimatePresence><button onClick={() => setOpen(!open)} aria-label="Open AI assistant" className="fixed bottom-5 right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-1 sm:right-6">{open ? <X className="size-5"/> : <MessageCircle className="size-5"/>}</button></>
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false)
  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar p-5 lg:flex"><Logo/><div className="mt-8"><NavLinks/></div><div className="mt-auto rounded-2xl bg-primary p-4 text-primary-foreground"><Sparkles className="size-5"/><p className="mt-3 text-sm font-extrabold">Upgrade your hiring</p><p className="mt-1 text-xs leading-relaxed opacity-80">Unlock advanced AI scoring and automation.</p><button className="mt-3 w-full rounded-lg bg-card px-3 py-2 text-xs font-bold text-primary">Explore Pro</button></div></aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6"><button className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open navigation"><Menu className="size-5"/></button><div className="lg:hidden"><Logo compact/></div><label className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-xl border bg-card px-3 py-2 sm:flex"><Search className="size-4 text-muted-foreground"/><span className="sr-only">Search</span><input className="w-full bg-transparent text-sm outline-none" placeholder="Search candidates, jobs…"/></label><button className="relative flex size-10 items-center justify-center rounded-xl border bg-card" aria-label="Notifications"><Bell className="size-4"/><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary"/></button><div className="flex items-center gap-2 border-l pl-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary">SL</span><div className="hidden sm:block"><p className="text-sm font-bold">Sam Lee</p><p className="text-xs text-muted-foreground">Admin</p></div></div></header><main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div>
    <AnimatePresence>{mobile && <><motion.button aria-label="Close navigation backdrop" onClick={() => setMobile(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"/><motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar p-5 shadow-xl lg:hidden"><div className="flex items-center justify-between"><Logo/><button onClick={() => setMobile(false)} aria-label="Close navigation"><X className="size-5"/></button></div><div className="mt-8"><NavLinks close={() => setMobile(false)}/></div></motion.aside></>}</AnimatePresence><ChatAssistant/>
  </div>
}
