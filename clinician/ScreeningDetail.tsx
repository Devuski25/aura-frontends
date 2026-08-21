"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  AlertCircle,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOCK_SCREENINGS } from "@/mocks/data"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface ScreeningDetail {
  id: string
  patient_id: string
  clinic_id: string
  clinician_id: string
  audio_file_path: string | null
  audio_duration_sec: number | null
  tb_result: string
  tb_confidence: number | null
  tb_probabilities: Record<string, number> | null
  respiratory_result: string | null
  respiratory_confidence: number | null
  respiratory_probabilities: Record<string, number> | null
  cascade_path: string
  model_version: string
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
  patient_name: string
  patient_dob: string
  age_bracket: string
  patient_gender: string
  clinic_name: string
  clinician_name: string
  reviewed_by_name: string | null
}

/* ---------- Theme colors ---------- */
const MINT = "#1E9E73"
const CORAL = "#E2543A"

/* ---------- Field label ---------- */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-aura-muted">{children}</div>
  )
}

/* ---------- Confidence ring ---------- */
function ConfidenceRing({ value, flagged }: { value: number; flagged: boolean }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  // Convert fraction (0-1) to percentage (0-100) before computing the ring
  const pct = Math.min(Math.max(value * 100, 0), 100)
  const offset = circumference - (pct / 100) * circumference
  const color = flagged ? CORAL : MINT
  return (
    <div className="relative h-[132px] w-[132px]">
      <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
        <circle cx="66" cy="66" r={radius} stroke="#EAF1EC" strokeWidth="12" fill="none" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("font-display text-[26px] font-bold leading-none", flagged ? "text-aura-coral" : "text-aura-mint")}>
          {pct.toFixed(0)}%
        </div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-aura-muted">Confidence</div>
      </div>
    </div>
  )
}

/* ---------- Status pill ---------- */
function TierStatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold",
        ok ? "bg-aura-mint-soft text-[#0E7A55]" : "bg-aura-coral-soft text-[#C4351F]"
      )}
    >
      {ok ? <Check className="h-3 w-3" strokeWidth={2.2} /> : <AlertTriangle className="h-3 w-3" strokeWidth={2.2} />}
      {label}
    </div>
  )
}

/* ---------- Cascade stepper ---------- */
function CascadeStepper({ path }: { path: string }) {
  const steps = path
    .split("→")
    .map(s => s.trim())
    .filter(Boolean)
  const labels: Record<string, string> = {
    "Tier 1": "TIER 1 · TB GATEKEEPER",
    "Tier 2": "TIER 2 · RESPIRATORY CLASSIFIER",
  }
  return (
    <div className="mt-1.5 flex flex-wrap items-center">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div className="relative mx-1 h-px w-[34px] bg-[repeating-linear-gradient(90deg,#E1E7E2_0_5px,transparent_5px_9px)]">
              <span className="absolute -right-px -top-[3px] border-l-[5px] border-t-[3.5px] border-b-[3.5px] border-l-aura-line border-t-transparent border-b-transparent" />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full bg-aura-mint-soft px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wide text-aura-forest">
            {labels[step] ?? step.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Probability bar ---------- */
function ProbabilityBar({ label, prob, color }: { label: string; prob: number; color: string }) {
  const pct = Math.min(Math.max(prob * 100, 0), 100)
  const gradient =
    color === CORAL ? "linear-gradient(90deg,#F0725C,#E2543A)" : "linear-gradient(90deg,#4CC490,#1E9E73)"
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-aura-ink">
          <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
          {label}
        </div>
        <div className="font-mono text-[13px] font-semibold text-aura-ink">{pct.toFixed(1)}%</div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-aura-sage">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: gradient }} />
      </div>
    </div>
  )
}

/* ---------- Waveform (screening details) ---------- */
function Waveform() {
  const bars = [4, 9, 14, 6, 16, 10, 5, 12, 8, 15, 6, 11]
  return (
    <div className="flex h-4 items-end gap-[2px] opacity-50">
      {bars.map((h, i) => (
        <span key={i} className="w-[2px] rounded-[1px] bg-aura-forest-light" style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}

/* ---------- Info card ---------- */
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-aura-line/60 bg-aura-sage/40 py-5 px-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-aura-muted">
        {title}
      </h2>
      {children}
    </div>
  )
}

/* ---------- Result banner ---------- */
function ResultBanner({ screening }: { screening: ScreeningDetail }) {
  const tbPositive = screening.tb_result === "TB"
  const respPositive = screening.respiratory_result === "Pneumonia"
  const label = tbPositive ? "ACTIVE TB SUSPECTED" : respPositive ? "PNEUMONIA SUSPECTED" : "NO ACUTE RESPIRATORY PATHOLOGY"
  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-4 rounded-2xl border p-5 shadow-sm",
        tbPositive
          ? "border-aura-coral bg-aura-coral-soft"
          : respPositive
          ? "border-aura-warning/40 bg-aura-warning-soft"
          : "border-aura-mint/60 bg-aura-mint-soft"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          tbPositive ? "bg-aura-coral-soft" : respPositive ? "bg-aura-warning-soft" : "bg-aura-mint-soft"
        )}
      >
        {tbPositive ? (
          <AlertTriangle className="h-6 w-6 text-aura-coral" />
        ) : (
          <CheckCircle className={cn("h-6 w-6", respPositive ? "text-aura-warning" : "text-aura-mint")} />
        )}
      </div>
      <div>
        <p
          className={cn(
            "font-display text-xl font-bold leading-tight tracking-wide",
            tbPositive ? "text-aura-coral" : respPositive ? "text-aura-warning" : "text-aura-forest"
          )}
        >
          {label}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-aura-muted">
          {tbPositive
            ? "Flagged · refer for confirmatory testing immediately"
            : respPositive
            ? "Flagged · urgent clinical review indicated"
            : "No urgent pathology detected · routine follow-up"}
        </p>
      </div>
    </div>
  )
}

/* ---------- Loading skeleton ---------- */
function ScreeningSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-aura-sage" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-[14px] bg-aura-sage" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-[14px] bg-aura-sage" />
    </div>
  )
}

