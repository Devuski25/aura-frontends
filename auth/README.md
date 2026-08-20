# `auth/` — Your folder (login & registration)

You own everything in this folder. **Edit freely.**

## Files you own

| File | Purpose |
|------|---------|
| `routes.tsx` | Routes: `/login`, `/register`, `/reset-password`, `/auth/callback` (add new pages here) |
| `Login.tsx` | Sign-in screen (email/password + "continue with Google") |
| `Register.tsx` | Account creation screen (first user → super_admin, others → clinician + pending) |
| `ResetPassword.tsx` | Forgot-password + new-password screens |
| `AuthCallback.tsx` | Landing spot after OAuth / magic-link redirects |
| `components/GoogleIcon.tsx` | Google "G" logo for the OAuth button |

## How it fits together

One app, still `npm run dev` at the project root → http://localhost:5176.
The central router (`src/App.tsx`) mounts your `routes.tsx`. Auth is a **static
stub**: `src/hooks/useAuth.ts` always returns a fixed signed-in `super_admin`,
and login/register/reset are simulated (demo toasts + fake delays) so every
screen is viewable with no real accounts or backend.

## Import conventions

- Shared UI / auth / mocks: `@/...` — e.g. `@/components/ui/button`, `@/hooks/useAuth`, `@/mocks/data`
- Your own files: `@auth/...` — e.g. `@auth/components/GoogleIcon`

## Do NOT touch

- `src/` (shared plumbing) — ask the lead first
- `../clinician`, `../admin`, `../website` — other teammates' folders

## Verify

```bash
npm run build && npm run lint
```
