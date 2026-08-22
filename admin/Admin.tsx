"use client"

import { useState } from "react"
import { Loader2, Users, Mail, Edit, Trash2, Activity, Clock, Search, CheckCircle, XCircle, Eye, EyeOff, UserPlus as UserPlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { MOCK_USERS, MOCK_METRICS } from "@/mocks/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FormProvider,
  useForm,
} from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, useReducedMotion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/motion"

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().optional().refine(
    val => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?"':{}|<>]).{8,}$/.test(val),
    "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
  ),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["clinician", "admin"]),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  license_number: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

export function Admin() {
  const users = MOCK_USERS as any[]
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("users")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)
  const deleting = false
  const totalScreenings = MOCK_METRICS.total_requests
  const activeUsers = users.filter(u => u.status === "approved").length
  const pendingApprovals = users.filter(u => u.status === "pending").length
  const [showPassword, setShowPassword] = useState(false)

  const reduceMotion = useReducedMotion()
  const staggerProps = reduceMotion
    ? {}
    : { variants: staggerContainer, initial: "hidden" as const, animate: "visible" as const }
  const itemProps = reduceMotion ? {} : { variants: staggerItem }

  const overviewCards = [
    {
      title: ["Total", "Screenings"],
      value: totalScreenings.toLocaleString(),
      icon: Activity,
      tone: "neutral" as const,
    },
    {
      title: ["Active", "Users"],
      value: activeUsers,
      icon: Users,
      tone: "healthy" as const,
    },
    {
      title: ["Pending", "Approvals"],
      value: pendingApprovals,
      icon: Clock,
      tone: "alert" as const,
    },
  ]

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "clinician",
      phone: "",
      specialization: "",
      license_number: "",
    },
  })

  const handleSubmit = async (_data: UserFormData) => {
    toast.success(editingUser ? "Demo mode — user update would be saved" : "Demo mode — user would be created")
    setDialogOpen(false)
    form.reset()
  }

  const confirmDelete = (target: any) => {
    setDeletingUser(target)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!deletingUser) return
    toast.info("Demo mode — deletion is disabled")
    setDeleteDialogOpen(false)
    setDeletingUser(null)
  }

  const handleApprove = async (_userId: string) => {
    toast.success("Demo mode — user approved (visual only)")
  }

  const handleReject = async (_userId: string) => {
    toast.success("Demo mode — user rejected (visual only)")
  }

  const filteredUsers = users
    .filter(u => {
      if (search) {
        const s = search.toLowerCase()
        return u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      }
      return true
    })
    .filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u => statusFilter === "all" || u.status === statusFilter)

  const openEditDialog = (u: any) => {
    setEditingUser(u)
    setShowPassword(false)
    form.reset({
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      phone: u.phone || "",
      specialization: u.specialization || "",
      license_number: u.license_number || "",
      password: "",
    })
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setShowPassword(false)
    form.reset({
      email: "",
      password: "",
      full_name: "",
      role: "clinician",
      phone: "",
      specialization: "",
      license_number: "",
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <motion.div {...staggerProps} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-aura-ink">Administration</h1>
            <p className="text-aura-muted">Manage user accounts and system activity</p>
          </div>
          {pendingApprovals > 0 && (
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-aura-warning-soft px-3 py-1.5 text-xs font-semibold tabular-nums text-aura-warning-strong sm:self-auto">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {pendingApprovals} Pending Approval{pendingApprovals === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {overviewCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div key={card.title.join("-")} {...itemProps}>
                <Card className={cn(
                  "h-full min-h-[110px] rounded-2xl border border-transparent border-l-[3px] shadow-aura-sm",
                  card.tone === "neutral" && "border-l-aura-forest bg-white",
                  card.tone === "healthy" && "border-l-aura-mint bg-aura-mint-soft",
                  card.tone === "alert" && "border-l-aura-warning-strong bg-aura-warning-soft"
                )}>
                  <CardContent className="flex h-full flex-col justify-between p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-[10px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-aura-muted">
                        {card.title.map((line) => <span key={line} className="block">{line}</span>)}
                      </p>
                      <span className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        card.tone === "neutral" && "bg-aura-sage text-aura-forest",
                        card.tone === "healthy" && "bg-white/80 text-aura-mint",
                        card.tone === "alert" && "bg-white/80 text-aura-warning-strong"
                      )}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <p className={cn(
                      "font-display text-3xl font-semibold leading-none tabular-nums",
                      card.tone === "neutral" && "text-aura-ink",
                      card.tone === "healthy" && "text-aura-mint",
                      card.tone === "alert" && "text-aura-warning-strong"
                    )}>{card.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="metrics">Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="overflow-hidden rounded-2xl border border-aura-line bg-white shadow-aura-sm">
            <CardHeader className="border-b border-aura-line px-6 py-5">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <CardTitle className="font-display text-lg font-semibold text-aura-ink">User Accounts</CardTitle>
                  <p className="mt-1 text-sm tabular-nums text-aura-muted">
                    Showing {filteredUsers.length} of {users.length} accounts
                  </p>
                </div>
                <Button onClick={openCreateDialog} className="h-10 shrink-0">
                  <UserPlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add User
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative max-w-xs flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aura-muted" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder="Name or email…"
                    aria-label="Search users by name or email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10 w-full md:w-[170px]" aria-label="Filter by role"><SelectValue placeholder="All Roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="clinician">Clinician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 w-full md:w-[170px]" aria-label="Filter by status"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aura-sage">
                    <Search className="h-6 w-6 text-aura-muted" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-aura-ink">No Users Found</p>
                  <p className="text-xs text-aura-muted">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-aura-sage">
                      <TableRow className="align-middle border-b border-aura-line hover:bg-transparent">
                        <TableHead className="px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Name</TableHead>
                        <TableHead className="px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Email</TableHead>
                        <TableHead className="px-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Role</TableHead>
                        <TableHead className="px-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Status</TableHead>
                        <TableHead className="w-36 px-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Approve / Reject</TableHead>
                        <TableHead className="w-32 px-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-aura-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(u => (
                        <TableRow key={u.id} className="align-middle border-b border-aura-line hover:bg-aura-surface-alt">
                          <TableCell className="px-4 align-middle">
                            <div className="truncate font-medium">{u.full_name}</div>
                          </TableCell>
                          <TableCell className="px-4 align-middle">
                            <div className="whitespace-nowrap text-sm text-aura-muted">{u.email}</div>
                          </TableCell>
                          <TableCell className="px-4 text-center align-middle">
                            <div className="flex justify-center">
                              <Badge variant="secondary" className="border-transparent bg-aura-sage text-aura-forest">
                                {u.role.replace("_", " ")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-center align-middle">
                            <div className="flex justify-center">
                              <Badge variant={u.status === "approved" ? "success" : u.status === "pending" ? "warning" : "destructive"}>
                                {u.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="w-36 px-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-1">
                              {u.status === "pending" && u.role !== "super_admin" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full transition-colors hover:bg-aura-mint-soft"
                                  onClick={() => handleApprove(u.id)}
                                  title="Approve"
                                  aria-label={`Approve ${u.full_name}`}
                                >
                                  <CheckCircle className="h-4 w-4 text-aura-mint" />
                                </Button>
                              )}
                              {u.status === "pending" && u.role !== "super_admin" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full transition-colors hover:bg-aura-coral-soft"
                                  onClick={() => handleReject(u.id)}
                                  title="Reject"
                                  aria-label={`Reject ${u.full_name}`}
                                >
                                  <XCircle className="h-4 w-4 text-aura-coral" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-32 px-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-aura-muted transition-colors hover:bg-aura-sage hover:text-aura-forest"
                                onClick={() => openEditDialog(u)}
                                aria-label={`Edit ${u.full_name}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {(u.role !== "super_admin" && u.id !== "user-superadmin") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-destructive transition-colors hover:bg-aura-coral-soft"
                                  onClick={() => confirmDelete(u)}
                                  aria-label={`Delete ${u.full_name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border border-aura-line bg-white shadow-aura-sm">
              <CardHeader className="px-6 py-5">
                <CardTitle className="font-display text-lg font-semibold text-aura-ink">Role Distribution</CardTitle>
                <p className="mt-1 text-sm text-aura-muted">Accounts across permission levels</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["clinician", "admin", "super_admin"].map(role => {
                    const count = users.filter(u => u.role === role).length
                    const pct = (count / Math.max(users.length, 1)) * 100
                    return (
                      <div key={role} className="flex items-center gap-4">
                        <Badge variant="secondary" className="w-24 shrink-0 justify-center border-transparent bg-aura-sage capitalize text-aura-forest">
                          {role.replace("_", " ")}
                        </Badge>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-aura-sage">
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm font-semibold tabular-nums text-aura-ink">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-aura-line bg-white shadow-aura-sm">
              <CardHeader className="px-6 py-5">
                <CardTitle className="font-display text-lg font-semibold text-aura-ink">Status Distribution</CardTitle>
                <p className="mt-1 text-sm text-aura-muted">Approval state of all accounts</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["approved", "pending", "rejected"].map(status => {
                    const count = users.filter(u => u.status === status).length
                    const pct = (count / Math.max(users.length, 1)) * 100
                    return (
                      <div key={status} className="flex items-center gap-4">
                        <Badge
                          variant={status === "approved" ? "success" : status === "pending" ? "warning" : "destructive"}
                          className="w-24 shrink-0 justify-center capitalize"
                        >
                          {status}
                        </Badge>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-aura-sage">
                          <div
                            className={cn(
                              "h-full rounded-full transition-[width] duration-300",
                              status === "approved" && "bg-primary",
                              status === "pending" && "bg-aura-warning",
                              status === "rejected" && "bg-destructive"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm font-semibold tabular-nums text-aura-ink">
                          {Math.round(pct)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                         <Input placeholder="Dr. John Smith" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                         <Input type="email" placeholder="you@clinic.com" autoComplete="email" autoCapitalize="none" spellCheck={false} disabled={!!editingUser} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" {...field} className="pr-10" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2.5 text-aura-muted transition-colors hover:text-aura-text"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clinician">Clinician</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pulmonology, Internal Medicine, etc." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Professional license number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving…" : editingUser ? "Save Changes" : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md sm:top-[15%]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deletingUser?.full_name}</span>?
              <br />
              This action <span className="font-semibold text-destructive">cannot be undone</span>.
              The user will lose access to their account immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg bg-aura-surface-alt p-3 text-sm">
            <Mail className="h-4 w-4 text-aura-muted shrink-0" />
            <span className="text-aura-muted">{deletingUser?.email}</span>
            <Badge variant="secondary" className="ml-auto border-transparent bg-aura-sage text-aura-forest">
              {deletingUser?.role}
            </Badge>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingUser(null) }} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={deleting}>
              <Loader2 className={cn("mr-2 h-4 w-4", deleting ? "animate-spin" : "hidden")} role="status" aria-live="polite" />
              {deleting ? "Deleting…" : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}