import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const Dashboard = lazy(() => import("@clinician/Dashboard").then((m) => ({ default: m.Dashboard })))
const Screening = lazy(() => import("@clinician/Screening").then((m) => ({ default: m.Screening })))
const Screenings = lazy(() => import("@clinician/Screenings").then((m) => ({ default: m.Screenings })))
const Patients = lazy(() => import("@clinician/Patients").then((m) => ({ default: m.Patients })))
const PatientDetail = lazy(() => import("@clinician/PatientDetail").then((m) => ({ default: m.PatientDetail })))
const ScreeningDetail = lazy(() => import("@clinician/ScreeningDetail").then((m) => ({ default: m.ScreeningDetail })))

export const clinicianRoutes: RouteObject[] = [
  { index: true, element: <Dashboard /> },
  { path: "screening", element: <Screening /> },
  { path: "screenings", element: <Screenings /> },
  { path: "patients", element: <Patients /> },
  { path: "patients/:id", element: <PatientDetail /> },
  { path: "screenings/:id", element: <ScreeningDetail /> },
]