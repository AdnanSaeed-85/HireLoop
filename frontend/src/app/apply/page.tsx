"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { getActiveJobs, submitApplication } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Job {
  job_id: string
  title: string
}

interface FormErrors {
  name?: string
  email?: string
  job_id?: string
  cv?: string
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20 placeholder-gray-400"

const labelClass = "block text-sm font-bold text-gray-700"

export default function ApplyPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    personal_portfolio: "",
    address: "",
    job_id: "",
  })
  const [cvFile, setCvFile] = useState<File | null>(null)

  useEffect(() => {
    getActiveJobs()
      .then((data) => setJobs(data))
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false))
  }, [])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.name.trim()) newErrors.name = "Full name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address"
    if (!form.job_id) newErrors.job_id = "Please select a job role"
    if (!cvFile) newErrors.cv = "Please upload your CV"
    else if (!cvFile.name.endsWith(".pdf")) newErrors.cv = "Only PDF files are accepted"
    else if (cvFile.size > 10 * 1024 * 1024) newErrors.cv = "File size must be under 10MB"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setErrors((e) => ({ ...e, cv: "Only PDF files are accepted" }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, cv: "File size must be under 10MB" }))
      return
    }
    setCvFile(file)
    setErrors((e) => ({ ...e, cv: undefined }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    if (!validate()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      if (form.phone) formData.append("phone", form.phone)
      if (form.linkedin) formData.append("linkedin", form.linkedin)
      if (form.github) formData.append("github", form.github)
      if (form.personal_portfolio) formData.append("personal_portfolio", form.personal_portfolio)
      if (form.address) formData.append("address", form.address)
      formData.append("job_id", form.job_id)
      formData.append("cv", cvFile!)

      await submitApplication(formData)
      setSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-gray-900">Application submitted!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for applying. We'll review your application and get back to you soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ name: "", email: "", phone: "", linkedin: "", github: "", personal_portfolio: "", address: "", job_id: "" })
              setCvFile(null)
            }}
            className="mt-6 rounded-xl bg-[#3346d3] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2a3ab8] transition-colors"
          >
            Submit another application
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef0f8] py-10 px-4">
      <div className="mx-auto w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3346d3]">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">
            hire<span className="text-[#3346d3]">loop</span>
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(29,78,216,.07)]">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Apply for a role</h1>
          <p className="mt-1 text-sm text-gray-400">
            Fill out the form below and upload your CV to apply.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5 text-gray-700">
            {/* Full Name */}
            <div>
              <label className={labelClass}>
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Adnan Saeed"
                className={cn(inputClass, errors.name && "border-red-400 focus:border-red-400 focus:ring-red-400/20")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={cn(inputClass, errors.email && "border-red-400 focus:border-red-400 focus:ring-red-400/20")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+92 XXX XXXXXXX"
                className={inputClass}
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className={inputClass}
              />
            </div>

            {/* GitHub */}
            <div>
              <label className={labelClass}>GitHub URL</label>
              <input
                type="text"
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                placeholder="https://github.com/yourusername"
                className={inputClass}
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className={labelClass}>Portfolio URL</label>
              <input
                type="text"
                value={form.personal_portfolio}
                onChange={(e) => setForm({ ...form, personal_portfolio: e.target.value })}
                placeholder="https://yourportfolio.com"
                className={inputClass}
              />
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="City, Country"
                className={inputClass}
              />
            </div>

            {/* Job Role */}
            <div>
              <label className={labelClass}>
                Job role <span className="text-red-500">*</span>
              </label>
              <select
                value={form.job_id}
                onChange={(e) => setForm({ ...form, job_id: e.target.value })}
                disabled={jobsLoading}
                className={cn(
                  inputClass,
                  "cursor-pointer",
                  errors.job_id && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                )}
              >
                <option value="">
                  {jobsLoading ? "Loading jobs..." : "Select a role"}
                </option>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </select>
              {errors.job_id && <p className="mt-1 text-xs text-red-500">{errors.job_id}</p>}
            </div>

            {/* CV Upload */}
            <div>
              <label className={labelClass}>
                CV / Resume <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-1.5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors",
                  dragOver
                    ? "border-[#3346d3] bg-[#3346d3]/5"
                    : cvFile
                    ? "border-emerald-400 bg-emerald-50"
                    : errors.cv
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:border-[#3346d3] hover:bg-[#3346d3]/5"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
                {cvFile ? (
                  <>
                    <FileText className="size-8 text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-700">{cvFile.name}</p>
                    <p className="text-xs text-emerald-500">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCvFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
                    >
                      <X className="size-3" /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className={cn("size-8", dragOver ? "text-[#3346d3]" : "text-gray-400")} />
                    <p className="text-sm font-semibold text-gray-600">
                      Drag & drop your CV or <span className="text-[#3346d3] font-bold">browse</span>
                    </p>
                    <p className="text-xs text-gray-400">PDF only · Max 10MB</p>
                  </>
                )}
              </div>
              {errors.cv && <p className="mt-1 text-xs text-red-500">{errors.cv}</p>}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3346d3] py-3 text-sm font-bold text-white hover:bg-[#2a3ab8] disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit application →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}