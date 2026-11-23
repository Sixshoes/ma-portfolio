# Prof. Yuan-Ron Ma — Academic Portfolio

Academic portfolio website for **Prof. Yuan-Ron Ma (馬遠榮副校長)**, Vice President & Chair Professor at Fo Guang University and Distinguished Professor of Physics at National Dong Hwa University.

## Features

- **Bilingual Support (EN / 繁體中文)**: Seamless language switching with `<html lang>` sync and persisted preference.
- **Automated Live Publications Sync (A ↔ B Site Architecture)**:
  - Server-side ISR (`revalidate = 3600`) fetches the latest publication dataset from [Ma-Research-Portal](https://github.com/Sixshoes/Ma-Research-Portal) (`papers.json`) for fast first paint & SEO.
  - Client-side Stale-While-Revalidate (`cache: 'no-cache'` with HTTP ETag / `304 Not Modified`) keeps returning visitors up-to-date automatically without stale lock-in.
  - Real-time keyword search, year/selected filters, dynamic H-index calculation, and automatic DOI → Altmetric linking.
- **Responsive & Accessible UI**: Hardware-aware lite visual mode for mobile/iOS/reduced-motion, on-demand Canvas lattice rendering, and UTF-8 vCard contact download.

## Tech Stack

- **Framework**: Next.js 15 (App Router + ISR)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React, Motion (`motion/react`), Lenis
- **Deployment**: Vercel (production) + GitHub Actions CI (`typecheck` / `lint` / `build`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page, or `/main` for the main portfolio.

### Verification Commands

```bash
npm run typecheck
npm run lint
npm run build
```

## Project Structure

- `app/`: Next.js App Router pages, layout (with Open Graph & JSON-LD `Person` metadata), and shared components (`app/components/`).
- `app/main/`: ISR Server Component entry (`page.tsx`), interactive client shell (`MainClient.tsx`), and page sections (`sections/`).
- `hooks/`: Custom React hooks (`usePublications.ts`, `use-mobile.ts`, `use-lite-visuals.ts`, `use-is-ios.ts`).
- `lib/`: Data normalization (`publications.ts`), cross-site caching & ISR fetcher (`papersCache.ts`), bilingual copy (`i18n.ts`), impact metrics & vCard (`impactData.ts`), and canonical site URL (`site-url.ts`).
- `public/`: Local optimized static assets (`profile.jpg`).

## Data Sources

- **Publications & Dynamic Metrics**: Automatically synced from Notion via [Ma-Research-Portal](https://sixshoes.github.io/Ma-Research-Portal/papers.json).
- **Rankings & Institutional Impact**: AD Scientific Index.

## License & Copyright

- **Source Code**: MIT License ([LICENSE](LICENSE))
- **Content**: © Yuan-Ron Ma (馬遠榮). All Rights Reserved.
- **Maintainer**: Yiting Chen (Allen) — Fo Guang University Office of Sustainability
