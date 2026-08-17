const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
})

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error("Invalid email or password")
  return res.json()
}

export const register = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
  if (!res.ok) throw new Error("Registration failed")
  return res.json()
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const getJobs = async () => {
  const res = await fetch(`${API_URL}/api/jd/all`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch jobs")
  return res.json()
}

export const createJob = async (data: object) => {
  const res = await fetch(`${API_URL}/api/jd/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Failed to create job")
  return res.json()
}

export const updateJob = async (id: string, data: object) => {
  const res = await fetch(`${API_URL}/api/jd/update/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Failed to update job")
  return res.json()
}

export const deleteJob = async (id: string) => {
  const res = await fetch(`${API_URL}/api/jd/delete/${id}`, {
    method: "DELETE",
    headers: headers()
  })
  if (!res.ok) throw new Error("Failed to delete job")
  return res.json()
}

export const getJobById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/jd/${id}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch job")
  return res.json()
}

// ─── CANDIDATES ───────────────────────────────────────────────────────────────

export const getCandidates = async () => {
  const res = await fetch(`${API_URL}/api/candidate/all`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch candidates")
  return res.json()
}

export const getCandidate = async (id: string) => {
  const res = await fetch(`${API_URL}/api/candidate/${id}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch candidate")
  return res.json()
}

export const deleteCandidate = async (id: string) => {
  const res = await fetch(`${API_URL}/api/candidate/${id}`, {
    method: "DELETE",
    headers: headers()
  })
  if (!res.ok) throw new Error("Failed to delete candidate")
  return res.json()
}

export const getCandidatesByJob = async (jobId: string) => {
  const res = await fetch(`${API_URL}/api/candidate/by-job/${jobId}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch candidates by job")
  return res.json()
}

export const getShortlisted = async (jobId: string) => {
  const res = await fetch(`${API_URL}/api/candidate/shortlisted/${jobId}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch shortlisted candidates")
  return res.json()
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export const getApplications = async () => {
  const res = await fetch(`${API_URL}/api/application/all`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch applications")
  return res.json()
}

export const getApplication = async (id: string) => {
  const res = await fetch(`${API_URL}/api/application/${id}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch application")
  return res.json()
}

export const getApplicationsByCandidate = async (candidateId: string) => {
  const res = await fetch(`${API_URL}/api/application/candidate/${candidateId}`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch applications")
  return res.json()
}

// ─── HITL ─────────────────────────────────────────────────────────────────────

export const getPendingHITL = async () => {
  const res = await fetch(`${API_URL}/api/hitl/pending`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch pending HITL")
  return res.json()
}

export const submitHITLDecision = async (applicationId: string, action: string, notes?: string) => {
  const res = await fetch(`${API_URL}/api/hitl/decide/${applicationId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ hr_action: action, hr_notes: notes })
  })
  if (!res.ok) throw new Error("Failed to submit decision")
  return res.json()
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export const getChatSessions = async () => {
  const res = await fetch(`${API_URL}/api/chat/sessions/all`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch sessions")
  return res.json()
}

export const startChatSession = async (candidateId: string) => {
  const res = await fetch(`${API_URL}/api/chat/session/start/${candidateId}`, {
    method: "POST",
    headers: headers()
  })
  if (!res.ok) throw new Error("Failed to start session")
  return res.json()
}

export const sendChatMessage = async (sessionId: string, content: string) => {
  const res = await fetch(`${API_URL}/api/chat/session/${sessionId}/message`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error("Failed to send message")
  return res.json()
}

export const getChatHistory = async (sessionId: string) => {
  const res = await fetch(`${API_URL}/api/chat/session/${sessionId}/history`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch history")
  return res.json()
}

// ─── APPLY (PUBLIC) ───────────────────────────────────────────────────────────

export const getActiveJobs = async () => {
  const res = await fetch(`${API_URL}/api/jd/all`)
  if (!res.ok) throw new Error("Failed to fetch jobs")
  return res.json()
}

export const submitApplication = async (formData: FormData) => {
  const res = await fetch(`${API_URL}/api/apply/submit`, {
    method: "POST",
    body: formData
  })
  if (!res.ok) throw new Error("Failed to submit application")
  return res.json()
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/api/settings`, { headers: headers() })
  if (!res.ok) throw new Error("Failed to fetch settings")
  return res.json()
}

export const updateSettings = async (data: object) => {
  const res = await fetch(`${API_URL}/api/settings`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Failed to update settings")
  return res.json()
}