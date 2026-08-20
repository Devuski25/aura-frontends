"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertTriangle, CheckCircle, Download, Printer, Stethoscope, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { cardHover } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { MOCK_SCREENINGS } from "@/mocks/data"
import { getTbBadge, getRespBadge, getConfidenceColor } from "@clinician/lib/badge-helpers"
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

export function ScreeningDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const screening = MOCK_SCREENINGS.find(s => s.id === id) as unknown as ScreeningDetail | null

  const downloadPDF = async () => {
    toast.info("Demo mode — PDF export is disabled")
  }

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const reviewSubmitting = false

  const handleReview = async () => {
    if (!screening) return
    toast.success("Demo mode — review would be submitted")
    setReviewDialogOpen(false)
    setReviewNotes("")
  }

  if (!screening) {
    return (
      <div className="text-center py-8">
        <p className="text-aura-muted">Screening not found</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Screening Result</h1>
            <p className="text-aura-muted">
              Patient: {screening.patient_name} • {screening.clinic_name}
            </p>
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

      {/* Patient Info */}
      <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-aura-muted">Name</p>
              <p className="font-medium">{screening.patient_name}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Age / Gender</p>
              <p className="font-medium">{patientAge} years • {screening.patient_gender}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Age Bracket</p>
              <p className="font-medium">{screening.age_bracket}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Clinic / Clinician</p>
              <p className="font-medium">{screening.clinic_name} / {screening.clinician_name}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Screening Metadata */}
      <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
        <Card>
          <CardHeader>
            <CardTitle>Screening Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-aura-muted">Screening Date</p>
              <p className="font-medium">{new Date(screening.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Model Version</p>
              <p className="font-medium font-mono">{screening.model_version}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Cascade Path</p>
              <p className="font-medium">{screening.cascade_path}</p>
            </div>
            <div>
              <p className="text-sm text-aura-muted">Audio Duration</p>
              <p className="font-medium">{screening.audio_duration_sec ? `${screening.audio_duration_sec}s` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tier 1: TB Gatekeeper */}
      <Card className="border-l-4 border-l-destructive/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Tier 1: TB Gatekeeper
            </CardTitle>
            {getTbBadge(screening.tb_result)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-aura-surface-alt rounded-lg">
              <p className="text-sm text-aura-muted">Confidence</p>
              <p className={cn("text-3xl font-bold font-mono", getConfidenceColor(screening.tb_confidence))}>
                {(screening.tb_confidence ? screening.tb_confidence * 100 : 0).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-aura-surface-alt rounded-lg">
              <p className="text-sm text-aura-muted">Model Version</p>
              <p className="font-mono">{screening.model_version}</p>
            </div>
            <div className="p-4 bg-aura-surface-alt rounded-lg">
              <p className="text-sm text-aura-muted">Cascade</p>
              <p className="font-medium">{screening.cascade_path.includes("Tier 2") ? "Continued to Tier 2" : "Stopped at Tier 1"}</p>
            </div>
          </div>

          {screening.tb_probabilities && (
            <div>
              <p className="text-sm text-aura-muted mb-2">Probability Distribution</p>
              <div className="space-y-3">
                {Object.entries(screening.tb_probabilities).map(([cls, prob]) => (
                  <div key={cls} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={cn("font-medium", cls === "TB" ? "text-destructive" : "text-aura-accent-dark")}>{cls}</span>
                      <span className="font-mono">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={prob * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {screening.tb_result === "TB" && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                High Priority: TB Detected
              </h4>
              <p className="mt-2 text-sm">Immediate referral for confirmatory TB testing recommended. Follow local TB protocols.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier 2: Respiratory Classifier */}
      {screening.respiratory_result && (
        <Card className="border-l-4 border-l-aura-accent/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-aura-accent" />
                Tier 2: Respiratory Classifier
              </CardTitle>
              {getRespBadge(screening.respiratory_result)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-aura-surface-alt rounded-lg">
                <p className="text-sm text-aura-muted">Confidence</p>
                <p className={cn("text-3xl font-bold font-mono", getConfidenceColor(screening.respiratory_confidence))}>
                  {(screening.respiratory_confidence ? screening.respiratory_confidence * 100 : 0).toFixed(1)}%
                </p>
              </div>
            </div>

            {screening.respiratory_probabilities && (
              <div>
                <p className="text-sm text-aura-muted mb-2">Probability Distribution</p>
                <div className="space-y-3">
                  {Object.entries(screening.respiratory_probabilities).map(([cls, prob]) => (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={cn("font-medium", cls === "Pneumonia" ? "text-destructive" : cls === "COPD" ? "text-aura-warning" : "text-aura-accent-dark")}>{cls}</span>
                        <span className="font-mono">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={prob * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screening.respiratory_result === "Pneumonia" && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  High Priority: Pneumonia Suspected
                </h4>
                <p className="mt-2 text-sm">Urgent clinical evaluation recommended. Consider chest imaging and antibiotics per guidelines.</p>
              </div>
            )}

            {screening.respiratory_result === "COPD" && (
              <div className="p-4 bg-aura-warning-soft border border-aura-warning-border rounded-lg">
                <h4 className="font-semibold text-aura-warning-strong flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Moderate Priority: COPD Suspected
                </h4>
                <p className="mt-2 text-sm">Clinical evaluation recommended. Consider spirometry and pulmonology referral.</p>
              </div>
            )}

            {screening.respiratory_result === "Healthy" && (
              <div className="p-4 bg-aura-accent-soft border border-aura-border rounded-lg">
                <h4 className="font-semibold text-aura-accent-dark flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Low Priority: No Acute Findings
                </h4>
                <p className="mt-2 text-sm">No urgent action required. Routine follow-up as clinically indicated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Status */}
      <Card>
        <CardHeader>
          <CardTitle>Review Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-aura-muted">Status</p>
            <Badge variant={screening.status === "pending_review" ? "warning" : screening.reviewed_by ? "success" : "secondary"}>
              {screening.status === "pending_review" ? "Pending Review" : screening.reviewed_by ? "Reviewed" : screening.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-aura-muted">Reviewed By</p>
            <p className="font-medium">{screening.reviewed_by_name || "Not yet reviewed"}</p>
          </div>
          <div>
            <p className="text-sm text-aura-muted">Review Date</p>
            <p className="font-medium">{screening.reviewed_at ? new Date(screening.reviewed_at).toLocaleString() : "—"}</p>
          </div>
          {screening.review_notes && (
            <div className="md:col-span-3">
              <p className="text-sm text-aura-muted">Review Notes</p>
              <p className="font-medium">{screening.review_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        </CardFooter>
      </Card>

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
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}