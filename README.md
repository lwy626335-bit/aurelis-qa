# AURELIS QA

AURELIS QA is an evidence-first platform for evaluating AI-generated websites. Phase 6 adds comparable history, immutable rubrics, and repeatability experiments to the hybrid evaluation workflow.

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
apps/worker         Evaluation worker
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

## Current phase boundary

Implemented through Phase 6:

- Dark-only design system and self-hosted Geist fonts
- GSAP landing motion with reduced-motion behavior
- Landing page and responsive demo dashboard
- Full core MVP Prisma schema, initial migration, and idempotent demo seed
- Deterministic weighted scoring and reliability functions
- Zod contract for evidence-backed AI evaluator output
- URL preflight that rejects unsafe schemes, credentials, local hosts, and private IP literals
- English/Japanese switch with `Accept-Language` initialization and cookie persistence
- URL or HTML/CSS/JavaScript submission with a one MiB limit
- PostgreSQL evaluation, version metadata, and job records
- Real queued/cancelled states without fabricated progress or scores
- Local PostgreSQL and Nu HTML Checker services
- Atomic job leasing and technical result persistence
- Lighthouse lab, axe, Nu HTML Checker, and deterministic DOM/SEO analysis
- Brand profile, examples, and reference corpus management
- OpenAI Responses API evaluator/reviewer adapter with deterministic evidence anchoring
- Application-owned overall and reliability calculation
- Evidence, recommendations, and suggestion-only AI rewrite reporting
- History, condition-aware comparison, and immutable rubric versions
- Research experiments with deterministic mean, standard deviation, and variance

Not implemented:

- Phase 7 GitHub and PDF integrations

See [architecture](docs/architecture.md), [design system](docs/design-system.md), [security](docs/security.md), and the [Phase 6 verification record](docs/phase-6-verification.md).
