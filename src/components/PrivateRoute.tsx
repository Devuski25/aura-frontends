import type { ReactNode } from "react"

/**
 * Static UI/UX mockup — no auth gate. Every route is directly reachable.
 * The `allowedRoles` prop is accepted for route-compat but ignored.
 */
export function PrivateRoute({ children }: { children: ReactNode; allowedRoles?: string[] }) {
  return <>{children}</>
}