"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react"
import { getApplicationsByCandidate, getCandidate } from "@/lib/api"
import { StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

interface Candidate {
  candidate_id: string
  name: string
  email: string
  phone?: string | null
  linkedin?: string | null
  github?: string | null
  personal_portfolio?: string | null
  address?: string | null
}

interface Application {
  application_id: string
  candidate_id: string
  job_id: string
  status: string
  skills_score?: number | null
  skills_matched?: string | null
  skills_missing?: string | null
  skills_reasoning?: string | null
  experience_score?: number | null
  experience_years_found?: number | null
  experience_years_required?: number | null
  experience_reasoning?: string | null
  project_score?: number | null
  project_relevent?: string | null
  project_reasoning?: string | null
  education_score?: number | null
  education_degree?: string | null
  education_reasoning?: string | null
  overall_score?: number | null
  scoring_reasoning?: string | null
  recommendation?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function score(value?: number | null): string {
  return value === null || value === undefined ? "Not available" : `${value}/10`
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-1 wrap-break-word text-sm leading-6 text-gray-700">{value || "Not available"}</dd>
    </div>
  )
}

function EvaluationSection({ application }: { application: Application }) {
  type Evaluation = {
    title: string
    score?: number | null
    fields: Array<[string, string | number | null | undefined]>
  }

  const evaluations: Evaluation[] = [
    {
      title: "Skills evaluation",
      score: application.skills_score,
      fields: [
        ["Matched skills", application.skills_matched],
        ["Missing skills", application.skills_missing],
        ["Reasoning", application.skills_reasoning],
      ],
    },
    {
      title: "Experience evaluation",
      score: application.experience_score,
      fields: [
        ["Years found", application.experience_years_found],
        ["Years required", application.experience_years_required],
        ["Reasoning", application.experience_reasoning],
      ],
    },
    {
      title: "Project evaluation",
      score: application.project_score,
      fields: [
        ["Relevant projects", application.project_relevent],
        ["Reasoning", application.project_reasoning],
      ],
    },
    {
      title: "Education evaluation",
      score: application.education_score,
      fields: [
        ["Degree", application.education_degree],
        ["Reasoning", application.education_reasoning],
      ],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {evaluations.map((evaluation) => (
        <section key={evaluation.title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-gray-900">{evaluation.title}</h3>
            <span className="rounded-lg bg-white px-2.5 py-1 text-sm font-extrabold text-[#3346d3]">
              {score(evaluation.score)}
            </span>
          </div>
          <dl className="mt-4 space-y-3">
            {evaluation.fields.map(([label, value]) => (
              <Detail key={label} label={label} value={value} />
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCandidate(id), getApplicationsByCandidate(id)])
      .then(([candidateData, applicationData]) => {
        setCandidate(candidateData)
        setApplications(Array.isArray(applicationData) ? applicationData : [])
      })
      .catch(() => toast.error("Failed to load candidate details"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" /></div>
  }

  if (!candidate) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="font-bold text-gray-700">Candidate not found.</p>
        <Link href="/dashboard/candidates" className="text-sm font-bold text-[#3346d3]">Back to candidates</Link>
      </div>
    )
  }

  return (
    <main className="space-y-5 pb-10">
      <Link href="/dashboard/candidates" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700">
        <ArrowLeft className="size-4" /> Back to candidates
      </Link>

      <section className={cn(card, "overflow-hidden")}>
        <div className="h-1.5 bg-[#3346d3]" />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#3346d3]/10 text-2xl font-extrabold text-[#3346d3]">{getInitials(candidate.name)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">Candidate profile</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">{candidate.name}</h1>
            <p className="mt-1 text-sm text-gray-400">Candidate ID: {candidate.candidate_id}</p>
          </div>
          {applications[0] && <StatusPill status={applications[0].status} />}
        </div>
      </section>

      <section className={cn(card, "p-6")}>
        <div className="flex items-center gap-2"><UserRound className="size-5 text-[#3346d3]" /><h2 className="text-lg font-extrabold text-gray-900">Personal information</h2></div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Full name" value={candidate.name} />
          <Detail label="Email" value={candidate.email} />
          <Detail label="Phone" value={candidate.phone} />
          <Detail label="Address" value={candidate.address} />
          <Detail label="Candidate ID" value={candidate.candidate_id} />
        </dl>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
          {candidate.email && <a href={`mailto:${candidate.email}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"><Mail className="size-4" /> Email</a>}
          {candidate.phone && <a href={`tel:${candidate.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"><Phone className="size-4" /> Call</a>}
          {candidate.address && <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-500"><MapPin className="size-4" /> Location available</span>}
          {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"><ExternalLink className="size-4" /> LinkedIn</a>}
          {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"><GitBranch className="size-4" /> GitHub</a>}
          {candidate.personal_portfolio && <a href={candidate.personal_portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"><Globe className="size-4" /> Portfolio</a>}
        </div>
      </section>

      <section className={cn(card, "p-6")}>
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><BriefcaseBusiness className="size-5 text-[#3346d3]" /><h2 className="text-lg font-extrabold text-gray-900">Application history</h2></div><span className="text-sm font-bold text-gray-400">{applications.length} application{applications.length === 1 ? "" : "s"}</span></div>
        {applications.length === 0 ? <p className="mt-5 text-sm text-gray-400">No application data available.</p> : <div className="mt-5 space-y-5">{applications.map((application, index) => <article key={application.application_id} className="rounded-xl border border-gray-100 p-5"><div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#3346d3]">Application {index + 1}</p><h3 className="mt-1 text-xl font-extrabold text-gray-900">Job ID: {application.job_id}</h3><p className="mt-1 font-mono text-xs text-gray-400">{application.application_id}</p></div><StatusPill status={application.status} /></div><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Overall score" value={score(application.overall_score)} /><Detail label="Recommendation" value={application.recommendation} /><Detail label="Created" value={formatDate(application.created_at)} /><Detail label="Updated" value={formatDate(application.updated_at)} /></dl><div className="mt-6"><h4 className="mb-4 flex items-center gap-2 font-extrabold text-gray-900"><FileText className="size-4 text-[#3346d3]" /> Evaluation details</h4><EvaluationSection application={application} /></div>{application.scoring_reasoning && <div className="mt-5 rounded-xl bg-[#3346d3]/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#3346d3]">Overall reasoning</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{application.scoring_reasoning}</p></div>}</article>)}</div>}
      </section>
    </main>
  )
}
