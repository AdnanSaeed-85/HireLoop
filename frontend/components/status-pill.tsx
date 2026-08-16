import { cn } from "@/lib/utils"

const tones: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700", Interview: "bg-violet-50 text-violet-700", Offer: "bg-amber-50 text-amber-700",
  Screening: "bg-blue-50 text-blue-700", New: "bg-slate-100 text-slate-700", Draft: "bg-slate-100 text-slate-600", Paused: "bg-amber-50 text-amber-700",
}
export function StatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", tones[status] ?? "bg-muted text-muted-foreground")}>{status}</span>
}
export function ScorePill({ score }: { score: number }) {
  return <span className={cn("inline-flex min-w-12 justify-center rounded-full px-2.5 py-1 text-xs font-extrabold", score >= 90 ? "bg-emerald-50 text-emerald-700" : score >= 80 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700")}>{score}%</span>
}
