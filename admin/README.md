# `admin/` — Your folder (admin-facing screen)

You own everything in this folder. **Edit freely.**

## Files you own

| File | Purpose |
|------|---------|
| `routes.tsx` | Route for `/dashboard/admin` (already role-gated to admin/super_admin) |
| `Admin.tsx` | User management: list users, approve/pending, change roles, remove users |

## How it fits together

One app, still `npm run dev` at the project root → http://localhost:5176.
The central router (`src/App.tsx`) mounts your route inside the `/dashboard`
shell. The route is wrapped in a `PrivateRoute` that only lets `admin` and
`super_admin` roles through — edit `routes.tsx` if you change that rule.
The app runs on **mocks** (auth + database), so user rows come from
`src/mocks/data.ts`.

## Import conventions

- Shared UI / auth / mocks: `@/...` — e.g. `@/components/ui/button`, `@/hooks/useAuth`, `@/mocks/data`
- Your own files: `@admin/...`

## Do NOT touch

- `src/` (shared plumbing) — ask the lead first
- `../clinician`, `../auth`, `../website` — other teammates' folders

## Try it

Open http://localhost:5176/dashboard/admin and use the **"View as Admin / Super Admin"**
switcher (bottom-left) if you're not already admin.

## Verify

```bash
npm run build && npm run lint
```
