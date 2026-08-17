"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, ChevronRight, Users, SlidersHorizontal } from "lucide-react"
import { getCandidates, getApplications } from "@/lib/api"
import { ScorePill, StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

interface Candidate {
  candidate_id: string
  name: string
  email: string
  phone?: string
}

interface Application {
  application_id: string
  candidate_id: string
  job_id: string
  status: string
  overall_score?: number
}

interface CandidateRow {
  candidate_id: string
  name: string
  email: string
  initials: string
  score: number
  status: string
  job_id: string
  application_id: string
  applied: string
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function CandidatesPage() {
  const [rows, setRows] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("All")

  useEffect(() => {
    Promise.all([getCandidates(), getApplications()])
      .then(([candidates, applications]: [Candidate[], Application[]]) => {
        const appMap: Record<string, Application> = {}
        applications.forEach((app) => {
          // keep highest score per candidate
          const existing = appMap[app.candidate_id]
          if (!existing || (app.overall_score ?? 0) > (existing.overall_score ?? 0)) {
            appMap[app.candidate_id] = app
          }
        })

        const merged: CandidateRow[] = candidates.map((c) => {
          const app = appMap[c.candidate_id]
          return {
            candidate_id: c.candidate_id,
            name: c.name,
            email: c.email,
            initials: getInitials(c.name),
            score: app?.overall_score ? Math.round(app.overall_score) : 0,
            status: app?.status ?? "New",
            job_id: app?.job_id ?? "",
            application_id: app?.application_id ?? "",
            applied: timeAgo(new Date()),
          }
        })

        // sort by score descending
        merged.sort((a, b) => b.score - a.score)
        setRows(merged)
      })
      .catch(() => toast.error("Failed to load candidates"))
      .finally(() => setLoading(false))
  }, [])

  const stages = ["All", "New", "Screening", "Interview", "Offer", "shortlisted", "rejected"]

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchesQuery =
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.email.toLowerCase().includes(query.toLowerCase())
        const matchesStage =
          stageFilter === "All" || r.status.toLowerCase() === stageFilter.toLowerCase()
        return matchesQuery && matchesStage
      }),
    [rows, query, stageFilter]
  )

  return (
    <>
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">
            Talent pool
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Candidates</h1>
          <p className="mt-2 text-sm text-gray-500">
            Review, compare, and move great people through your pipeline.
          </p>
        </div>
      </div>

      <div className={cn(card, "overflow-hidden")}>
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="size-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
              placeholder="Search by name or role"
            />
          </label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 outline-none"
          >
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
            <SlidersHorizontal className="size-4" />
            More filters
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-8 text-gray-300" />
            <p className="mt-3 font-bold text-gray-700">No candidates found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or stage filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Candidate</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Score</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Stage</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Applied</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.candidate_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/candidates/${c.candidate_id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#3346d3]/8 text-xs font-extrabold text-[#3346d3]">
                          {c.initials}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <ScorePill score={c.score} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{c.applied}</td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/candidates/${c.candidate_id}`}>
                        <ChevronRight className="size-4 text-gray-400" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}