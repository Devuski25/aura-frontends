"use client"

import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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

function formatRelativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
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
      title: ["Total", "Screenings"],
      value: stats.total,
      icon: FileText,
      tone: "neutral",
    },
    {
      title: ["TB", "Positive"],
      value: stats.tb_positive,
      icon: AlertTriangle,
      tone: "tb-alert",
    },
    {
      title: ["COPD", "Positive"],
      value: stats.copd,
      icon: Stethoscope,
      tone: "alert",
    },
    {
      title: ["Pneumonia", "Positive"],
      value: stats.pneumonia,
      icon: XCircle,
      tone: "alert",
    },
    {
      title: ["Healthy"],
      value: stats.healthy,
      icon: CheckCircle,
      tone: "healthy",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header section with greeting, timestamp, and primary actions */}
      <div className="border-b border-slate-200 bg-white py-6 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2">
            <p className="text-sm font-medium text-slate-500">{todayLabel}</p>
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">{greeting}, {firstName}</h1>
              <p className="mt-2 text-base text-slate-600">{roleLabel || "Clinician"} · Respiratory care overview</p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>Last updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {/* Primary action: Start new screening */}
                <Button
                  onClick={() => navigate("/dashboard/screening")}
                  className="h-10 gap-2 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Screening</span>
                </Button>

                {/* Secondary action: Add patient */}
                <Button
                  onClick={() => setNewPatientModalOpen(true)}
                  className="h-10 gap-2 rounded-lg border border-slate-300 bg-slate-50 font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md active:bg-slate-200"
                >
                  <Users className="h-4 w-4" />
                  <span>Add Patient</span>
                </Button>

                {/* Utility action: Refresh */}
                <Button
                  onClick={handleRefresh}
                  size="icon"
                  className="h-10 w-10 rounded-lg border border-slate-300 bg-white shadow-sm transition-all hover:bg-slate-100 hover:shadow-md active:bg-slate-200"
                  aria-label="Refresh dashboard"
                  title="Refresh dashboard"
                >
                  <RefreshCw className="h-4 w-4 text-slate-700" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        {/* Key metrics grid - organized in a compact, scannable layout */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold text-slate-900">Key metrics</h2>
            <p className="mt-1 text-sm text-slate-500">Overview of screening activity and results</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-5 md:gap-6 sm:grid-cols-3 lg:grid-cols-6"
          >
            {/* Actionable hero metric: the clinician's work queue */}
            <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
              <Card className="h-full min-h-[126px] overflow-hidden rounded-xl border-y border-r border-slate-700 border-l-[3px] border-l-amber-400 bg-slate-900 shadow-none transition-transform">
                <CardContent className="flex h-full flex-col justify-between p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-[10px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-slate-300">
                      Needs review
                    </p>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="font-display text-4xl font-semibold leading-none text-white">{attentionList.length}</p>
                    <span className="flex h-4 items-end gap-[2px] text-amber-300 opacity-80" aria-hidden="true">
                      <span className="h-1 w-[2px] bg-current" />
                      <span className="h-2 w-[2px] bg-current" />
                      <span className="h-3 w-[2px] bg-current" />
                      <span className="h-1.5 w-[2px] bg-current" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.title.join("-")} variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
                  <Card className={cn(
                    "h-full min-h-[126px] overflow-hidden rounded-xl border-y border-r border-slate-200 border-l-[3px] shadow-none transition-transform",
                    card.tone === "neutral" && "border-l-slate-800 bg-white",
                    card.tone === "tb-alert" && "border-l-red-700 border-y-transparent border-r-transparent bg-red-100",
                    card.tone === "alert" && "border-l-orange-400 border-y-transparent border-r-transparent bg-orange-50",
                    card.tone === "healthy" && "border-l-emerald-600 border-y-transparent border-r-transparent bg-emerald-50"
                  )}>
                    <CardContent className="flex h-full flex-col justify-between p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn(
                          "font-mono text-[10px] font-medium uppercase leading-[1.4] tracking-[0.08em]",
                          card.tone === "neutral" && "text-slate-500",
                          card.tone === "tb-alert" && "text-red-900 font-bold",
                          card.tone === "alert" && "text-orange-800",
                          card.tone === "healthy" && "text-emerald-900"
                        )}>
                          {card.title.map((line) => <span key={line} className="block">{line}</span>)}
                        </p>
                        <span className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          card.tone === "neutral" && "bg-slate-100 text-slate-800",
                          card.tone === "tb-alert" && "bg-red-200 text-red-800",
                          card.tone === "alert" && "bg-orange-100 text-orange-600",
                          card.tone === "healthy" && "bg-emerald-100 text-emerald-700"
                        )}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className={cn(
                          "font-display text-4xl font-semibold leading-none",
                          card.tone === "neutral" && "text-slate-900",
                          card.tone === "tb-alert" && "text-red-900",
                          card.tone === "alert" && "text-orange-900",
                          card.tone === "healthy" && "text-emerald-900"
                        )}>{card.value}</p>
                        <span className={cn(
                          "flex h-4 items-end gap-[2px] opacity-60",
                          card.tone === "neutral" && "text-slate-500",
                          card.tone === "tb-alert" && "text-red-700",
                          card.tone === "alert" && "text-orange-600",
                          card.tone === "healthy" && "text-emerald-600"
                        )} aria-hidden="true">
                          <span className="h-1 w-[2px] bg-current" />
                          <span className="h-2 w-[2px] bg-current" />
                          <span className="h-3 w-[2px] bg-current" />
                          <span className="h-1.5 w-[2px] bg-current" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Main content grid: recent screenings and attention items */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Recent screenings section */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={staggerItem}>
              <Card className="border-slate-200 bg-white">
                <CardHeader className="border-b border-slate-200 px-6 py-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <CardTitle className="text-lg text-slate-900">Recent Screenings</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">Latest respiratory assessments from your clinic</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/dashboard/screenings")}
                      className="gap-1 text-slate-700 hover:text-slate-900"
                    >
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentScreenings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <FileText className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No screenings yet</p>
                      <Button size="sm" onClick={() => navigate("/dashboard/screening")} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Start your first screening
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {recentScreenings.map((screening) => (
                        <Link
                          key={screening.id}
                          to={`/dashboard/screenings/${screening.id}`}
                          className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-100 active:bg-slate-200 cursor-pointer"
                        >
                          {/* Patient initials avatar */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 font-semibold text-slate-700">
                            {screening.patient_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>

                          {/* Patient info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{screening.patient_name}</p>
                            <p className="mt-1 text-xs text-slate-600">
                              {formatRelativeTime(screening.created_at)} · {new Date(screening.created_at).toLocaleDateString()} · {screening.clinician_name || "—"}
                            </p>
                            {/* Badges wrap below on small screens so results stay visible */}
                            <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                              {getResultBadge(screening.tb_result, screening.respiratory_result)}
                              {renderStatusBadge(screening.status, screening.reviewed_by_name)}
                            </div>
                          </div>

                          {/* Results and status badges */}
                          <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            {getResultBadge(screening.tb_result, screening.respiratory_result)}
                            {renderStatusBadge(screening.status, screening.reviewed_by_name)}
                          </div>

                          {/* Chevron arrow */}
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Needs attention sidebar - highlights items requiring clinician action */}
          <motion.div variants={staggerItem} initial="hidden" animate="visible" className="flex flex-col">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Needs Attention
                  </CardTitle>
                  {attentionList.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      {attentionList.length}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">Cases waiting for review</p>
              </CardHeader>
              <CardContent className="p-0">
                {attentionList.length > 0 ? (
                  <div className="relative">
                    <div className="h-[390px] overflow-y-auto divide-y divide-slate-200 scrollbar-thin pb-12">
                      {attentionList.map((screening) => (
                        <Link
                          key={screening.id}
                          to={`/dashboard/screenings/${screening.id}`}
                          className="w-full px-6 py-4 text-left transition-colors hover:bg-slate-100 active:bg-slate-200 cursor-pointer block"
                        >
                          <p className="font-semibold text-slate-900 truncate">{screening.patient_name}</p>
                          <div className="mt-2">
                            <Badge variant={screening.status === "error" ? "destructive" : "warning"}>
                              {screening.status === "error" ? "Error" : "Pending Review"}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* Fade-out gradient at the bottom edge */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Everything is up to date</p>
                    <p className="text-xs text-slate-500">All screenings have been reviewed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Patient modal for adding new patients */}
      <NewPatientModal
        open={newPatientModalOpen}
        onOpenChange={setNewPatientModalOpen}
        onPatientCreated={() => setNewPatientModalOpen(false)}
      />
    </div>
  )
}
