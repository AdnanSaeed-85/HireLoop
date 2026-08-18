"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getPendingHITL, getMe } from "@/lib/api"
import ChatBot from "@/components/chatbot"
import { toast } from "sonner"
import {
  BriefcaseBusiness,
  Users,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: BriefcaseBusiness },
  { label: "Candidates", href: "/dashboard/candidates", icon: Users },
  { label: "Human review", href: "/dashboard/human-review", icon: ShieldCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    getPendingHITL()
      .then((data) => setPendingCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setPendingCount(0))
  }, [])

  useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) {
    router.push("/login")
    return
  }
  getMe()
    .then((data) => {
      const parts = data.name.trim().split(" ")
      const initials = parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2)
      setUser({ name: data.name, initials })
    })
    .catch(() => {
      router.push("/login")
    })
}, [router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    // NOTE: no overflow-hidden here — that would clip the fixed chat bubble
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Toaster richColors position="top-right" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[196px] flex-col border-r border-gray-100 bg-white transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Close button — mobile only */}
        <button
          className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="size-4" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-5 border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3346d3]">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-800">
            hire<span className="text-[#3346d3]">loop</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[#3346d3]/8 text-[#3346d3]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {label === "Human review" && pendingCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3346d3] px-1 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

                {/* Share form button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              const link = `${window.location.origin}/apply`
              navigator.clipboard.writeText(link)
              toast.success("Application link copied to clipboard!")
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#3346d3]/40 bg-[#3346d3]/5 px-3 py-2.5 text-sm font-semibold text-[#3346d3] hover:bg-[#3346d3]/10 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share application form
          </button>
        </div>

        {/* Upgrade banner */}

        {/* Upgrade banner */}
        <div className="m-3 rounded-2xl bg-[#3346d3] p-4">
          <Sparkles className="size-5 text-white mb-2" />
          <p className="text-xs font-bold text-white">Upgrade your hiring</p>
          <p className="mt-1 text-[11px] text-white/70">Unlock advanced AI scoring and automation.</p>
          <button className="mt-3 w-full rounded-xl bg-white py-1.5 text-xs font-bold text-[#3346d3]">
            Explore Pro
          </button>
        </div>
      </aside>

      {/* Main — clips its own overflow but not the fixed chat bubble */}
      <div className="flex flex-1 flex-col lg:pl-[196px] min-w-0 overflow-x-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-4 text-gray-500" />
            </button>

            {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 w-full max-w-xs sm:max-w-sm">
                <Search className="size-4 text-gray-400 shrink-0" />
                <input
                  className="bg-transparent text-sm outline-none placeholder-gray-400 w-full min-w-0 cursor-text text-gray-700"
                  placeholder="Search candidates, jobs..."
                />
              </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3346d3] text-xs font-bold text-white shrink-0">
                {user?.initials ?? "SL"}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user?.name ?? "Sam Lee"}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token")
                router.push("/login")
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-red-500"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Chat bubble — fixed, outside overflow container so it always shows */}
            <ChatBot />
    </div>
  )
}