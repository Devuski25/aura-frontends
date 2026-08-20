import { Suspense, Component, type ReactNode } from "react"
import { useEffect } from "react"
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Layout } from "@/components/layout/Layout"
import { PrivateRoute } from "@/components/PrivateRoute"
import { PageLoader } from "@/components/PageLoader"
import { websiteRoutes } from "@website/routes"
import { authRoutes } from "@auth/routes"
import { clinicianRoutes } from "@clinician/routes"
import { adminRoutes } from "@admin/routes"

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex h-screen items-center justify-center bg-aura-surface">
          <div className="text-center max-w-md p-8">
            <h2 className="text-xl font-bold text-aura-text mb-2">Something went wrong</h2>
            <p className="text-aura-muted mb-4">An unexpected error occurred. Please try refreshing the page.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RootLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Outlet />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      ...websiteRoutes,
      ...authRoutes,
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        ),
        children: [
          ...clinicianRoutes,
          ...adminRoutes,
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  )
}

export default App