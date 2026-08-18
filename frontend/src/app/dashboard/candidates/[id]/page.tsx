"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  CalendarDays,
  Download,
  ChevronDown,
} from "lucide-react"
import { getCandidate, getApplicationsByCandidate } from "@/lib/api"
import { ScorePill, StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const card =
  "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

const stages = ["pending", "screening", "interview", "offer", "rejected"]

interface Candidate {
  candidate_id: string
  name: string
  email: string
  phone?: string
  linkedin?: string
  github?: string
  personal_portfolio?: string
  address?: string
}

interface Application {
  application_id: string
  candidate_id: string
  job_id: string
  status: string
  overall_score?: number
  skills_score?: number
  experience_score?: number
  project_score?: number
  education_score?: number
  scoring_reasoning?: string
}

/**
 * Backend scores are calculated out of 10.
 * Convert them to percentages for frontend display.
 *
 * Example:
 * 8  -> 80%
 * 7.5 -> 75%
 * 10 -> 100%
 */
function scoreToPercentage(score: number): number {
  return Math.min(100, Math.max(0, (score / 10) * 100))
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState("")
  const [stageOpen, setStageOpen] = useState(false)
  const [note, setNote] = useState("")

  useEffect(() => {
    Promise.all([getCandidate(id), getApplicationsByCandidate(id)])
      .then(([c, apps]) => {
        setCandidate(c)

        if (Array.isArray(apps) && apps.length > 0) {
          const app = apps.sort(
            (a: Application, b: Application) =>
              (b.overall_score ?? 0) - (a.overall_score ?? 0)
          )[0]

          setApplication(app)
          setStage(app.status)
        }
      })
      .catch(() => toast.error("Failed to load candidate"))
      .finally(() => setLoading(false))
  }, [id])

  /*
   * These values come from the backend as scores out of 10.
   *
   * Example:
   * skills_score = 8
   *
   * Frontend:
   * 8 / 10 * 100 = 80%
   */
  const scoreRows = [
    {
      label: "Skills",
      value: application?.skills_score,
    },
    {
      label: "Experience",
      value: application?.experience_score,
    },
    {
      label: "Projects",
      value: application?.project_score,
    },
    {
      label: "Education",
      value: application?.education_score,
    },
  ].filter(
    (r): r is { label: string; value: number } =>
      r.value !== null && r.value !== undefined
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="font-bold text-gray-700">Candidate not found.</p>

        <Link
          href="/dashboard/candidates"
          className="text-sm font-bold text-[#3346d3]"
        >
          Back to candidates
        </Link>
      </div>
    )
  }

  const initials = getInitials(candidate.name)

  /*
   * Overall score is also out of 10.
   * Convert it to percentage before sending it to ScorePill.
   */
  const overallPercentage =
    application?.overall_score !== undefined &&
    application?.overall_score !== null
      ? scoreToPercentage(application.overall_score)
      : 0

  return (
    <>
      {/* Back */}
      <Link
        href="/dashboard/candidates"
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft className="size-4" />
        Back to candidates
      </Link>

      {/* Header card */}
      <section className={cn(card, "overflow-hidden mb-5")}>
        <div className="h-1.5 bg-[#3346d3]" />

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {/* Avatar */}
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#3346d3]/10 text-lg font-extrabold text-[#3346d3]">
            {initials}
          </span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {candidate.name}
              </h1>

              {overallPercentage > 0 && (
                <ScorePill score={Math.round(overallPercentage)} />
              )}

              {stage && <StatusPill status={stage} />}
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
              {/* Email */}
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" />
                {candidate.email}
              </span>

              {/* Phone */}
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {candidate.phone}
                </span>
              )}

              {/* Address */}
              {candidate.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {candidate.address}
                </span>
              )}

              {/* LinkedIn */}
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#3346d3]"
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}

              {/* GitHub */}
              {candidate.github && (
                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#3346d3]"
                >
                  <svg
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </a>
              )}

              {/* Portfolio */}
              {candidate.personal_portfolio && (
                <a
                  href={candidate.personal_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#3346d3]"
                >
                  <Globe className="size-3.5" />
                  Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Stage dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setStageOpen(!stageOpen)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              {stage || "Set stage"}
              <ChevronDown className="size-4" />
            </button>

            {stageOpen && (
              <div className="absolute right-0 top-11 z-10 w-44 rounded-xl border border-gray-100 bg-white shadow-lg">
                {stages.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStage(s)
                      setStageOpen(false)
                      toast.success(`Stage updated to ${s}`)
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-semibold capitalize hover:bg-gray-50",
                      stage === s
                        ? "text-[#3346d3]"
                        : "text-gray-700"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* AI Evaluation */}
          {application && (
            <section className={cn(card, "p-6")}>
              <h2 className="font-extrabold text-gray-900">
                AI evaluation
              </h2>

              {application.scoring_reasoning && (
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  {application.scoring_reasoning}
                </p>
              )}

              {scoreRows.length > 0 ? (
                <div className="mt-6 flex flex-col gap-5">
                  {scoreRows.map(({ label, value }) => {
                    /*
                     * Backend:
                     * value = 8
                     *
                     * Frontend:
                     * percentage = 80
                     */
                    const percentage = scoreToPercentage(value)

                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {label}
                          </span>

                          <span className="font-extrabold text-gray-900">
                            {Math.round(percentage)}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${percentage}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: "easeOut",
                            }}
                            className="h-full rounded-full bg-[#3346d3]"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">
                  No scores available yet.
                </p>
              )}
            </section>
          )}

          {/* Application details */}
          {application && (
            <section className={cn(card, "p-6")}>
              <h2 className="font-extrabold text-gray-900">
                Application details
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {/* Status */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-bold capitalize text-gray-800">
                    {application.status}
                  </p>
                </div>

                {/* Overall score */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Overall score
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {application.overall_score !== undefined &&
                    application.overall_score !== null
                      ? `${Math.round(
                          scoreToPercentage(application.overall_score)
                        )}%`
                      : "—"}
                  </p>
                </div>

                {/* Application ID */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Application ID
                  </p>

                  <p className="mt-1 truncate font-mono text-xs text-gray-400">
                    {application.application_id}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right */}
        <aside className="flex flex-col gap-5">
          {/* Recruiter notes */}
          <section className={cn(card, "p-5")}>
            <h2 className="font-extrabold text-gray-900">
              Recruiter notes
            </h2>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this candidate..."
              rows={5}
              className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20 text-gray-600"
            />

            <button
              onClick={() => toast.success("Note saved")}
              className="mt-3 w-full rounded-xl bg-[#3346d3] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2a3ab8]"
            >
              Save note
            </button>
          </section>

          {/* Next step */}
          <section className={cn(card, "p-5")}>
            <h2 className="font-extrabold text-gray-900">
              Next step
            </h2>

            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() =>
                  toast.success("Interview invite prepared")
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <CalendarDays className="size-4" />
                Schedule interview
              </button>

              <button
                onClick={() =>
                  toast.success("Downloading resume...")
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="size-4" />
                Download resume
              </button>
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}