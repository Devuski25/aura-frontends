"use client"

import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Logo } from "@/components/layout/Logo"
import { Sidebar } from "@/components/layout/Sidebar"
import { useAuth } from "@/hooks/useAuth"
import { pageVariants } from "@/lib/motion"

const STORAGE_KEY = "aura-dx:sidebar-collapsed"

function getInitialCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function Layout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
    } catch {
      /* ignore */
    }
  }, [collapsed])

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"

  return (
    <div className="min-h-screen overflow-x-clip bg-aura-surface">
      <div className="flex min-h-screen flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-aura-border-soft bg-aura-elevated/90 px-4 backdrop-blur-md lg:px-6">
            <motion.button
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="rounded-md p-2.5 text-aura-muted hover:bg-aura-surface-alt lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              <Menu className="h-6 w-6" />
            </motion.button>

            <Logo size="lg" />

            <div className="flex-1" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden rounded-lg p-2 text-aura-muted transition-colors hover:bg-aura-surface-alt hover:text-aura-text lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls="sidebar"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={collapsed ? "expand" : "collapse"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="inline-flex"
                >
                  {collapsed ? (
                    <PanelRightOpen className="h-5 w-5" />
                  ) : (
                    <PanelRightClose className="h-5 w-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              id="main-content"
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 lg:p-6"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>

        <Sidebar
          collapsed={collapsed}
          isAdmin={isAdmin}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSignOut={handleSignOut}
          user={user}
        />
      </div>
    </div>
  )
}