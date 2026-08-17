import { cn } from "@/lib/utils"

export function ScorePill({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold",
        score >= 90
          ? "bg-emerald-50 text-emerald-700"
          : score >= 75
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700"
      )}
    >
      {score}%
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Draft: "bg-gray-100 text-gray-600",
    Closed: "bg-red-50 text-red-600",
    New: "bg-blue-50 text-blue-700",
    Screening: "bg-purple-50 text-purple-700",
    Interview: "bg-amber-50 text-amber-700",
    Offer: "bg-emerald-50 text-emerald-700",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold",
        styles[status] ?? "bg-gray-100 text-gray-600"
      )}
    >
      {status}
    </span>
  )
}