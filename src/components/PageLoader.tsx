export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div role="status" aria-label="Loading" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}