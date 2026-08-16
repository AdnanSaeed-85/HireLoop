"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { candidates as initialCandidates, jobs as initialJobs, type Candidate, type Job } from "@/lib/demo-data"

type AppContextValue = {
  candidates: Candidate[]
  jobs: Job[]
  addJob: (job: Omit<Job, "id" | "candidates" | "posted">) => void
  updateCandidate: (id: string, stage: Candidate["stage"]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [jobs, setJobs] = useState(initialJobs)
  const value = useMemo(() => ({
    candidates,
    jobs,
    addJob: (job: Omit<Job, "id" | "candidates" | "posted">) => setJobs((items) => [{ ...job, id: job.title.toLowerCase().replace(/\s+/g, "-"), candidates: 0, posted: "Just now" }, ...items]),
    updateCandidate: (id: string, stage: Candidate["stage"]) => setCandidates((items) => items.map((candidate) => candidate.id === id ? { ...candidate, stage } : candidate)),
  }), [candidates, jobs])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error("useApp must be used within AppProvider")
  return value
}
