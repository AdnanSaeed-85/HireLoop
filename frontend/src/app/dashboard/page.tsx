"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Users,
  Plus,
  ChevronRight,
} from "lucide-react"
import { getCandidates, getJobs, getApplications } from "@/lib/api"
import { ScorePill, StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Sam")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const name = payload.name || payload.sub || "Sam"
        setUserName(name.split(" ")[0])
      } catch {}
    }

    Promise.all([getCandidates(), getJobs(), getApplications()])
      .then(([c, j, a]) => {
        setCandidates(c)
        setJobs(j)
        setApplications(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const trendData = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const counts: Record<string, number> = {}
    days.forEach((d) => (counts[d] = 0))
    applications.forEach((app) => {
      if (app.created_at) {
        const day = new Date(app.created_at).toLocaleDateString("en-US", { weekday: "short" })
        if (counts[day] !== undefined) counts[day]++
      }
    })
    return days.map((d) => ({ day: d, candidates: counts[d] }))
  })()

  const pipelineData = (() => {
    const stages = ["New", "Screening", "Interview", "Offer"]
    return stages.map((stage) => ({
      stage,
      value: candidates.filter((c) => c.stage === stage || c.status === stage).length,
    }))
  })()

  const activeJobs = jobs.filter((j) => j.status === "Active" || j.is_active)

  const metrics = [
    { label: "Total candidates", value: candidates.length, delta: "+12.5%", icon: Users },
    { label: "Open roles", value: activeJobs.length, delta: "+2 this week", icon: BriefcaseBusiness },
    { label: "Interviews", value: candidates.filter((c) => c.stage === "Interview").length, delta: "Scheduled", icon: CalendarDays },
    { label: "Avg. time to hire", value: "18d", delta: "3d faster", icon: Clock3 },
  ]

  const topCandidates = [...candidates]
    .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))
    .slice(0, 4)

  const recentActivity = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((app) => ({
      title: `New application from ${app.candidate_name ?? "candidate"}`,
      meta: `${app.job_title ?? "role"} · ${app.created_at ? new Date(app.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`,
    }))

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="mb-5 sm:mb-7 flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">
            {getTodayLabel()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {getGreeting()}, {userName}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Here&apos;s what&apos;s moving across your hiring pipeline today.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/create"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#3346d3] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2a3ab8] transition-colors"
        >
          Create a job <Plus className="size-4" />
        </Link>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.article
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(card, "p-4 sm:p-5")}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-[#3346d3]/8 text-[#3346d3]">
                  <Icon className="size-4 sm:size-5" />
                </span>
                <span className="text-xs font-bold text-emerald-700">{m.delta}</span>
              </div>
              <p className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{m.value}</p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{m.label}</p>
            </motion.article>
          )
        })}
      </section>

      {/* Charts */}
      <section className="mt-4 sm:mt-5 grid gap-4 sm:gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className={cn(card, "p-4 sm:p-6")}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-gray-900">Candidate momentum</h2>
              <p className="mt-1 text-xs text-gray-500">Applications received this week</p>
            </div>
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">7 days</span>
          </div>
          <div className="mt-4 sm:mt-5 h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3346d3" stopOpacity={0.25} />
                    <stop offset="1" stopColor="#3346d3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="candidates"
                  stroke="#3346d3"
                  strokeWidth={3}
                  fill="url(#area)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cn(card, "p-4 sm:p-6")}>
          <h2 className="font-extrabold text-gray-900">Pipeline health</h2>
          <p className="mt-1 text-xs text-gray-500">Candidates by current stage</p>
          <div className="mt-4 sm:mt-5 h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical">
                <XAxis type="number" hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#3346d3"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Bottom section */}
      <section className="mt-4 sm:mt-5 grid gap-4 sm:gap-5 xl:grid-cols-[1.25fr_1fr]">
        {/* Top candidates */}
        <article className={card}>
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <h2 className="font-extrabold text-gray-900">Top candidates</h2>
              <p className="mt-1 text-xs text-gray-500">AI-ranked for your active roles</p>
            </div>
            <Link href="/dashboard/candidates" className="text-xs font-bold text-[#3346d3] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topCandidates.length === 0 ? (
              <p className="px-4 sm:px-5 py-6 text-sm text-gray-400">No candidates yet.</p>
            ) : (
              topCandidates.map((c) => {
                const initials = (c.name ?? "?")
                  .split(" ")
                  .map((p: string) => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <Link
                    href={`/dashboard/candidates/${c.candidate_id}`}
                    key={c.candidate_id}
                    className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-[#3346d3]/8 text-xs font-extrabold text-[#3346d3]">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">{c.name}</p>
                      <p className="truncate text-xs text-gray-400">{c.role ?? c.applied_role ?? ""}</p>
                    </div>
                    <ScorePill score={c.score ?? 0} />
                    <ChevronRight className="size-4 text-gray-400 shrink-0" />
                  </Link>
                )
              })
            )}
          </div>
        </article>

        {/* Recent activity */}
        <article className={cn(card, "p-4 sm:p-5")}>
          <h2 className="font-extrabold text-gray-900">Recent activity</h2>
          <div className="mt-4 flex flex-col gap-3 sm:gap-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">No recent activity.</p>
            ) : (
              recentActivity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#3346d3]" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{a.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{a.meta}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  )
}