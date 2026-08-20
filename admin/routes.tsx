import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import { PrivateRoute } from "@/components/PrivateRoute"

const Admin = lazy(() => import("@admin/Admin").then((m) => ({ default: m.Admin })))

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: (
      <PrivateRoute allowedRoles={["admin", "super_admin"]}>
        <Admin />
      </PrivateRoute>
    ),
  },
]