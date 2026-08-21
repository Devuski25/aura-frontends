"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { pageVariants } from "@/lib/motion"
import { Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle, XCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { GoogleIcon } from "@auth/components/GoogleIcon"

export function Register() {
  const { signUp, signInWithOAuth } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "",
    license_number: "",
  })
  const [passwordStrength, setPasswordStrength] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpMessage, setOtpMessage] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoVerifyingRef = useRef(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)

    if (name === "password") {
      let strength = 0
      if (value.length >= 8) strength++
      if (/[A-Z]/.test(value)) strength++
      if (/[a-z]/.test(value)) strength++
      if (/[0-9]/.test(value)) strength++
      if (/[!@#$%^&*(),.?"':{}|<>]/.test(value)) strength++
      setPasswordStrength(strength as 0 | 1 | 2 | 3 | 4)
    }

    // Reset OTP verification if email changes
    if (name === "email") {
      setOtpSent(false)
      setOtpVerified(false)
      setOtpCode("")
      setOtpMessage(null)
      setOtpError(null)
    }
  }

  const handleSendOtp = async () => {
    if (!formData.email) {
      setOtpError("Please enter your email first")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setOtpError("Please enter a valid email address")
      return
    }

    setOtpSending(true)
    setOtpError(null)
    setOtpMessage(null)

    // Demo mode: simulate sending the OTP without contacting the backend
    setTimeout(() => {
      setOtpSent(true)
      setOtpMessage("Verification code sent! Check your email inbox. (Demo: any 6-digit code works)")
      setOtpCooldown(60)
      cooldownRef.current = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setOtpSending(false)
    }, 700)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted) return
    setError(null)

    if (!otpVerified) {
      setError("Please verify your email before registering")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?"':{}|<>]).{8,}$/
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character")
      return
    }

    setSubmitted(true)
    setLoading(true)
    const { error: signUpError, autoApproved } = await signUp({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: "clinician",
      phone: formData.phone || undefined,
      specialization: formData.specialization || undefined,
      license_number: formData.license_number || undefined,
      otp_code: otpCode,
    })

    if (signUpError) {
      let friendlyMessage = signUpError.message
      const lowerMsg = signUpError.message.toLowerCase()
      if (lowerMsg.includes("already registered") ||
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("duplicate") ||
          lowerMsg.includes("user already") ||
          lowerMsg.includes("email already")) {
        friendlyMessage = "An account with this email already exists. Please sign in instead."
      }
      setErrorMessage(friendlyMessage)
      setShowErrorDialog(true)
      setLoading(false)
      setSubmitted(false)
      return
    }

    setLoading(false)
    if (autoApproved) {
      // Account was auto-approved (e.g. seeded super_admin) but the backend
      // register flow creates no session — prompt sign-in instead of jumping
      // to the dashboard.
      navigate("/login")
      return
    }
    setShowApprovalDialog(true)
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  const canRegister = otpVerified && formData.password && passwordStrength >= 3 && formData.password === formData.confirmPassword

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center bg-aura-accent px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Register as a clinician to access AURA-Dx</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Dr. John Smith"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Email + OTP Verification */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@clinic.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading || otpVerified}
                  className="h-10 flex-1"
                />
                <Button
                  type="button"
                  variant={otpVerified ? "default" : "outline"}
                  size="sm"
                  className="h-10 px-3 shrink-0"
                  disabled={loading || otpVerified || !isEmailValid || otpCooldown > 0}
                  onClick={handleSendOtp}
                >
                  {otpSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" role="status" aria-live="polite" />
                  ) : otpVerified ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : otpCooldown > 0 ? (
                    <span className="text-xs">{otpCooldown}s</span>
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* OTP Input — always visible, disabled until code is sent */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="otp">Verification Code</Label>
                <p className="text-xs text-aura-muted">
                  {otpVerified
                    ? "Your email has been verified"
                    : "Click the mail icon to send a 6-digit code to your email"}
                </p>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      setOtpCode(val)
                      setOtpError(null)

                      // Auto-verify when 6 digits entered
                      if (val.length === 6 && !autoVerifyingRef.current) {
                        autoVerifyingRef.current = true
                        setOtpVerifying(true)
                        setOtpError(null)
                        // Demo mode: any 6-digit code verifies
                        setTimeout(() => {
                          setOtpVerified(true)
                          setOtpMessage("Email verified successfully!")
                          setOtpVerifying(false)
                          autoVerifyingRef.current = false
                        }, 800)
                      }
                    }}
                    disabled={loading || otpVerified || !otpSent}
                    className="h-10 tracking-widest text-center text-lg pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {otpVerifying && <Loader2 className="h-4 w-4 animate-spin text-aura-muted" role="status" aria-live="polite" />}
                    {!otpVerifying && otpError && otpCode.length === 0 && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Status Messages */}
              {otpMessage && (
                <p className={`text-xs ${otpVerified ? "text-aura-accent-dark" : "text-aura-accent"}`}>
                  {otpMessage}
                </p>
              )}
              {otpError && (
                <p className="text-xs text-destructive">{otpError}</p>
              )}
              {otpVerified && (
                <p className="text-xs text-aura-accent-dark flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Email verified
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization (optional)</Label>
              <Input
                id="specialization"
                name="specialization"
                type="text"
                placeholder="Pulmonology, Internal Medicine, etc."
                value={formData.specialization}
                onChange={handleChange}
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number (optional)</Label>
              <Input
                id="license_number"
                name="license_number"
                type="text"
                placeholder="Professional license number"
                value={formData.license_number}
                onChange={handleChange}
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <p className="text-xs text-aura-muted">At least 8 characters with uppercase, lowercase, number, and a special character</p>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
              {formData.password && (
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading || !canRegister}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" role="status" aria-live="polite" />}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {!otpVerified && (
              <p className="text-xs text-center text-aura-muted">
                Verify your email above before registering
              </p>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-aura-border-soft" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-aura-muted">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 gap-2"
              disabled={loading}
              onClick={async () => {
                setError(null)
                setLoading(true)
                const { error } = await signInWithOAuth("google")
                if (error) {
                  setError(error.message)
                  setLoading(false)
                }
              }}
            >
              <GoogleIcon className="h-4 w-4" />
              Continue with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-aura-muted">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={() => { setShowApprovalDialog(false); navigate("/login") }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-aura-accent" />
              Registration Submitted
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your account has been registered and is pending administrator approval. You will be able to sign in once an admin approves your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowApprovalDialog(false); navigate("/login") }}>
              Back to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={() => { setShowErrorDialog(false); navigate("/login") }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Registration Failed
            </DialogTitle>
            <DialogDescription className="pt-2">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowErrorDialog(false); navigate("/login") }}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
