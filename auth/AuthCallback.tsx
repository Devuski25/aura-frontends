"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { pageVariants } from "@/lib/motion"
import { Loader2, CheckCircle, AlertCircle, ArrowRight, Clock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const accountStatus: "pending" | "rejected" | "deleted" | null = null
  const callbackStartedRef = useRef(false)

  useEffect(() => {
    // Guard against infinite re-runs: only execute once per mount
    if (callbackStartedRef.current) return
    callbackStartedRef.current = true

    // Demo mode: simulate the OAuth callback resolving successfully
    const errorParam = searchParams.get("error")
    const timer = setTimeout(() => {
      if (errorParam) {
        setError("Authentication failed")
        setLoading(false)
        return
      }
      setSuccess(true)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [searchParams])

  const goToLogin = () => {
    navigate("/login")
  }

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen flex items-center justify-center bg-aura-surface px-4 py-12"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-aura-accent" role="status" aria-live="polite" />
          <p className="text-aura-text">Completing sign in…</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center bg-aura-surface px-4 py-12"
    >
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            {accountStatus === "pending" ? (
              <>
                <Clock className="h-12 w-12 text-aura-warning mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
                <CardDescription>
                  Your account registration is under review. An administrator will approve it shortly.
                </CardDescription>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Sign In Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-12 w-12 text-aura-accent mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
                <CardDescription>Successfully signed in with Google</CardDescription>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 text-aura-accent mx-auto mb-4 animate-spin" role="status" aria-live="polite" />
                <CardTitle className="text-2xl font-bold">Processing…</CardTitle>
                <CardDescription>Please wait while we complete your sign in</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent />
          <CardFooter className="flex flex-col gap-2">
            {success && (
              <Link to="/dashboard" className={buttonVariants({ className: "w-full" })}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue to Dashboard
              </Link>
            )}
            {accountStatus === "pending" && (
              <Button variant="outline" onClick={goToLogin} className="w-full">
                Back to Login
              </Button>
            )}
            {error && (
              <Button variant="outline" onClick={goToLogin} className="w-full">
                Back to Login
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  )
}