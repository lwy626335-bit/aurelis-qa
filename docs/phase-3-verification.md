# Phase 3 verification

Verified on 2026-08-21 with Lighthouse 13.4.1, axe-core 4.13.0, parse5 8.0.0, Playwright 1.62.1, and a healthy local Nu HTML Checker.

## Implemented

- PostgreSQL queue leasing with `FOR UPDATE SKIP LOCKED`, a two-minute lease, one worker concurrency, and two attempts
- Pasted HTML snapshots with script removal and a deny-by-default Content Security Policy
- Lighthouse lab categories and FCP/LCP/TBT/CLS/Speed Index capture
- axe automated accessibility results, Nu HTML Checker JSON, and parse5 DOM/SEO checks
- Deterministic application-owned technical score calculation and raw result persistence
- URL document fetch with scheme, credential, DNS/IP, redirect, content-type, timeout, and size checks
- URL embedded resources are not executed; live performance remains explicitly unavailable rather than inferred from a secured static snapshot
- Technical result dashboard and bilingual evaluation detail

## Verified

- Real queue record leased and completed
- Real HTML input audited by all four tools and persisted, then the isolated smoke fixture was deleted
- Smoke result: Technical 99.1, Performance 100, Accessibility 100, SEO 95.5, HTML 100
- Tool versions persisted with evaluation scope metadata

## Boundary

Automated accessibility checks do not certify WCAG conformance. Manual review remains required. URL live-resource execution is deferred until the worker has independently verifiable network isolation; this prevents Lighthouse or submitted JavaScript from bypassing SSRF controls.
