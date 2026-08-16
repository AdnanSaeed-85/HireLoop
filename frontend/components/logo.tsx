import { Sparkles } from "lucide-react"

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="HireLoop">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="size-4" /></span>
      {!compact && <span className="font-sans text-lg font-extrabold tracking-tight text-foreground">hire<span className="text-primary">loop</span></span>}
    </div>
  )
}
