# Architecture through Phase 2

## Runtime shape

```text
Browser
  -> apps/web (Next.js App Router)
       -> packages/database (Prisma contract and demo fixture)
       -> packages/evaluation (pure scoring and validation contracts)

Evaluation request
  -> PostgreSQL job state
  -> apps/worker
       -> deterministic technical tools in Phase 3
       -> structured brand evaluator in Phase 4
  -> stored evidence, versions, and recommendations
```

The web application is the owner of final score calculation. Technical tools remain authoritative for technical measurements. An AI evaluator may return structured observations and evidence, but cannot overwrite Lighthouse, accessibility, validator, or other deterministic results.

## Data ownership

- `Project` groups websites, brand profiles, evaluations, and experiments.
- `Website` preserves URL or HTML input metadata and input hashes.
- `BrandProfile`, examples, and reference sources form a versioned brand corpus.
- `Rubric` and `RubricDimension` preserve versioned scoring weights.
- `Evaluation` records status, model identifiers, prompt and rubric versions, tool versions, input hash, and failure state.
- Technical and brand results remain separate one-to-one records.
- Evidence, recommendations, and evaluation versions are append-oriented audit records.
- Experiment runs support later repeatability and variance research.
- Auth.js-compatible user, account, session, and verification token tables remain available for future multi-user identity. The current production boundary uses a site-wide Basic Auth credential before routing.

## Route policy

- In local development, `/` and the demo routes remain open for testability.
- In production, Proxy and the API handlers require the configured site-wide Basic Auth credential.
- `/dashboard/evaluations` and its child routes create and inspect real local research records.
- Multi-user identity and per-project authorization remain outside the self-hosted research MVP boundary.

## Worker boundary

`apps/worker` is a persistent process with queue leases, retries, browser isolation, timeouts, redirect validation, DNS resolution checks, and tool-version capture. Its authenticated health endpoint verifies database reachability; production web routes refuse to create queue records when the worker is unavailable.

## Scoring contract

`packages/evaluation` normalizes dimension scores against their maximum values and applies application-owned weights. Reliability is calculated separately from evidence coverage, consistency, tool completeness, and input integrity. Both functions reject invalid ranges and weight sets.
