# AURELIS QA

AURELIS QA is an evidence-first platform foundation for evaluating AI-generated websites. Phase 1 delivers the product architecture, full MVP data model, deterministic scoring contracts, a public landing page, and a public read-only demo dashboard.

The interface labels every sample result as `Demo dataset`. No live website audit or AI evaluation is represented as complete.

## Quick start

Requirements:

- Node.js 24 or newer
- pnpm 11.19.0
- Docker Desktop for local PostgreSQL

```bash
pnpm install
copy .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/dashboard` for the demo dashboard.

## Workspace

```text
apps/web            Next.js 16 product and marketing interface
apps/worker         Phase 1 worker capability skeleton
packages/database   Prisma 7 schema, migration, seed, and demo fixture
packages/evaluation Deterministic scoring, structured AI output contract, URL preflight
docs                Architecture, design system, security, and verification notes
```

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Playwright covers desktop Chromium, a Pixel 7 viewport, route boundaries, reduced motion, chart rendering, and axe WCAG 2 A/AA checks.

## Phase boundary

Implemented in Phase 1:

- Dark-only design system and self-hosted Geist fonts
- GSAP landing motion with reduced-motion behavior
- Landing page and responsive demo dashboard
- Full core MVP Prisma schema, initial migration, and idempotent demo seed
- Deterministic weighted scoring and reliability functions
- Zod contract for evidence-backed AI evaluator output
- URL preflight that rejects unsafe schemes, credentials, local hosts, and private IP literals
- Worker skeleton with explicit future capability states

Not implemented:

- Phase 2 authentication, project CRUD, brand profile CRUD, and evaluation submission
- Phase 3 browser capture, Lighthouse, validation, accessibility, and job processing
- Phase 4 AI brand evaluation
- Phase 5 recommendations workflow
- Phase 6 comparison, research mode, and rubric management
- Phase 7 GitHub and PDF integrations

See [architecture](docs/architecture.md), [design system](docs/design-system.md), [security](docs/security.md), and [verification](docs/phase-1-verification.md).
