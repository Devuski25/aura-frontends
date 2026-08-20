import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const Login = lazy(() => import("@auth/Login").then((m) => ({ default: m.Login })))
const Register = lazy(() => import("@auth/Register").then((m) => ({ default: m.Register })))
const ResetPassword = lazy(() => import("@auth/ResetPassword").then((m) => ({ default: m.ResetPassword })))
const AuthCallback = lazy(() => import("@auth/AuthCallback").then((m) => ({ default: m.AuthCallback })))

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/auth/callback", element: <AuthCallback /> },
]