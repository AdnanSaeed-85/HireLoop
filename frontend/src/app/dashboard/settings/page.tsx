"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Settings, User, Building2, Bell, Cpu, Shield } from "lucide-react"
import { getSettings, updateSettings, getMe } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const card = "rounded-2xl border border-gray-100 bg-white shadow-[0_10px_35px_rgba(29,78,216,.05)]"

const tabs = [
  { label: "Profile", icon: User },
  { label: "Organization", icon: Building2 },
  { label: "Notifications", icon: Bell },
  { label: "Workflow & AI", icon: Cpu },
  { label: "Security", icon: Shield },
]

interface SettingsData {
  setting_id: string
  threshold: number
  openai_model?: string
}

interface UserData {
  name: string
  email: string
  role: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile")
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile form
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  // AI form
  const [threshold, setThreshold] = useState("")
  const [openaiModel, setOpenaiModel] = useState("")
  const [openaiKey, setOpenaiKey] = useState("")

  useEffect(() => {
    Promise.all([getMe(), getSettings()])
      .then(([userData, settingsData]) => {
        setUser(userData)
        setSettings(settingsData)

        const parts = userData.name.trim().split(" ")
        setFirstName(parts[0] ?? "")
        setLastName(parts.slice(1).join(" ") ?? "")
        setEmail(userData.email ?? "")

        setThreshold(String(settingsData.threshold ?? ""))
        setOpenaiModel(settingsData.openai_model ?? "gpt-4o")
      })
      .catch(() => {
        toast.error("Failed to load settings")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings({
        threshold: parseFloat(threshold),
        openai_model: openaiModel,
        ...(openaiKey ? { openai_api_key: openaiKey } : {}),
      })
      toast.success("AI settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Profile settings saved")
  }

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
      <div className="mb-7">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#3346d3]">
          Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your team, preferences, automation, and account security.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Sidebar tabs */}
        <nav className={cn(card, "h-fit p-2")}>
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                activeTab === label
                  ? "bg-[#3346d3]/8 text-[#3346d3]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(card, "p-6")}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{activeTab}</h2>
              <p className="mt-1 text-sm text-gray-400">
                Update your {activeTab.toLowerCase()} preferences.
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#3346d3]/8 text-[#3346d3]">
              <Settings className="size-5" />
            </span>
          </div>

          {/* Profile Tab */}
          {activeTab === "Profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold text-gray-700">
                  First name
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  Last name
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                  />
                </label>
                <label className="text-sm font-bold text-gray-700 sm:col-span-2">
                  Work email
                  <input
                    value={email}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  Role
                  <input
                    value={user?.role ?? ""}
                    disabled
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-normal text-gray-400 outline-none cursor-not-allowed"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#3346d3] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a3ab8] transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}

          {/* Workflow & AI Tab */}
          {activeTab === "Workflow & AI" && (
            <form onSubmit={handleSaveAI} className="flex flex-col gap-5">
              <label className="text-sm font-bold text-gray-700">
                Scoring threshold
                <p className="mt-0.5 text-xs font-normal text-gray-400">
                  Minimum score (out of 10) for a candidate to pass AI screening.
                </p>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <label className="text-sm font-bold text-gray-700">
                OpenAI model
                <select
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                >
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                </select>
              </label>

              <label className="text-sm font-bold text-gray-700">
                OpenAI API key
                <p className="mt-0.5 text-xs font-normal text-gray-400">
                  Leave blank to keep the existing key.
                </p>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#3346d3] focus:ring-2 focus:ring-[#3346d3]/20"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#3346d3] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a3ab8] disabled:opacity-60 transition-colors"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}

          {/* Other tabs — placeholder */}
          {!["Profile", "Workflow & AI"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#3346d3]/8 text-[#3346d3]">
                <Settings className="size-7" />
              </span>
              <p className="mt-4 font-bold text-gray-700">{activeTab} settings</p>
              <p className="mt-1 text-sm text-gray-400">
                This section is coming soon.
              </p>
            </div>
          )}
        </motion.section>
      </div>
    </>
  )
}