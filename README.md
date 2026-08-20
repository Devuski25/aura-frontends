# AURA-Dx — Frontend (Sandbox / Mock Mode)

React 19 + Vite + TypeScript web app for AI cough screening (TB / COPD / Pneumonia / Healthy).

## Folder structure — 4 hand-off parts

The app is split into **4 independent folders**, one per team member. Each folder
is self-contained: it owns its pages, its local components, and its own
`routes.tsx` fragment. The central router in `src/App.tsx` only composes the
fragments — **you never need to edit `src/App.tsx` to add or change pages.**

| Folder | Owner | What's inside |
|--------|-------|---------------|
| [`clinician/`](./clinician) | Clinician groupmate | Dashboard, Screening wizard, Patients, Patient detail, Screenings, Screening detail + `CameraCoughDetection`, `NewPatientModal`, `badge-helpers` |
| [`admin/`](./admin) | Admin groupmate | User management page (role-gated to admin/super_admin) |
| [`auth/`](./auth) | Login/Register groupmate | Login, Register, Reset password, Auth callback + `GoogleIcon` |
| [`website/`](./website) | Public site groupmate | Home, About System, Our Team, Legal & Privacy + `PublicLayout` + site images |

### Shared plumbing (do NOT edit unless you know what you're doing)

```
src/
  App.tsx                  # router: composes the 4 route fragments
  mocks/data.ts            # static mock data (patients, screenings, users, metrics)
  hooks/useAuth.ts         # static auth stub (always super_admin, methods inert)
  lib/                     # utils, motion, useMediaQuery
  components/ui/           # shared shadcn/ui primitives
  components/layout/       # shared app shell (Sidebar, Topbar, Logo)
  components/PrivateRoute.tsx, PageLoader.tsx
```

### Import conventions

- Shared stuff → `@/...` (e.g. `@/mocks/data`, `@/components/ui/button`, `@/hooks/useAuth`)
- Your own folder → `@clinician/`, `@admin/`, `@auth/`, `@website/` aliases
- Your local components live under `<folder>/components/`, helpers under `<folder>/lib/`

## Run it

```bash
npm install
npm run dev        # http://localhost:5176
```

Static mockup mode: every page renders with a fixed signed-in `super_admin`
(see `src/hooks/useAuth.ts`). No accounts, backend, or Supabase needed.

## Verify

```bash
npm run build      # tsc + vite build
npm run lint       # oxlint
```

## Merge workflow

Each groupmate edits only their own folder. Merging = copying their folder back
into this project. No file collisions by construction.

> No new npm packages without approval — the project is feature-complete.
