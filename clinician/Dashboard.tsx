"use client"

import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { staggerContainer, staggerItem, cardHover } from "@/lib/motion"
import { cn } from "@/lib/utils"
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Stethoscope,
  Plus,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getResultBadge } from "@clinician/lib/badge-helpers"
import { MOCK_SCREENINGS } from "@/mocks/data"
import { toast } from "sonner"
import { NewPatientModal } from "@clinician/components/NewPatientModal"
import { EmptyState } from "@clinician/components/EmptyState"

interface Screening {
  id: string
  patient_name: string
  clinician_name: string
  tb_result: string
  respiratory_result: string | null
  status: string
  reviewed_by_name: string | null
  created_at: string
}

interface Stats {
  total: number
  tb_positive: number
  tb_negative: number
  healthy: number
  pneumonia: number
  copd: number
  pendingReview: number
  error: number
}

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: "auto", style: "narrow" })
const shortDateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })

function formatRelativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return relativeFormat.format(-mins, "minute")
  const hours = Math.floor(mins / 60)
  if (hours < 24) return relativeFormat.format(-hours, "hour")
  const days = Math.floor(hours / 24)
  if (days < 7) return relativeFormat.format(-days, "day")
  return shortDateFormat.format(new Date(dateStr))
}

function dailyCounts(screenings: Screening[], days: number) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  const counts = Array.from({ length: days }, () => 0)
  for (const s of screenings) {
    const d = new Date(s.created_at)
    d.setHours(0, 0, 0, 0)
    const idx = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
    if (idx >= 0 && idx < days) counts[idx] += 1
  }
  return counts
}

