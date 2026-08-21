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
  const [showPassword, setShowPassword] = useState(false)

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-aura-muted">Manage users and view system metrics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">
            User Management
          </TabsTrigger>
          <TabsTrigger value="metrics">
            System Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aura-muted" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-10 w-[180px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="clinician">Clinician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={openCreateDialog} className="h-10 sm:ml-3">
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length} of {users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-aura-muted">
                  No user/s found.
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                      <TableRow className="align-middle">
                        <TableHead className="px-4 text-center">Name</TableHead>
                        <TableHead className="px-4 text-center">Email</TableHead>
                        <TableHead className="px-4 text-center">Role</TableHead>
                        <TableHead className="px-4 text-center">Status</TableHead>
                        <TableHead className="w-36 px-4 text-center">Approve / Reject</TableHead>
                        <TableHead className="w-32 px-4 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(u => (
                        <TableRow key={u.id} className="align-middle">
                          <TableCell className="px-4 text-center align-middle">
                            <div className="font-medium">{u.full_name}</div>
                          </TableCell>
                          <TableCell className="px-4 text-center text-sm text-aura-muted align-middle">{u.email}</TableCell>
                          <TableCell className="px-4 text-center align-middle">
                            <div className="flex justify-center">
                              <Badge variant="secondary" className="bg-aura-surface-alt text-aura-text border-aura-border">
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
                                <div className="rounded-full p-1 transition-colors hover:bg-emerald-100">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleApprove(u.id)} title="Approve" aria-label={`Approve ${u.full_name}`}>
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                </div>
                              )}
                              {u.status === "pending" && u.role !== "super_admin" && (
                                <div className="rounded-full p-1 transition-colors hover:bg-red-100">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleReject(u.id)} title="Reject" aria-label={`Reject ${u.full_name}`}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-32 px-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-2">
                              <div className="rounded-full p-1 transition-colors hover:bg-gray-200">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEditDialog(u)} aria-label={`Edit ${u.full_name}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                              {(u.role !== "super_admin" && u.id !== "user-superadmin") && (
                                <div className="rounded-full p-1 transition-colors hover:bg-gray-200">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => confirmDelete(u)} aria-label={`Delete ${u.full_name}`}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-aura-surface-alt rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-aura-muted">Total Screenings</p>
                      <p className="text-2xl font-bold">{totalScreenings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-aura-surface-alt rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-aura-accent" />
                    <div>
                      <p className="text-sm text-aura-muted">Active Users</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.status === "approved").length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-aura-surface-alt rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-aura-warning" />
                    <div>
                      <p className="text-sm text-aura-muted">Pending Approvals</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.status === "pending").length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["clinician", "admin", "super_admin"].map(role => (
                    <div key={role} className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-aura-surface-alt text-aura-text border-aura-border w-24">
                        {role.replace("_", " ")}
                      </Badge>
                      <div className="flex-1 h-2 bg-aura-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(users.filter(u => u.role === role).length / Math.max(users.length, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium">
                        {users.filter(u => u.role === role).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["approved", "pending", "rejected"].map(status => (
                    <div key={status} className="flex items-center gap-4">
                      <Badge variant={status === "approved" ? "success" : status === "pending" ? "warning" : "destructive"} className="w-24">
                        {status}
                      </Badge>
                      <div className="flex-1 h-2 bg-aura-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(users.filter(u => u.status === status).length / Math.max(users.length, 1)) * 100}%`,
                            backgroundColor: status === "approved" ? "var(--color-aura-accent)" : status === "pending" ? "var(--color-aura-warning)" : "var(--destructive)"
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium">
                        {users.filter(u => u.status === status).length}
                      </span>
                    </div>
                  ))}
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
                         <Input type="email" placeholder="you@clinic.com" autoComplete="email" disabled={!!editingUser} {...field} />
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
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" />
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
                  {form.formState.isSubmitting ? "Saving..." : editingUser ? "Update" : "Create"}
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
            <Badge variant="secondary" className="bg-aura-surface-alt text-aura-text border-aura-border ml-auto">
              {deletingUser?.role}
            </Badge>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingUser(null) }} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={deleting}>
              <Loader2 className={cn("mr-2 h-4 w-4", deleting ? "animate-spin" : "hidden")} role="status" aria-live="polite" />
              {deleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}