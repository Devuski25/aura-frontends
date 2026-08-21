import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function getTbBadge(label: string) {
  if (label === "TB") {
    return (
      <Badge className="gap-1.5 border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">
        <AlertTriangle className="h-3.5 w-3.5" />
        {label}
      </Badge>
    )
  }
  return (
    <Badge className="gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
      <CheckCircle className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}

export function getRespBadge(label: string | null) {
  if (!label) return <Badge variant="secondary" className="px-3 py-1">N/A</Badge>
  const styles: Record<string, string> = {
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    Pneumonia: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    COPD: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  }
  return (
    <Badge className={`gap-1.5 px-3 py-1 ${styles[label] || ""}`}>
      {label === "Healthy" && <CheckCircle className="h-3.5 w-3.5" />}
      {label === "Pneumonia" && <AlertTriangle className="h-3.5 w-3.5" />}
      {label}
    </Badge>
  )
}

export function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    pending: "warning",
    completed: "success",
    failed: "destructive",
  }
  return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
}

export function getResultBadge(tbResult: string | null, respResult: string | null) {
  if (tbResult === "TB") {
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />TB</Badge>
  }
  if (respResult) {
    const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
      Healthy: "success",
      Pneumonia: "destructive",
      COPD: "warning",
    }
    return <Badge variant={variants[respResult] || "default"}>{respResult}</Badge>
  }
  return <Badge variant="secondary">N/A</Badge>
}

export function getConfidenceColor(conf: number | null): string {
  if (conf === null) return "text-muted-foreground"
  if (conf >= 0.9) return "text-aura-accent-dark"
  if (conf >= 0.7) return "text-aura-warning"
  return "text-destructive"
}