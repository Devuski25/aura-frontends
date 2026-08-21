"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2, Calendar, MapPin, Stethoscope, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { cardHover } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_PATIENTS, MOCK_SCREENINGS } from "@/mocks/data"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

interface Patient {
  id: string
  full_name: string
  date_of_birth: string
  gender: string
  smoking_history: boolean
  pack_years: number | null
  past_respiratory_diseases: string[]
  symptoms: string[]
  clinic_name: string
  clinician_name: string
  created_at: string
  age_bracket: string
}

interface Screening {
  id: string
  tb_result: string
  tb_confidence: number | null
  respiratory_result: string | null
  respiratory_confidence: number | null
  cascade_path: string
  model_version: string
  status: string
  reviewed_by_name: string | null
  reviewed_at: string | null
  created_at: string
}

export function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deleting = false
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const patient = MOCK_PATIENTS.find(p => p.id === id) as unknown as Patient | null
  const screenings = MOCK_SCREENINGS.filter(s => s.patient_id === id) as unknown as Screening[]

  const handleDelete = async () => {
    if (!id) return
    toast.info("Demo mode — deletion is disabled")
    setDeleteConfirmOpen(false)
  }

  const getTbBadge = (result: string) => (
    <Badge variant={result === "TB" ? "destructive" : "success"}>
      {result}
    </Badge>
  )

  const getRespBadge = (result: string | null) => {
    if (!result) return <Badge variant="secondary">N/A</Badge>
    const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
      Healthy: "success",
      Pneumonia: "destructive",
      COPD: "warning",
    }
    return <Badge variant={variants[result] || "default"}>{result}</Badge>
  }

  const getStatusBadge = (status: string, reviewedBy: string | null) => {
    if (status === "pending_review") return <Badge variant="warning">Pending Review</Badge>
    if (reviewedBy) return <Badge variant="success">Reviewed</Badge>
    return <Badge variant="secondary">{status}</Badge>
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-aura-muted">Patient not found</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/patients")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>
      </div>
    )
  }

  const age = (() => {
      const today = new Date()
      const birthDate = new Date(patient.date_of_birth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{patient.full_name}</h1>
          <p className="text-aura-muted">{patient.clinic_name} • {patient.clinician_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/patients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Patient</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {patient.full_name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age</CardTitle>
              <Calendar className="h-4 w-4 text-aura-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{age} years old</div>
              <p className="text-xs text-aura-muted">DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gender</CardTitle>
              <Shield className="h-4 w-4 text-aura-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{patient.gender}</div>
              <p className="text-xs text-aura-muted">Age bracket: {patient.age_bracket}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Smoking History</CardTitle>
              <Stethoscope className="h-4 w-4 text-aura-muted" />
            </CardHeader>
            <CardContent>
              {patient.smoking_history ? (
                <>
                  <div className="text-2xl font-bold text-aura-warning">Yes</div>
                  <p className="text-xs text-aura-muted">{patient.pack_years ?? "—"} pack-years</p>
                </>
              ) : (
                <div className="text-2xl font-bold text-aura-accent-dark">No</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={cardHover.whileHover} whileTap={cardHover.whileTap}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clinic</CardTitle>
              <MapPin className="h-4 w-4 text-aura-muted" />
            </CardHeader>
            <CardContent>
              <div className="font-medium">{patient.clinic_name}</div>
              <p className="text-xs text-aura-muted">Clinician: {patient.clinician_name}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Medical History */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Past Respiratory Diseases</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.past_respiratory_diseases?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.past_respiratory_diseases.map((d, i) => (
                  <Badge key={i} variant="outline">{d}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-aura-muted">None recorded</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.symptoms?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.symptoms.map((s, i) => (
                  <Badge key={i} variant="secondary">{s}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-aura-muted">None recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Screenings History */}
      <Card>
        <CardHeader>
          <CardTitle>Screening History ({screenings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {screenings.length === 0 ? (
            <div className="text-center py-8 text-aura-muted">
              <p>No screenings yet</p>
              <Button className="mt-4" onClick={() => navigate("/dashboard/screening")}>
                Create First Screening
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>TB Result</TableHead>
                    <TableHead>Respiratory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenings.map((s) => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>{new Date(s.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-aura-muted">{new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </TableCell>
                      <TableCell>{getTbBadge(s.tb_result)}</TableCell>
                      <TableCell>{getRespBadge(s.respiratory_result)}</TableCell>
                      <TableCell>{getStatusBadge(s.status, s.reviewed_by_name)}</TableCell>
                      <TableCell>
                        {s.reviewed_by_name ? (
                          <>
                            {s.reviewed_by_name}
                            <div className="text-xs text-aura-muted">
                              {new Date(s.reviewed_at!).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-aura-muted">Not reviewed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/screenings/${s.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}