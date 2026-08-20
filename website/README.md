# `website/` — Your folder (whole public website)

You own everything in this folder. **Edit freely.**

## Files you own

| File | Purpose |
|------|---------|
| `routes.tsx` | Routes: `/`, `/about`, `/team`, `/legal` (add new public pages here) |
| `Home.tsx` | Landing page |
| `About.tsx` | "About the System" page |
| `Team.tsx` | "Our Team" page (team photos) |
| `Legal.tsx` | Legal & privacy page |
| `components/PublicLayout.tsx` | Shared site header/nav/footer wrapper for all public pages |
| `assets/` | Site images: hero, webdes, university seal, team photos |

## How it fits together

One app, still `npm run dev` at the project root → http://localhost:5176.
The central router (`src/App.tsx`) mounts your `routes.tsx`; every page renders
inside your `PublicLayout` shell. All assets in `assets/` are imported with the
`@website/assets/...` alias.

## Import conventions

- Shared: `@/...` — e.g. `@/lib/motion`, `@/components/layout/Logo`, `@/lib/utils`
- Your own: `@website/...` — e.g. `@website/components/PublicLayout`, `@website/assets/team/...`

## Do NOT touch

- `src/` (shared plumbing) — ask the lead first
- `../clinician`, `../admin`, `../auth` — other teammates' folders

## Verify

```bash
npm run build && npm run lint
```
