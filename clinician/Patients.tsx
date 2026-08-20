"use client"

import { useState } from "react"
import { Loader2, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MOCK_PATIENTS, MOCK_SCREENINGS } from "@/mocks/data"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { getResultBadge } from "@clinician/lib/badge-helpers"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const patientSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  smoking_history: z.boolean(),
  pack_years: z.coerce.number().nullable().optional(),
  past_respiratory_diseases: z.array(z.string()),
  symptoms: z.array(z.string()),
})

// Disease type is derived from the latest screening result.
// TB takes priority (matches getResultBadge); otherwise the respiratory result.
export const DISEASE_FILTERS = ["Healthy", "COPD", "Pneumonia", "TB"] as const
export type DiseaseFilter = (typeof DISEASE_FILTERS)[number]

export function getPatientDisease(patient: any): string | null {
  const ls = patient?.latest_screening
  if (!ls) return null
  if (ls.tb_result === "TB") return "TB"
  if (ls.respiratory_result) return ls.respiratory_result
  return null
}

function computeAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

type PatientFormData = z.infer<typeof patientSchema>

function buildStaticPatients(): any[] {
  const latestByPatient: Record<string, any> = {}
  for (const s of MOCK_SCREENINGS) {
    if (!latestByPatient[s.patient_id]) {
      latestByPatient[s.patient_id] = s
    }
  }
  return MOCK_PATIENTS.map(p => ({
    ...p,
    latest_screening: latestByPatient[p.id] ?? null,
  }))
}

const STATIC_PATIENTS = buildStaticPatients()

export function Patients() {
  const patients = STATIC_PATIENTS
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [diseaseFilter, setDiseaseFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<any | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const deleting = false

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      gender: "male",
      smoking_history: false,
      pack_years: undefined,
      past_respiratory_diseases: [],
      symptoms: [],
    },
  })

  const handleSubmit = async (_data: PatientFormData) => {
    toast.success(editingPatient ? "Demo mode — patient updated visually only" : "Demo mode — patient would be created")
    setDialogOpen(false)
    form.reset()
  }

  const handleDelete = async () => {
    if (!deletingPatient) return
    toast.info("Demo mode — deletion is disabled")
    setDeleteConfirmOpen(false)
    setDeletingPatient(null)
  }

  const filteredPatients = patients
    .filter(p => {
      if (search) {
        const searchLower = search.toLowerCase()
        return p.full_name.toLowerCase().includes(searchLower)
      }
      return true
    })
    .filter(p => {
      if (genderFilter === "all") return true
      return p.gender === genderFilter
    })
    .filter(p => {
      if (diseaseFilter === "all") return true
      return getPatientDisease(p) === diseaseFilter
    })

  const openEditDialog = (patient: any) => {
    setEditingPatient(patient)
    form.reset({
      full_name: patient.full_name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      smoking_history: patient.smoking_history || false,
      pack_years: patient.pack_years ?? undefined,
      past_respiratory_diseases: patient.past_respiratory_diseases || [],
      symptoms: patient.symptoms || [],
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingPatient(null)
    form.reset({
      full_name: "",
      date_of_birth: "",
      gender: "male",
      smoking_history: false,
      pack_years: undefined,
      past_respiratory_diseases: [],
      symptoms: [],
    })
    setDialogOpen(true)
  }

  const confirmDelete = (patient: any) => {
    setDeletingPatient(patient)
    setDeleteConfirmOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-aura-muted">Manage patient records and screenings</p>
        </div>
        <Button onClick={openCreateDialog}>
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aura-muted" />
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Disease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {DISEASE_FILTERS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patients Records ({filteredPatients.length} of {patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-aura-muted">
              No patients found.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-aura-elevated">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age & Gender</TableHead>
                    <TableHead>Smoking</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Latest Result</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(patient => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-xs text-aura-muted">{patient.clinician_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{patient.age_bracket}</div>
                          <div className="text-xs text-aura-muted capitalize">{patient.gender}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.smoking_history ? (
                          <Badge variant="secondary">
                            {patient.pack_years ? `${patient.pack_years} pack-years` : "Yes"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non-smoker</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(patient.past_respiratory_diseases || []).slice(0, 2).map((d: string, i: number) => (
                            <Badge key={i} variant="outline">{d}</Badge>
                          ))}
                          {(patient.past_respiratory_diseases || []).length > 2 && (
                            <Badge variant="outline">+{(patient.past_respiratory_diseases || []).length - 2} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getResultBadge(
                          patient.latest_screening?.tb_result || null,
                          patient.latest_screening?.respiratory_result || null
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-aura-muted">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(patient)} aria-label={`Edit ${patient.full_name}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(patient)} aria-label={`Delete ${patient.full_name}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update patient information" : "Create a new patient record"}
            </DialogDescription>
          </DialogHeader>
          <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" autoComplete="bday" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {editingPatient && (
                <div className="flex items-center gap-2 rounded-lg bg-aura-surface-alt px-4 py-3">
                  <span className="text-sm text-aura-muted">Age</span>
                  <span className="text-lg font-semibold text-aura-text">
                    {computeAge(form.watch("date_of_birth")) ?? "—"} years old
                  </span>
                </div>
              )}

              {!editingPatient && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pack_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pack Years (if smoker)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="e.g., 20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="smoking_history"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormLabel>Smoking History</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="past_respiratory_diseases"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Respiratory Diseases (comma separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Asthma, COPD, Bronchitis"
                            value={field.value.join(", ")}
                            onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormDescription>Separate with commas</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Symptoms (comma separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cough, Fever, Shortness of breath"
                            value={field.value.join(", ")}
                            onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          />
                        </FormControl>
                        <FormDescription>Separate with commas</FormDescription>
                      </FormItem>
                    )}
                  />
                </>
              )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : editingPatient ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingPatient?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Loader2 className={`mr-2 h-4 w-4 ${deleting ? "animate-spin" : "hidden"}`} role="status" aria-live="polite" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}