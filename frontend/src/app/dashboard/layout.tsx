"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  { label: "Human review", href: "/dashboard/human-review", icon: ShieldCheck, badge: 3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const name = payload.name || payload.sub || "User"
      const parts = name.split(" ")
      const initials = parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2)
      setUser({ name, initials })
    } catch {
      setUser({ name: "Sam Lee", initials: "SL" })
    }
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
          {navItems.map(({ label, href, icon: Icon, badge }) => {
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
                {badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3346d3] px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

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
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 w-full max-w-xs sm:max-w-sm">
              <Search className="size-4 text-gray-400 shrink-0" />
              <input
                className="bg-transparent text-sm outline-none placeholder-gray-400 w-full min-w-0"
                placeholder="Search candidates, jobs..."
              />
            </label>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white">
              <Bell className="size-4 text-gray-500" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#3346d3]" />
            </button>

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
      <button className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#3346d3] shadow-lg text-white">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  )
}