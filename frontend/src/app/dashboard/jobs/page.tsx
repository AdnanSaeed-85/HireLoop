"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { BriefcaseBusiness, Search, Plus, MoreHorizontal, X } from "lucide-react"
import { getJobs, createJob, deleteJob } from "@/lib/api"
import { StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

interface Job {
  job_id: string
  title: string
  description: string
  requirements?: string
  experience_years?: number
  is_active: boolean
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    experience_years: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await getJobs()
      setJobs(data)
    } catch (err) {
      toast.error("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase())),
    [jobs, query]
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    try {
      const data = await createJob({
        title: form.title,
        description: form.description,
        requirements: form.requirements || undefined,
        experience_years: form.experience_years ? parseInt(form.experience_years) : undefined,
      })
      setJobs((prev) => [data, ...prev])
      setForm({ title: "", description: "", requirements: "", experience_years: "" })
      setShowModal(false)
      toast.success("Job created successfully")
    } catch {
      toast.error("Failed to create job")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId)
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId))
      toast.success("Job deleted")
    } catch {
      toast.error("Failed to delete job")
    } finally {
      setOpenMenuId(null)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-5 sm:mb-7 flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">
            Hiring plan
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create roles, monitor applicant volume, and keep every opening moving.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#3346d3] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2a3ab8] transition-colors"
        >
          <Plus className="size-4" /> Create job
        </button>
      </div>

      <div className={cn(card, "overflow-hidden")}>
        {/* Search */}
        <div className="flex gap-3 border-b border-gray-100 p-3 sm:p-4">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="size-4 text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
              placeholder="Search open roles"
            />
          </label>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#3346d3] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <BriefcaseBusiness className="mx-auto size-8 text-gray-300" />
            <p className="mt-3 font-bold text-gray-700">No jobs found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different search or create a new role.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((job, i) => (
              <motion.article
                key={job.job_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <span className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-[#3346d3]/8 text-[#3346d3]">
                  <BriefcaseBusiness className="size-4 sm:size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold text-gray-900 text-sm sm:text-base">{job.title}</h2>
                    <StatusPill status={job.is_active ? "Active" : "Draft"} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {job.experience_years
                      ? `${job.experience_years}+ years experience`
                      : "No experience requirement"}
                    {job.requirements
                      ? ` · ${job.requirements.slice(0, 60)}${job.requirements.length > 60 ? "..." : ""}`
                      : ""}
                  </p>
                </div>

                {/* Candidates count — hidden on smallest screens */}
                <div className="text-right hidden xs:block sm:block">
                  <p className="text-lg font-extrabold text-gray-900">—</p>
                  <p className="text-xs text-gray-400">candidates</p>
                </div>

                {/* Menu */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === job.job_id ? null : job.job_id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <MoreHorizontal className="size-5 text-gray-400" />
                  </button>
                  {openMenuId === job.job_id && (
                    <div className="absolute right-0 top-9 z-10 w-36 rounded-xl border border-gray-100 bg-white shadow-lg">
                      <button
                        onClick={() => handleDelete(job.job_id)}
                        className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                      >
                        Delete job
                      </button>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Create a new job</h2>
                <p className="mt-1 text-sm text-gray-400">Fill in the details to post a new role.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X className="size-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 sm:mt-6 flex flex-col gap-4">
              <label className="text-sm font-bold text-gray-700">
                Job title *
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <label className="text-sm font-bold text-gray-700">
                Description *
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe the role and responsibilities"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <label className="text-sm font-bold text-gray-700">
                Requirements
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={2}
                  placeholder="List key requirements"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <label className="text-sm font-bold text-gray-700">
                Experience (years)
                <input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  placeholder="e.g. 3"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <div className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-xl bg-[#3346d3] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2a3ab8] disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create job"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  )
}