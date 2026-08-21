"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { pageVariants } from "@/lib/motion"
import { Loader2, AlertCircle, Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export function ResetPassword() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<0 | 1 | 2 | 3 | 4>(0)

  const calculateStrength = (value: string) => {
    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[a-z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[!@#$%^&*(),.?"':{}|<>]/.test(value)) strength++
    return strength as 0 | 1 | 2 | 3 | 4
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(calculateStrength(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please choose a stronger password.")
      return
    }

    setLoading(true)

    // Demo mode: simulate updating the password without contacting Supabase
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 800)
  }

  const goToLogin = () => {
    navigate("/login")
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center bg-aura-surface px-4 py-12"
    >
      <div className="w-full max-w-md">
        <button
          onClick={goToLogin}
          aria-label="Back to Website"
          title="Back to Website"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-aura-border-soft bg-white text-aura-accent shadow-aura-sm transition-all duration-200 hover:border-aura-accent hover:bg-aura-accent-soft hover:text-aura-accent-dark hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Card className="w-full">
          <CardHeader className="text-center">
            {success ? (
              <>
                <CheckCircle className="h-12 w-12 text-aura-accent mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
                <CardDescription>Your password has been successfully updated</CardDescription>
              </>
            ) : (
              <>
                <Lock className="h-12 w-12 text-aura-accent mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                <CardDescription>Enter your new password below. Make sure it's strong and memorable.</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg" role="alert">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <p className="text-xs text-aura-muted">At least 8 characters with uppercase, lowercase, number, and special character</p>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2.5 text-aura-muted transition-colors hover:text-aura-text"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1" role="progressbar" aria-valuenow={passwordStrength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
                      <div className="h-1.5 rounded-full overflow-hidden bg-aura-border-soft">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            backgroundColor:
                              passwordStrength <= 1 ? "var(--destructive)" :
                              passwordStrength === 2 ? "var(--color-aura-warning)" :
                              passwordStrength === 3 ? "var(--color-aura-warning)" :
                              "var(--color-aura-accent)",
                          }}
                        />
                      </div>
                      <p className="text-xs text-aura-muted">
                        {passwordStrength === 0 ? "Very weak" :
                         passwordStrength === 1 ? "Weak" :
                         passwordStrength === 2 ? "Fair" :
                         passwordStrength === 3 ? "Good" :
                         "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-aura-muted hover:text-aura-text"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10" disabled={loading || passwordStrength < 3}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" role="status" aria-live="polite" />}
                  {loading ? "Updating…" : "Update Password"}
                </Button>
              </form>
            )}

            {success && (
              <div className="text-center py-4">
                <p className="text-aura-text mb-4">Your password has been reset successfully.</p>
                <Button onClick={goToLogin} className="w-full">
                  Sign In with New Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}