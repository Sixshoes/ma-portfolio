# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Next.js 15 (App Router)** frontend app (bilingual academic portfolio). There is no backend, database, or Docker; the only local service is the Next.js dev server. Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`, `clean`) and `README.md`.

### Services / commands
- Dev server: `npm run dev` (serves http://localhost:3000). Routes: `/` (landing) and `/main` (portfolio).
- Lint: `npm run lint`. Note: `hooks/use-is-ios.ts` and `hooks/use-low-power-mode.ts` currently emit 2 pre-existing `react-hooks/set-state-in-effect` errors — these are unrelated to environment setup. `next build` does not fail on lint (`eslint.ignoreDuringBuilds: true` in `next.config.ts`), but it does fail on TypeScript errors.
- Build: `npm run build`.
- Tests: none configured (no test script, no test files).

### Non-obvious notes
- Publications are fetched client-side from `https://sixshoes.github.io/Ma-Research-Portal/papers.json`; the app falls back to embedded data in `lib/publications.ts` if the fetch fails, so the Publications section still renders without network access.
- In the Cloud VM, external journal/CDN images (e.g. `ars.els-cdn.com`, `pubs.acs.org`) may be blocked by egress (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`). This only affects some remote images; the UI and core functionality are unaffected.
- Node 18.17+ is required (README); the VM ships Node 22, which works.
- No secrets are required for local development. `.env.example` lists `GEMINI_API_KEY`/`APP_URL` but they are AI Studio template remnants and unused in app code.