function Sparkline({ counts }: { counts: number[] }) {
  const width = 560
  const height = 64
  const max = Math.max(...counts, 1)
  const stepX = counts.length > 1 ? width / (counts.length - 1) : width
  const points = counts.map((c, i) => ({
    x: i * stepX,
    y: 6 + (1 - c / max) * (height - 12),
  }))

  let line = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    line += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  const area = `${line} L ${width},${height} L 0,${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-16 w-full text-aura-brand"
      role="img"
      aria-label={`Screening activity over the last 14 days`}
    >
      <defs>
        <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#activity-fill)" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r={3} fill="currentColor" />
    </svg>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [screenings] = useState<Screening[]>(MOCK_SCREENINGS as unknown as Screening[])
  const lastUpdated = new Date()

  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false)

  const handleRefresh = () => {
    toast.success("Demo mode — the data shown is static")
  }

  const stats: Stats = useMemo(() => {
    return {
      total: screenings.length,
      tb_positive: screenings.filter(s => s.tb_result === "TB").length,
      tb_negative: screenings.filter(s => s.tb_result === "Non-TB").length,
      healthy: screenings.filter(s => s.respiratory_result === "Healthy").length,
      pneumonia: screenings.filter(s => s.respiratory_result === "Pneumonia").length,
      copd: screenings.filter(s => s.respiratory_result === "COPD").length,
      pendingReview: screenings.filter(s => s.status === "pending_review").length,
      error: screenings.filter(s => s.status === "error").length,
    }
  }, [screenings])

  const activity = useMemo(() => dailyCounts(screenings, 14), [screenings])
  const activityTotal = useMemo(() => activity.reduce((a, b) => a + b, 0), [activity])

  // Work that is waiting on the clinician: pending review or errored runs.
  const attentionList = useMemo(
    () => screenings.filter(s => s.status === "pending_review" || s.status === "error"),
    [screenings],
  )

  const recentScreenings = screenings.slice(0, 6)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = user?.full_name?.trim() ? user.full_name.split(" ")[0] : "Clinician"
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(lastUpdated)
  const timeLabel = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(lastUpdated)
  const roleLabel = (user?.role || "").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())

  const renderStatusBadge = (status: string, reviewedBy: string | null) => {
    if (status === "pending_review") return <Badge variant="warning">Pending Review</Badge>
    if (reviewedBy) return <Badge variant="success">Reviewed</Badge>
    return <Badge variant="secondary">{status}</Badge>
  }

  const cards = [
    {
      title: ["Total", "Screenings"],
      value: stats.total,
      icon: FileText,
      tone: "neutral" as const,
    },
    {
      title: ["TB", "Positive"],
      value: stats.tb_positive,
      icon: AlertTriangle,
      tone: "tb-alert" as const,
    },
    {
      title: ["COPD", "Positive"],
      value: stats.copd,
      icon: Stethoscope,
      tone: "alert" as const,
    },
    {
      title: ["Pneumonia", "Positive"],
      value: stats.pneumonia,
      icon: XCircle,
      tone: "alert" as const,
    },
    {
      title: ["Healthy"],
      value: stats.healthy,
      icon: CheckCircle,
      tone: "healthy" as const,
    },
  ]

  const staggerProps = reduceMotion
    ? {}
    : { variants: staggerContainer, initial: "hidden" as const, animate: "visible" as const }
  const itemProps = reduceMotion
    ? {}
    : { variants: staggerItem, whileHover: cardHover.whileHover, whileTap: cardHover.whileTap }

  return (
    <div className="min-h-screen bg-aura-surface">
      <div className="w-full px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-aura-line bg-white px-3 py-1 text-xs font-medium text-aura-muted">
                {todayLabel}
              </span>
              <span className="rounded-full bg-aura-brand-soft px-3 py-1 text-xs font-semibold text-aura-forest">
                {roleLabel || "Clinician"}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-aura-ink">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-base text-aura-muted">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Respiratory care overview · Updated {timeLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => navigate("/dashboard/screening")}
              className="h-10 gap-2 rounded-lg bg-primary font-semibold text-white shadow-aura-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>New Screening</span>
            </Button>
            <Button
              onClick={() => setNewPatientModalOpen(true)}
              className="h-10 gap-2 rounded-lg border border-aura-border bg-white font-semibold text-aura-ink transition-colors hover:bg-aura-surface-alt"
            >
              <Users className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
            <Button
              onClick={handleRefresh}
              size="icon"
              className="h-10 w-10 rounded-lg border border-aura-border bg-white transition-colors hover:bg-aura-surface-alt"
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <RefreshCw className="h-4 w-4 text-aura-forest" />
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <motion.div {...staggerProps} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.title.join("-")} {...itemProps}>
                  <Card className={cn(
                    "h-full min-h-[124px] rounded-2xl border border-transparent border-l-[3px] shadow-aura-sm",
                    card.tone === "neutral" && "border-l-aura-forest bg-white",
                    card.tone === "tb-alert" && "border-l-aura-coral bg-aura-coral-soft",
                    card.tone === "alert" && "border-l-aura-warning-strong bg-aura-warning-soft",
                    card.tone === "healthy" && "border-l-aura-mint bg-aura-mint-soft"
                  )}>
                    <CardContent className="flex h-full flex-col justify-between p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-mono text-[10px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-aura-muted">
                          {card.title.map((line) => <span key={line} className="block">{line}</span>)}
                        </p>
                        <span className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          card.tone === "neutral" && "bg-aura-sage text-aura-forest",
                          card.tone === "tb-alert" && "bg-white/80 text-aura-coral",
                          card.tone === "alert" && "bg-white/80 text-aura-warning-strong",
                          card.tone === "healthy" && "bg-white/80 text-aura-mint"
                        )}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <p className={cn(
                        "font-display text-4xl font-semibold leading-none tabular-nums",
                        card.tone === "neutral" && "text-aura-ink",
                        card.tone === "tb-alert" && "text-aura-coral",
                        card.tone === "alert" && "text-aura-warning-strong",
                        card.tone === "healthy" && "text-aura-mint"
                      )}>
                        {card.value}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <motion.div {...staggerProps} className="mt-6">
          <motion.div {...{ variants: staggerItem }}>
            <Card className="rounded-2xl border border-aura-line bg-white shadow-aura-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-8">
                <div className="shrink-0">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-aura-muted">
                    Screenings · Last 14 Days
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold leading-none tabular-nums text-aura-ink">
                    {activityTotal}
                    <span className="ml-2 align-middle text-sm font-medium text-aura-muted">this period</span>
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <Sparkline counts={activity} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <motion.div {...staggerProps}>
            <motion.div {...{ variants: staggerItem }}>
              <Card className="rounded-2xl border border-aura-line bg-white shadow-aura-sm">
                <CardHeader className="border-b border-aura-line px-6 py-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <CardTitle className="text-lg text-aura-ink">Recent Screenings</CardTitle>
                      <p className="mt-1 text-sm text-aura-muted">Latest respiratory assessments from your clinic</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/dashboard/screenings")}
                      className="gap-1 text-aura-forest hover:text-aura-ink"
                    >
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentScreenings.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No screenings yet"
                      hint="Screenings you create will appear here."
                      action={
                        <Button size="sm" onClick={() => navigate("/dashboard/screening")} className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Start Your First Screening
                        </Button>
                      }
                    />
                  ) : (
                    <div className="divide-y divide-aura-line">
                      {recentScreenings.map((screening) => (
                        <Link
                          key={screening.id}
                          to={`/dashboard/screenings/${screening.id}`}
                          className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aura-brand hover:bg-aura-surface-alt active:bg-aura-bg-alt"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-aura-mint-soft font-semibold text-aura-forest">
                            {screening.patient_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-aura-ink">{screening.patient_name}</p>
                            <p className="mt-1 truncate text-xs text-aura-muted">
                              {formatRelativeTime(screening.created_at)} · {shortDateFormat.format(new Date(screening.created_at))} · {screening.clinician_name || "—"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                              {getResultBadge(screening.tb_result, screening.respiratory_result)}
                              {renderStatusBadge(screening.status, screening.reviewed_by_name)}
                            </div>
                          </div>

                          <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            {getResultBadge(screening.tb_result, screening.respiratory_result)}
                            {renderStatusBadge(screening.status, screening.reviewed_by_name)}
                          </div>

                          <ChevronRight className="h-5 w-5 shrink-0 text-aura-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-aura-ink" />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div {...staggerProps} className="flex flex-col">
            <motion.div {...{ variants: staggerItem }} className="flex flex-col">
              <Card className="rounded-2xl border border-aura-line bg-white shadow-aura-sm">
                <CardHeader className="border-b border-aura-line px-6 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base text-aura-ink">
                      <AlertTriangle className="h-5 w-5 text-aura-warning" aria-hidden="true" />
                      Needs Attention
                    </CardTitle>
                    {attentionList.length > 0 && (
                      <span className="rounded-full bg-aura-warning-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-aura-warning-strong">
                        {attentionList.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-aura-muted">Cases waiting for review</p>
                </CardHeader>
                <CardContent className="p-0">
                  {attentionList.length > 0 ? (
                    <div className="relative">
                      <div className="h-[390px] divide-y divide-aura-line overflow-y-auto overscroll-contain pb-12 scrollbar-thin">
                        {attentionList.map((screening) => (
                          <Link
                            key={screening.id}
                            to={`/dashboard/screenings/${screening.id}`}
                            className="block w-full px-6 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aura-brand hover:bg-aura-surface-alt active:bg-aura-bg-alt"
                          >
                            <p className="truncate font-semibold text-aura-ink">{screening.patient_name}</p>
                            <div className="mt-2">
                              <Badge variant={screening.status === "error" ? "destructive" : "warning"}>
                                {screening.status === "error" ? "Error" : "Pending Review"}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aura-mint-soft">
                        <CheckCircle className="h-6 w-6 text-aura-mint" />
                      </div>
                      <p className="text-sm font-medium text-aura-ink">Everything Is Up To Date</p>
                      <p className="text-xs text-aura-muted">All screenings have been reviewed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <NewPatientModal
        open={newPatientModalOpen}
        onOpenChange={setNewPatientModalOpen}
        onPatientCreated={() => setNewPatientModalOpen(false)}
      />
    </div>
  )
}
