# Phase 7 verification

Implemented on 2026-08-21.

## Implemented

- Reusable composite GitHub Action submits checked-out HTML to the real evaluation queue
- Example pull-request workflow is `continue-on-error: true` by default and requires only read access to repository contents
- Server-side Playwright PDF export of stored reports
- Descriptive aggregate mean, standard deviation, variance, and status counts
- Bilingual privacy/data disclosure
- Confirmed evaluation deletion with database cascade across job, technical/brand result, evidence, recommendations, versions, and experiment-run links

## Verified

- Action JavaScript syntax and YAML checked locally
- PDF endpoint returns `application/pdf` and a `%PDF` signature
- Browser flow deletes an evaluation and verifies its API returns 404
- Analytics, Privacy, and GitHub pages included in desktop/mobile axe release gates

## Deferred by design

- GitHub App access to private repositories
- PR status-check and comment writeback
- Authentication/multi-tenant authorization for an internet-facing service
- Inferential analytics or causal claims

The Action integration is suitable for a self-hosted research deployment. Do not expose the unauthenticated mutation API to the public internet.
