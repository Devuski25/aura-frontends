export type MockRole = "guest" | "clinician" | "admin" | "super_admin"

interface Profile {
  id: string
  email: string
  full_name: string
  role: "clinician" | "admin" | "super_admin"
  status: "pending" | "approved" | "rejected" | "deleted"
  clinic_id: string | null
  phone: string | null
  specialization: string | null
  license_number: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  avatar_url: string | null
}

const STATIC_USER: Profile = {
  id: "user-superadmin",
  email: "rheincama@gmail.com",
  full_name: "Rein Cama",
  role: "super_admin",
  status: "approved",
  clinic_id: null,
  phone: null,
  specialization: "System Administrator",
  license_number: null,
  last_login_at: new Date(Date.now() - 3600000).toISOString(),
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  updated_at: new Date(Date.now() - 3600000).toISOString(),
  avatar_url: null,
}

type AuthError = { message: string }

/**
 * Static UI/UX mockup auth stub — no real authentication.
 * Always returns a fixed signed-in super_admin so every page is viewable.
 * All methods are inert.
 */
export function useAuth() {
  return {
    user: STATIC_USER,
    loading: false,
    accessToken: "static-access-token",
    isPasswordRecovery: false,
    signIn: async (_email?: string, _password?: string): Promise<{ error: AuthError | null; accountStatus?: string }> =>
      ({ error: null, accountStatus: "approved" }),
    signUp: async (_data?: Record<string, unknown>): Promise<{ error: AuthError | null; autoApproved: boolean }> =>
      ({ error: null, autoApproved: true }),
    signInWithOAuth: async (_provider?: string): Promise<{ error: AuthError | null }> => ({ error: null }),
    signOut: async (): Promise<void> => {},
    refreshUser: async (): Promise<void> => {},
    confirmLogin: async (): Promise<void> => {},
    mockRole: "super_admin" as MockRole,
    setMockRole: () => {},
  }
}