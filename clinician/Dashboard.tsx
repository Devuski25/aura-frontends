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
      tone: "alert",
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
      {/* Header section with greeting and timestamp */}
      <div className="border-b border-slate-200 bg-white py-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2">
            <p className="text-sm font-medium text-slate-500">{todayLabel}</p>
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">{greeting}, {firstName}</h1>
              <p className="mt-2 text-base text-slate-600">{roleLabel || "Clinician"} · Respiratory care overview</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Last updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl py-6">
        {/* Key metrics grid - organized in a compact, scannable layout */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold text-[#132420]">Key metrics</h2>
            <p className="mt-1 text-sm text-[#5c6b63]">Overview of screening activity and results</p>
          </div>
          
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible" 
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.title.join("-")} variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
                  <Card className={cn(
                    "h-full min-h-[126px] overflow-hidden rounded-[14px] border-y border-r border-[#e4e1d6] border-l-[3px] shadow-none transition-transform",
                    card.tone === "neutral" && "border-l-[#264238] bg-white",
                    card.tone === "alert" && "border-l-[#b8442f] border-y-transparent border-r-transparent bg-[#f6e4de]",
                    card.tone === "healthy" && "border-l-[#4c8b6e] border-y-transparent border-r-transparent bg-[#e6f0e9]"
                  )}>
                    <CardContent className="flex h-full flex-col justify-between p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn(
                          "font-mono text-[10px] font-medium uppercase leading-[1.4] tracking-[0.08em]",
                          card.tone === "neutral" && "text-[#5c6b63]",
                          card.tone === "alert" && "text-[#8c3623]",
                          card.tone === "healthy" && "text-[#356248]"
                        )}>
                          {card.title.map((line) => <span key={line} className="block">{line}</span>)}
                        </p>
                        <span className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          card.tone === "neutral" && "bg-[#efeee7] text-[#264238]",
                          card.tone === "alert" && "bg-[#efc9bb] text-[#b8442f]",
                          card.tone === "healthy" && "bg-[#c9e3d5] text-[#4c8b6e]"
                        )}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className={cn(
                          "font-display text-4xl font-semibold leading-none",
                          card.tone === "neutral" && "text-[#132420]",
                          card.tone === "alert" && "text-[#7a2e1f]",
                          card.tone === "healthy" && "text-[#2e5a41]"
                        )}>{card.value}</p>
                        <span className={cn(
                          "flex h-4 items-end gap-[2px] opacity-60",
                          card.tone === "neutral" && "text-[#5c6b63]",
                          card.tone === "alert" && "text-[#b8442f]",
                          card.tone === "healthy" && "text-[#4c8b6e]"
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
                    <div className="py-12 text-center">
                      <p className="text-sm text-slate-500">No screenings yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {recentScreenings.map((screening) => (
                        <button
                          key={screening.id}
                          onClick={() => navigate(`/dashboard/screenings/${screening.id}`)}
                          className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                        >
                          {/* Patient initials avatar */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 font-semibold text-slate-700">
                            {screening.patient_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>
                          
                          {/* Patient info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{screening.patient_name}</p>
                            <p className="mt-1 text-xs text-slate-600">
                              {new Date(screening.created_at).toLocaleDateString()} · {screening.clinician_name || "—"}
                            </p>
                          </div>

                          {/* Results and status badges */}
                          <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            {getResultBadge(screening.tb_result, screening.respiratory_result)}
                            {renderStatusBadge(screening.status, screening.reviewed_by_name)}
                          </div>

                          {/* Chevron arrow */}
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" />
                        </button>
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
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Needs Attention
                </CardTitle>
                <p className="mt-1 text-xs text-slate-600">Cases waiting for review</p>
              </CardHeader>
              <CardContent className="p-0">
                {attentionList.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {attentionList.slice(0, 4).map((screening) => (
                      <button
                        key={screening.id}
                        onClick={() => navigate(`/dashboard/screenings/${screening.id}`)}
                        className="w-full px-6 py-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                      >
                        <p className="font-semibold text-slate-900 truncate">{screening.patient_name}</p>
                        <div className="mt-2">
                          <Badge variant={screening.status === "error" ? "destructive" : "warning"}>
                            {screening.status === "error" ? "Error" : "Pending Review"}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">Everything is up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Action dock - positioned at bottom with physical button styling */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-300 bg-white px-6 py-4 shadow-lg sm:py-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Primary action: Start new screening */}
            <Button
              onClick={() => navigate("/dashboard/screening")}
              className="flex-1 h-12 gap-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>New Screening</span>
            </Button>

            {/* Secondary action: Add patient */}
            <Button
              onClick={() => setNewPatientModalOpen(true)}
              className="flex-1 h-12 gap-2 rounded-lg border border-slate-300 bg-slate-50 font-semibold text-slate-900 hover:bg-slate-100 active:bg-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <Users className="h-5 w-5" />
              <span>Add Patient</span>
            </Button>

            {/* Utility action: Refresh */}
            <Button
              onClick={handleRefresh}
              size="icon"
              className="h-12 w-12 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 shadow-sm hover:shadow-md transition-all"
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
            >
              <RefreshCw className="h-5 w-5 text-slate-700" />
            </Button>
          </div>
        </div>
      </div>

      {/* This padding ensures content doesn't hide behind the fixed action dock */}
      <div className="h-24" />

      {/* Patient modal for adding new patients */}
      <NewPatientModal
        open={newPatientModalOpen}
        onOpenChange={setNewPatientModalOpen}
        onPatientCreated={() => setNewPatientModalOpen(false)}
      />
    </div>
  )
}
