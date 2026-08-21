# Security baseline

Phase 1 establishes contracts without enabling live remote evaluation.

## Implemented

- Security headers in `next.config.ts`: content type protection, frame denial, referrer policy, permissions policy, and conservative cross-origin policies
- Environment template contains no real credentials
- URL preflight accepts only HTTP and HTTPS, rejects embedded credentials, loopback names, metadata names, private IPv4 ranges, local IPv6 ranges, and multicast or reserved IPv4 literals
- HTML, URLs, hashes, evidence, and tool outputs have distinct storage fields
- Evaluation failures have machine-readable code and user-safe message fields
- Future routes never return fabricated success states

## Required before Phase 3

String validation is not a complete SSRF defense. The worker must resolve DNS, validate every resolved address, pin or revalidate connections, re-run checks after every redirect, bound response size and duration, isolate browser execution, and deny access to cloud metadata and private networks at the network layer.

Live HTML must be treated as hostile input. Captured content must not execute inside the main application origin. Artifacts require content-type enforcement, retention limits, and authorization checks.
