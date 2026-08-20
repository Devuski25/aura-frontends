import { cn } from "@/lib/utils"

type LogoSize = "sm" | "md" | "lg"

const wordmarkSize: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
}

const subtitleSize: Record<LogoSize, string> = {
  sm: "text-[0.5rem]",
  md: "text-[0.5rem]",
  lg: "text-[0.55rem]",
}

type LogoProps = {
  variant?: "full" | "mark"
  size?: LogoSize
  withSubtitle?: boolean
  className?: string
}

export function Logo({
  variant = "full",
  size = "md",
  withSubtitle = false,
  className,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <span
        title="AURA-Dx"
        aria-label="AURA-Dx"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aura-accent to-aura-accent-dark font-display text-sm font-bold tracking-tight text-white shadow-[0_4px_14px_rgba(42,154,99,0.35)]",
          className
        )}
      >
        Dx
      </span>
    )
  }

  return (
    <span
      title="AURA-Dx — Acoustic Unit for Respiratory Analysis"
      className={cn("flex min-w-0 flex-col", className)}
    >
      <span
        className={cn(
          "flex items-baseline font-display font-semibold tracking-widest text-aura-text",
          wordmarkSize[size]
        )}
      >
        <span>AURA</span>
        <span aria-hidden="true" className="mx-0.5 text-aura-muted">
          -
        </span>
        <span className="bg-gradient-to-r from-aura-accent to-aura-accent-dark bg-clip-text text-transparent">
          Dx
        </span>
      </span>
      {withSubtitle && (
        <span
          className={cn(
            "mt-1 truncate font-medium uppercase tracking-[0.18em] text-aura-muted",
            subtitleSize[size]
          )}
        >
          Acoustic Unit for Respiratory Analysis
        </span>
      )}
    </span>
  )
}