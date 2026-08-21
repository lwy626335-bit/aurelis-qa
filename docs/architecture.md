# Phase 1 architecture

## Runtime shape

```text
Browser
  -> apps/web (Next.js App Router)
       -> packages/database (Prisma contract and demo fixture)
       -> packages/evaluation (pure scoring and validation contracts)

Future evaluation request
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
- Auth.js-compatible user, account, session, and verification token tables are present, but authentication behavior is deferred to Phase 2.

## Route policy

- `/` is public.
- `/dashboard` is a public, read-only demonstration in Phase 1.
- Future routes render an explicit phase status. They do not simulate a successful API response.
- Authentication and workspace authorization arrive before mutable project data is enabled.

## Worker boundary

`apps/worker` currently exposes a typed capability manifest. Every heavy evaluator is marked `not-implemented` with its target phase. Phase 3 will add queue ownership, browser isolation, timeouts, redirect validation, DNS resolution checks, tool version capture, and bounded artifact retention.

## Scoring contract

`packages/evaluation` normalizes dimension scores against their maximum values and applies application-owned weights. Reliability is calculated separately from evidence coverage, consistency, tool completeness, and input integrity. Both functions reject invalid ranges and weight sets.
