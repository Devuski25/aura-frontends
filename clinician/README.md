# `clinician/` — Your folder (clinician-facing screens)

You own everything in this folder. **Edit freely.**

## Files you own

| File | Purpose |
|------|---------|
| `routes.tsx` | Route definitions for `/dashboard` (add new pages here) |
| `Dashboard.tsx` | Doctor / nurse overview dashboard (`/dashboard`) |
| `Screening.tsx` | 3-step screening wizard (`/dashboard/screening`) |
| `Screenings.tsx` | Screening history list (`/dashboard/screenings`) |
| `ScreeningDetail.tsx` | Single screening report (`/dashboard/screenings/:id`) |
| `Patients.tsx` | Patient list (`/dashboard/patients`) |
| `PatientDetail.tsx` | Single patient + their screenings (`/dashboard/patients/:id`) |
| `components/CameraCoughDetection.tsx` | Live camera + cough-recording widget (uses mediapipe wasm in `public/`) |
| `components/NewPatientModal.tsx` | Add-patient dialog |
| `lib/badge-helpers.tsx` | Result badges / confidence colors for TB, COPD, Pneumonia, Healthy |

## How it fits together

One app, still `npm run dev` at the project root → http://localhost:5176.
The central router (`src/App.tsx`) mounts your `routes.tsx` under the
`/dashboard` shell (shared `src/components/layout/`). The app runs on **mocks**
(auth, database, inference) so it works with no backend.

## Import conventions

- Shared UI / auth / mocks: `@/...` — e.g. `@/components/ui/button`, `@/hooks/useAuth`, `@/mocks/data`
- Your own files: `@clinician/...` — e.g. `@clinician/components/NewPatientModal`, `@clinician/lib/badge-helpers`

## Do NOT touch

- `src/` (shared plumbing: router, ui kit, mock auth) — ask the lead first
- `../admin`, `../auth`, `../website` — other teammates' folders
- `public/mediapipe/` — the camera widget loads these wasm files by absolute path

## Verify

```bash
npm run build && npm run lint
```
