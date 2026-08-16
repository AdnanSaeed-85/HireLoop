export type Candidate = {
  id: string
  name: string
  initials: string
  role: string
  email: string
  location: string
  score: number
  stage: "New" | "Screening" | "Interview" | "Offer"
  applied: string
  skills: string[]
}

export type Job = {
  id: string
  title: string
  department: string
  location: string
  type: string
  candidates: number
  status: "Active" | "Draft" | "Paused"
  posted: string
}

export const candidates: Candidate[] = [
  { id: "maya-chen", name: "Maya Chen", initials: "MC", role: "Senior Product Designer", email: "maya.chen@example.com", location: "San Francisco, CA", score: 96, stage: "Interview", applied: "2 hours ago", skills: ["Product strategy", "Figma", "Research"] },
  { id: "liam-patel", name: "Liam Patel", initials: "LP", role: "Frontend Engineer", email: "liam.patel@example.com", location: "Austin, TX", score: 91, stage: "Screening", applied: "5 hours ago", skills: ["React", "TypeScript", "Design systems"] },
  { id: "sofia-martin", name: "Sofia Martin", initials: "SM", role: "Product Manager", email: "sofia.martin@example.com", location: "New York, NY", score: 88, stage: "New", applied: "Yesterday", skills: ["Roadmapping", "Analytics", "Growth"] },
  { id: "noah-williams", name: "Noah Williams", initials: "NW", role: "Data Analyst", email: "noah.w@example.com", location: "Remote", score: 84, stage: "Offer", applied: "2 days ago", skills: ["SQL", "Python", "Looker"] },
  { id: "ava-johnson", name: "Ava Johnson", initials: "AJ", role: "Senior Product Designer", email: "ava.j@example.com", location: "Seattle, WA", score: 78, stage: "Screening", applied: "3 days ago", skills: ["Prototyping", "UX writing", "Systems"] },
  { id: "ethan-kim", name: "Ethan Kim", initials: "EK", role: "Frontend Engineer", email: "ethan.k@example.com", location: "Boston, MA", score: 74, stage: "New", applied: "4 days ago", skills: ["Vue", "CSS", "Accessibility"] },
]

export const jobs: Job[] = [
  { id: "product-designer", title: "Senior Product Designer", department: "Design", location: "San Francisco", type: "Full-time", candidates: 24, status: "Active", posted: "Aug 12" },
  { id: "frontend-engineer", title: "Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time", candidates: 38, status: "Active", posted: "Aug 10" },
  { id: "product-manager", title: "Product Manager", department: "Product", location: "New York", type: "Full-time", candidates: 17, status: "Active", posted: "Aug 8" },
  { id: "data-analyst", title: "Data Analyst", department: "Data", location: "Remote", type: "Contract", candidates: 12, status: "Paused", posted: "Aug 5" },
  { id: "brand-lead", title: "Brand Design Lead", department: "Design", location: "London", type: "Full-time", candidates: 0, status: "Draft", posted: "Not published" },
]

export const pipeline = [
  { name: "Applied", value: 64 },
  { name: "Screening", value: 42 },
  { name: "Interview", value: 28 },
  { name: "Offer", value: 12 },
  { name: "Hired", value: 8 },
]

export const trend = [
  { day: "Mon", candidates: 8 }, { day: "Tue", candidates: 13 }, { day: "Wed", candidates: 11 },
  { day: "Thu", candidates: 19 }, { day: "Fri", candidates: 17 }, { day: "Sat", candidates: 24 }, { day: "Sun", candidates: 28 },
]

export const activity = [
  { title: "Maya Chen moved to Interview", meta: "Senior Product Designer · 12 min ago" },
  { title: "New application from Liam Patel", meta: "Frontend Engineer · 42 min ago" },
  { title: "Sofia Martin scored 88%", meta: "Product Manager · 1 hr ago" },
  { title: "Offer approved for Noah Williams", meta: "Data Analyst · 3 hrs ago" },
]