/* ---------- Error state ---------- */
function ScreeningError() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-aura-coral/30 bg-aura-coral-soft px-6 py-14 text-center">
      <AlertTriangle className="h-8 w-8 text-aura-coral" />
      <div>
        <h3 className="font-display text-lg font-semibold text-aura-ink">Unable to load screening result</h3>
        <p className="mt-1 text-sm text-aura-muted">
          The screening data could not be loaded. Check your connection and try again.
        </p>
      </div>
    </div>
  )
}

/* ---------- Tier result card ---------- */
function TierCard({
  eyebrow,
  name,
  flagged,
  statusLabel,
  confidence,
  modelVersion,
  decisions,
  children,
}: {
  eyebrow: string
  name: string
  flagged: boolean
  statusLabel: string
  confidence: number | null
  modelVersion: string | null
  decisions?: { label: string; value: string }[]
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border border-aura-line bg-white",
        flagged ? "border-l-4 border-l-aura-coral" : "border-l-4 border-l-aura-mint"
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-aura-line px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-aura-muted">{eyebrow}</div>
            <div className="font-display text-[17px] font-semibold text-aura-ink">{name}</div>
          </div>
        </div>
        <TierStatusPill ok={!flagged} label={statusLabel} />
      </div>
      <div className="grid gap-8 px-6 py-6 sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-start gap-4">
          <ConfidenceRing value={confidence ?? 0} flagged={flagged} />
          {modelVersion && (
            <div>
              <FieldLabel>Model Version</FieldLabel>
              <div className="font-mono text-[12.5px] font-medium text-aura-ink">{modelVersion}</div>
            </div>
          )}
          {decisions?.map((d, i) => (
            <div key={i}>
              <FieldLabel>{d.label}</FieldLabel>
              <div className="text-[13px] font-medium text-aura-ink">{d.value}</div>
            </div>
          ))}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

/* ---------- Probability color helper ---------- */
function tierColor(tier: "tb" | "resp", cls: string): string {
  if (tier === "tb") return cls === "TB" ? CORAL : MINT
  return cls === "Healthy" ? MINT : CORAL
}

export function ScreeningDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [screening, setScreening] = useState<ScreeningDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Simulate async fetch so the skeleton/error states are exercisable.
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = MOCK_SCREENINGS.find(s => s.id === id) as unknown as ScreeningDetail | null
      if (found) {
        setScreening(found)
        setError(false)
      } else {
        setError(true)
      }
      setLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [id])

  const downloadPDF = async () => {
    toast.info("Demo mode - PDF export is disabled")
  }

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const reviewSubmitting = false

  const handleReview = async () => {
    if (!screening) return
    toast.success("Demo mode - review would be submitted")
    setReviewDialogOpen(false)
    setReviewNotes("")
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[980px] pb-10">
        <ScreeningSkeleton />
      </div>
    )
  }

  if (!screening || error) {
    return (
      <div className="mx-auto max-w-[980px] pb-10">
        <ScreeningError />
      </div>
    )
  }

  const patientAge = (() => {
    const today = new Date()
    const birthDate = new Date(screening.patient_dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  })()

  /* Tier flagging */
  const tbFlagged = screening.tb_result === "TB"
  const respFlagged = screening.respiratory_result !== null && screening.respiratory_result !== "Healthy"

  return (
    <div className="mx-auto max-w-[980px] pb-10">
      {/* Prompt status banner above the title */}
      <ResultBanner screening={screening} />

      {/* Header / topbar */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-aura-ink">Screening Result</h1>
            <div className="mt-1 flex items-center gap-2 text-[13.5px] text-aura-muted">
              <strong className="font-semibold text-aura-ink">{screening.patient_name}</strong>
              <span className="h-[3px] w-[3px] rounded-full bg-aura-muted" />
              {screening.clinic_name}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {screening.status === "pending_review" && (
              <Button onClick={() => setReviewDialogOpen(true)} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Review Screening
              </Button>
            )}
            <Button variant="outline" onClick={downloadPDF} disabled={!screening}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <InfoCard title="Patient Information">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FieldLabel>Name</FieldLabel>
            <div className="text-[13.5px] font-medium text-aura-ink">{screening.patient_name}</div>
          </div>
          <div>
            <FieldLabel>Age / Gender</FieldLabel>
            <div className="text-[13.5px] font-medium text-aura-ink">{patientAge} years · {screening.patient_gender}</div>
          </div>
          <div>
            <FieldLabel>Age Bracket</FieldLabel>
            <div className="text-[13.5px] font-medium text-aura-ink">{screening.age_bracket}</div>
          </div>
          <div>
            <FieldLabel>Clinic / Clinician</FieldLabel>
            <div className="text-[13.5px] font-medium leading-snug text-aura-ink">
              {screening.clinic_name}
              <br />
              {screening.clinician_name}
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Screening Details */}
      <InfoCard title="Screening Details">
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FieldLabel>Screening Date</FieldLabel>
            <div className="text-[13.5px] font-medium text-aura-ink">{new Date(screening.created_at).toLocaleString()}</div>
          </div>
          <div>
            <FieldLabel>Model Version</FieldLabel>
            <div className="font-mono text-[12px] font-medium text-aura-ink">{screening.model_version}</div>
          </div>
          <div>
            <FieldLabel>Audio Duration</FieldLabel>
            <div className="text-[13.5px] font-medium text-aura-ink">
              {screening.audio_duration_sec ? `${screening.audio_duration_sec}s` : "N/A"}
            </div>
          </div>
          <div className="flex items-end">
            <Waveform />
          </div>
        </div>
        <FieldLabel>Cascade Path</FieldLabel>
        <CascadeStepper path={screening.cascade_path} />
      </InfoCard>

      {/* Tier 1: TB Gatekeeper */}
      <TierCard
        eyebrow="Tier 1"
        name="TB Gatekeeper"
        flagged={tbFlagged}
        statusLabel={tbFlagged ? "TB Detected" : "Non-TB"}
        confidence={screening.tb_confidence ?? 0}
        modelVersion={screening.model_version}
        decisions={[
          { label: "Cascade Decision", value: screening.cascade_path.includes("Tier 2") ? "Continued to Tier 2" : "Stopped at Tier 1" },
        ]}
      >
        {screening.tb_probabilities && (
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.08em] text-aura-muted">
              Probability Distribution
            </div>
            {Object.entries(screening.tb_probabilities).map(([cls, prob]) => (
              <ProbabilityBar key={cls} label={cls} prob={prob} color={tierColor("tb", cls)} />
            ))}
          </div>
        )}
        {tbFlagged && (
          <div className="mt-5 rounded-lg border border-aura-coral/20 bg-aura-coral-soft p-4">
            <h4 className="flex items-center gap-2 font-semibold text-aura-coral">
              <AlertTriangle className="h-5 w-5" />
              High Priority: TB Detected
            </h4>
            <p className="mt-2 text-sm text-aura-ink">Immediate referral for confirmatory TB testing recommended. Follow local TB protocols.</p>
          </div>
        )}
      </TierCard>

      {/* Tier 2: Respiratory Classifier */}
      {screening.respiratory_result && (
        <TierCard
          eyebrow="Tier 2"
          name="Respiratory Classifier"
          flagged={respFlagged}
          statusLabel={screening.respiratory_result || "Healthy"}
          confidence={screening.respiratory_confidence ?? 0}
          modelVersion={screening.model_version}
          decisions={[
            { label: "Cascade Decision", value: "Final Classification" },
          ]}
        >
          {screening.respiratory_probabilities && (
            <div>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.08em] text-aura-muted">
                Probability Distribution
              </div>
              {Object.entries(screening.respiratory_probabilities).map(([cls, prob]) => (
                <ProbabilityBar key={cls} label={cls} prob={prob} color={tierColor("resp", cls)} />
              ))}
            </div>
          )}

          {screening.respiratory_result === "Pneumonia" && (
            <div className="mt-5 rounded-lg border border-aura-coral/20 bg-aura-coral-soft p-4">
              <h4 className="flex items-center gap-2 font-semibold text-aura-coral">
                <AlertCircle className="h-5 w-5" />
                High Priority: Pneumonia Suspected
              </h4>
              <p className="mt-2 text-sm text-aura-ink">Urgent clinical evaluation recommended. Consider chest imaging and antibiotics per guidelines.</p>
            </div>
          )}

          {screening.respiratory_result === "COPD" && (
            <div className="mt-5 rounded-lg bg-aura-sage p-4">
              <h4 className="flex items-center gap-2 font-semibold text-aura-forest">
                <AlertCircle className="h-5 w-5" />
                Moderate Priority: COPD Suspected
              </h4>
              <p className="mt-2 text-sm text-aura-ink">Clinical evaluation recommended. Consider spirometry and pulmonology referral.</p>
            </div>
          )}

          {screening.respiratory_result === "Healthy" && (
            <div className="mt-5 rounded-lg bg-aura-sage p-4">
              <h4 className="flex items-center gap-2 font-semibold text-aura-mint">
                <CheckCircle className="h-5 w-5" />
                Low Priority: No Acute Findings
              </h4>
              <p className="mt-2 text-sm text-aura-ink">No urgent action required. Routine follow-up as clinically indicated.</p>
            </div>
          )}
        </TierCard>
      )}

      {/* Review Status */}
      <div className="rounded-[14px] border border-aura-line bg-white py-[22px] px-[24px]">
        <h2 className="mb-[18px] flex items-center gap-2 font-display text-[15px] font-semibold text-aura-ink">
          Review Status
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <FieldLabel>Status</FieldLabel>
            <div
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-semibold",
                screening.status === "pending_review"
                  ? "bg-aura-coral-soft text-[#C4351F]"
                  : screening.reviewed_by
                  ? "bg-aura-mint-soft text-[#0E7A55]"
                  : "bg-aura-sage text-aura-forest"
              )}
            >
              {screening.status === "pending_review" ? "Pending Review" : screening.reviewed_by ? "Reviewed" : screening.status}
            </div>
          </div>
          <div>
            <FieldLabel>Reviewed By</FieldLabel>
            <div className="text-[14.5px] font-semibold text-aura-ink">{screening.reviewed_by_name || "Not yet reviewed"}</div>
          </div>
          <div>
            <FieldLabel>Review Date</FieldLabel>
            <div className="text-[14.5px] font-semibold text-aura-ink">
              {screening.reviewed_at ? new Date(screening.reviewed_at).toLocaleString() : "—"}
            </div>
          </div>
          {screening.review_notes && (
            <div className="sm:col-span-3">
              <FieldLabel>Review Notes</FieldLabel>
              <div className="text-[14.5px] font-semibold text-aura-ink">{screening.review_notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex flex-wrap gap-2">
          {screening.status === "pending_review" && (
            <Button onClick={() => setReviewDialogOpen(true)} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Review Screening
            </Button>
          )}
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Screening</DialogTitle>
            <DialogDescription>
              Add clinical notes for this screening. Submitting marks it as reviewed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reviewNotes}
            onChange={e => setReviewNotes(e.target.value)}
            placeholder="Review notes (optional)"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting…" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}