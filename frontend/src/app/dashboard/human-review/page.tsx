"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CircleAlert, Check, X } from "lucide-react"
import { getPendingHITL, submitHITLDecision, getCandidates } from "@/lib/api"
import { ScorePill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

interface Application {
  application_id: string
  candidate_id: string
  job_id: string
  status: string
  overall_score?: number
  scoring_reasoning?: string
}

interface Candidate {
  candidate_id: string
  name: string
  email: string
}

interface ReviewCard extends Application {
  candidateName: string
  initials: string
  priority: boolean
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function HumanReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPendingHITL(), getCandidates()])
      .then(([applications, candidates]: [Application[], Candidate[]]) => {
        const candidateMap: Record<string, Candidate> = {}
        candidates.forEach((c) => (candidateMap[c.candidate_id] = c))

        const merged: ReviewCard[] = applications.map((app, i) => {
          const candidate = candidateMap[app.candidate_id]
          const name = candidate?.name ?? "Unknown"
          return {
            ...app,
            candidateName: name,
            initials: getInitials(name),
            priority: i === 0,
          }
        })

        setCards(merged)
      })
      .catch(() => {
        // 404 means no pending — that's fine
        setCards([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDecision = async (applicationId: string, action: "approved_rejection" | "manual_review", label: string) => {
    setActing(applicationId)
    try {
      await submitHITLDecision(applicationId, action)
      setCards((prev) => prev.filter((c) => c.application_id !== applicationId))
      toast.success(label)
    } catch {
      toast.error("Failed to submit decision")
    } finally {
      setActing(null)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-7">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">
          Decision queue
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Human review</h1>
        <p className="mt-2 text-sm text-gray-500">
          High-impact decisions where your judgment makes the difference.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" />
        </div>
      ) : cards.length === 0 ? (
        <div className={cn(card, "p-12 text-center")}>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#3346d3]/10">
            <Check className="size-7 text-[#3346d3]" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-gray-900">Queue cleared</h2>
          <p className="mt-2 text-sm text-gray-400">
            Every decision has been reviewed. Nicely done.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {cards.map((c, i) => (
              <motion.article
                key={c.application_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                className={cn(card, "overflow-hidden")}
              >
                {/* Top accent */}
                <div className={cn("h-1.5", c.priority ? "bg-red-400" : "bg-[#3346d3]")} />

                <div className="p-5">
                  {/* Avatar + priority */}
                  <div className="flex items-start justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[#3346d3]/10 text-sm font-extrabold text-[#3346d3]">
                      {c.initials}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-bold",
                        c.priority ? "text-red-500" : "text-amber-600"
                      )}
                    >
                      <CircleAlert className="size-3.5" />
                      {c.priority ? "High priority" : "Review"}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="mt-4 text-lg font-extrabold text-gray-900">{c.candidateName}</h2>
                  <p className="text-sm text-gray-400">{c.status}</p>

                  {/* AI recommendation */}
                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      AI Recommendation
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {c.scoring_reasoning?.slice(0, 120) ||
                        "Strong match, but compensation expectations need human confirmation before proceeding."}
                      {c.scoring_reasoning && c.scoring_reasoning.length > 120 ? "..." : ""}
                    </p>
                  </div>

                  {/* Score + view profile */}
                  <div className="mt-4 flex items-center justify-between">
                    <ScorePill score={c.overall_score ? Math.round(c.overall_score) : 0} />
                    <Link
                      href={`/dashboard/candidates/${c.candidate_id}`}
                      className="text-xs font-bold text-[#3346d3] hover:underline"
                    >
                      View profile
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      disabled={acting === c.application_id}
                      onClick={() => handleDecision(c.application_id, "manual_review", "Candidate approved for manual review")}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#3346d3] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#2a3ab8] disabled:opacity-60 transition-colors"
                    >
                      <Check className="size-4" /> Approve
                    </button>
                    <button
                      disabled={acting === c.application_id}
                      onClick={() => handleDecision(c.application_id, "approved_rejection", "Candidate declined")}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                    >
                      <X className="size-4" /> Decline
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}