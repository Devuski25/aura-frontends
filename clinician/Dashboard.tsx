"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getResultBadge } from "@clinician/lib/badge-helpers"
import { MOCK_SCREENINGS } from "@/mocks/data"
import { toast } from "sonner"
import { NewPatientModal } from "@clinician/components/NewPatientModal"

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
  today: number
  week: number
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [screenings] = useState<Screening[]>(MOCK_SCREENINGS as unknown as Screening[])
  const lastUpdated = new Date()

  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false)

  const handleRefresh = () => {
    toast.success("Demo mode — the data shown is static")
  }

  const stats: Stats = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    return {
      total: screenings.length,
      tb_positive: screenings.filter(s => s.tb_result === "TB").length,
      tb_negative: screenings.filter(s => s.tb_result === "Non-TB").length,
      healthy: screenings.filter(s => s.respiratory_result === "Healthy").length,
      pneumonia: screenings.filter(s => s.respiratory_result === "Pneumonia").length,
      copd: screenings.filter(s => s.respiratory_result === "COPD").length,
      pendingReview: screenings.filter(s => s.status === "pending_review").length,
      error: screenings.filter(s => s.status === "error").length,
      today: screenings.filter(s => new Date(s.created_at) >= startOfToday).length,
      week: screenings.filter(s => new Date(s.created_at) >= startOfWeek).length,
    }
  }, [screenings])

  // Work that is waiting on the clinician: pending review or errored runs.
  const attentionList = useMemo(
    () => screenings.filter(s => s.status === "pending_review" || s.status === "error"),
    [screenings],
  )

  const recentScreenings = screenings.slice(0, 6)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = user?.full_name?.trim() ? user.full_name.split(" ")[0] : "Clinician"
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const roleLabel = (user?.role || "").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())

  const renderStatusBadge = (status: string, reviewedBy: string | null) => {
    if (status === "pending_review") return <Badge variant="warning">Pending Review</Badge>
    if (reviewedBy) return <Badge variant="success">Reviewed</Badge>
    return <Badge variant="secondary">{status}</Badge>
  }

  const cards = [
    {
      title: "Total Screenings",
      value: stats.total,
      icon: FileText,
      accentBorder: "border-l-aura-accent",
      accentText: "text-aura-accent",
    },
    {
      title: "TB Positive",
      value: stats.tb_positive,
      icon: AlertTriangle,
      accentBorder: "border-l-destructive",
      accentText: "text-destructive",
    },
    {
      title: "COPD Positive",
      value: stats.copd,
      icon: Stethoscope,
      accentBorder: "border-l-aura-warning",
      accentText: "text-aura-warning",
    },
    {
      title: "Pneumonia Positive",
      value: stats.pneumonia,
      icon: XCircle,
      accentBorder: "border-l-aura-accent-dark",
      accentText: "text-aura-accent-dark",
    },
    {
      title: "Healthy",
      value: stats.healthy,
      icon: CheckCircle,
      accentBorder: "border-l-aura-accent",
      accentText: "text-aura-accent-dark",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting + quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-aura-muted">{todayLabel}</p>
          <h1 className="text-2xl font-bold text-aura-text">
            {greeting}, {firstName}
          </h1>
          <p className="text-aura-muted">
            {roleLabel} · {stats.total} total screenings
            {lastUpdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-aura-muted/80">
                <Clock className="h-3 w-3" />
                updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setNewPatientModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
          <Button onClick={() => navigate("/dashboard/screening")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Screening
          </Button>
        </div>
      </div>

      {/* Needs attention — pending review / errored runs */}
      {attentionList.length > 0 && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={staggerItem}>
            <Card className="border border-aura-border-soft bg-aura-bg-card shadow-aura-sm border-l-4 border-l-aura-warning">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-aura-warning-strong">
                  <AlertTriangle className="h-4 w-4" />
                  Needs attention ({attentionList.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {attentionList.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/dashboard/screenings/${s.id}`)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg bg-aura-surface-alt px-3 py-2 text-left transition-colors hover:bg-aura-border-soft"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">{s.patient_name}</span>
                      {getResultBadge(s.tb_result, s.respiratory_result)}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={s.status === "error" ? "destructive" : "warning"}>
                        {s.status === "error" ? "Error" : "Pending Review"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-aura-muted" />
                    </div>
                  </button>
                ))}
                {attentionList.length > 5 && (
                  <p className="px-1 pt-1 text-xs text-aura-muted">
                    +{attentionList.length - 5} more — see all in Screening Records
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Total + outcome stat cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4">
        <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
          <Card className="border border-aura-border-soft bg-aura-bg-card shadow-aura-sm border-l-4 border-l-aura-accent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-aura-text">{cards[0].title}</CardTitle>
                <FileText className="h-8 w-8 text-aura-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-aura-text">{cards[0].value}</div>
              <div className="mt-1 text-sm text-aura-muted">
                {stats.today} today · {stats.week} this week
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.slice(1).map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.title} variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
              <Card className={cn("border border-aura-border-soft bg-aura-bg-card shadow-aura-sm border-l-4", card.accentBorder)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-sm font-medium", card.accentText)}>{card.title}</CardTitle>
                    <Icon className={cn("h-5 w-5", card.accentText)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-aura-text">{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent screenings */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <Card className="border border-aura-border-soft bg-aura-bg-card shadow-aura-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-aura-text">Recent Screenings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/screenings")} className="gap-1">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentScreenings.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-aura-border-soft p-6 text-center">
                  <p className="text-sm text-aura-muted">No screenings yet.</p>
                  <Button onClick={() => navigate("/dashboard/screening")} className="mt-3" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Start your first screening
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-aura-border-soft">
                  {recentScreenings.map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/dashboard/screenings/${s.id}`)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-aura-surface-alt"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s.patient_name}</div>
                        <div className="text-xs text-aura-muted">
                          {new Date(s.created_at).toLocaleDateString()} · {s.clinician_name || "—"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {getResultBadge(s.tb_result, s.respiratory_result)}
                        {renderStatusBadge(s.status, s.reviewed_by_name)}
                        <ChevronRight className="h-4 w-4 text-aura-muted" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <NewPatientModal
        open={newPatientModalOpen}
        onOpenChange={setNewPatientModalOpen}
        onPatientCreated={() => setNewPatientModalOpen(false)}
      />
    </div>
  )
}
