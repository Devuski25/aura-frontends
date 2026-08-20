import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { pageVariants } from "@/lib/motion"
import { Logo } from "@/components/layout/Logo"

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "About System", path: "/about" },
  { label: "Our Team", path: "/team" },
  { label: "Legal & Privacy", path: "/legal" },
]

export function PublicLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-aura-bg font-[Poppins,sans-serif] text-aura-text">
      <header className="relative pt-5 pb-2 px-6">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 rounded-full border border-aura-border-soft bg-white/85 px-5 py-2 shadow-aura-md backdrop-blur-md">
          <Link
            to="/"
            aria-label="AURA-Dx — Acoustic Unit for Respiratory Analysis"
            className="flex shrink-0 items-center text-aura-text no-underline"
          >
            <Logo size="lg" />
          </Link>

          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="relative z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-aura-border bg-white lg:hidden"
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
          >
            <span className="block h-0.5 w-4 rounded bg-aura-text transition-all" />
          </motion.button>

          <nav
            className={`${
              navOpen ? "flex" : "hidden"
            } absolute inset-x-4 top-[78px] z-50 flex-col items-stretch gap-2 rounded-[18px] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] lg:static lg:flex lg:flex-row lg:items-center lg:gap-0.5 lg:bg-aura-bg-alt lg:p-1 lg:shadow-none`}
          >
            <ul className="m-0 flex list-none flex-col gap-2 lg:flex-row lg:gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setNavOpen(false)}
                    className={`block rounded-full px-4 py-2.5 text-sm font-semibold no-underline transition-all duration-200 ${
                      pathname === item.path
                        ? "bg-gradient-to-r from-aura-accent-light to-aura-accent-dark text-white shadow-[0_3px_10px_rgba(42,154,99,0.28)]"
                        : "text-aura-muted hover:bg-white/70 hover:text-aura-accent-dark"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Link
              to="/login"
              className="block shrink-0 rounded-full bg-gradient-to-r from-aura-accent to-aura-accent-dark px-5 py-2 text-sm font-bold text-white no-underline shadow-[0_3px_12px_rgba(42,154,99,0.28)] transition-all duration-200 hover:from-aura-accent-dark hover:to-aura-accent-dark hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(42,154,99,0.35)]"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="mt-3 border-t border-aura-border bg-white px-6 py-10 pb-7">
        <div className="mx-auto max-w-[1040px]">
          <div className="flex flex-wrap justify-between gap-6 text-sm text-aura-muted">
            <div className="max-w-md">
              <strong className="text-base text-aura-text">AURA-Dx</strong>
              <br />
              Acoustic Unit for Respiratory Analysis — web-based AI system for early detection of respiratory diseases via cough
              sound analysis.
              <br />
              BS Computer Engineering thesis, University of Rizal System - Morong Campus.
            </div>
          </div>
          <div className="mt-6 border-t border-aura-border-soft pt-4 text-xs text-aura-muted">
            For research and clinical-support use only. Not a substitute for professional medical diagnosis.
          </div>
        </div>
      </footer>
    </div>
  )
}
