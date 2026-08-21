# Phase 2 verification

Verified on 2026-08-21 with Node.js 24, pnpm 11.19.0, Next.js 16.3.1, Prisma 7.9.1, PostgreSQL 17, and the current official Nu HTML Checker container.

## Implemented

- English/Japanese UI selected from `Accept-Language`, persisted in an HTTP-only locale cookie, and switchable without locale-prefixed routes
- Self-hosted Noto Sans JP and locale-aware date formatting
- URL and pasted HTML/CSS/JavaScript input, target-content language, validation, hashing, and a one MiB combined limit
- Real PostgreSQL project, website, evaluation, immutable version metadata, and queue job records
- Queue state inspection and cancellation; no fixed timer, fabricated progress, or fabricated score
- Docker Compose PostgreSQL and Nu HTML Checker services

## Passed

- PostgreSQL migration `20260821080702_phase2_evaluation_jobs` applied to the live local database
- Idempotent seed executed twice
- PostgreSQL and Nu HTML Checker containers reported healthy
- `pnpm db:generate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`: 17 tests across the worker, evaluation contracts, and web application
- `pnpm build`
- `pnpm test:e2e`: 13 passed, one expected desktop skip
- Browser integration created, persisted, inspected, and cancelled real queue records on desktop and Pixel 7
- English/Japanese switch and persistence verified on desktop and mobile
- axe reported zero serious or critical WCAG 2 A/AA violations on the landing, dashboard, and new-evaluation routes

## Explicitly unavailable

Phase 2 does not consume queue jobs. Technical evaluation is unavailable until Phase 3 and brand evaluation until Phase 4, so component and overall scores remain unavailable for new submissions.
