# Security baseline

The self-hosted research application separates untrusted input from the product origin and keeps secrets server-side.

## Implemented

- Security headers in `next.config.ts`: content type protection, frame denial, referrer policy, permissions policy, and conservative cross-origin policies
- Environment template contains no real credentials
- Production requests fail closed unless a site-wide Basic Auth password of at least 16 characters is configured
- API route handlers repeat the authentication check at the data boundary, and cross-origin mutation requests are rejected
- Queue-producing APIs require an authenticated healthy worker before creating jobs in production
- URL preflight accepts only HTTP and HTTPS, rejects embedded credentials, loopback names, metadata names, private IPv4 ranges, local IPv6 ranges, and multicast or reserved IPv4 literals
- HTML, URLs, hashes, evidence, and tool outputs have distinct storage fields
- Evaluation failures have machine-readable code and user-safe message fields
- Future routes never return fabricated success states

## Remote URL boundary

String validation alone is not an SSRF defense. The worker resolves DNS, validates every resolved address, repeats validation after redirects, and bounds response size and duration. It does not execute embedded remote resources; full live-resource evaluation requires network-layer isolation and connection pinning.

Pasted JavaScript is not executed. HTML snapshots run with scripts removed and a deny-by-default Content Security Policy on a loopback-only ephemeral origin. URL documents are fetched with scheme, credential, DNS/IP, redirect, content-type, size, and timeout checks; embedded resources are not executed, so live performance is explicitly unavailable for URL snapshots.

The production boundary now provides site-wide Basic Auth and origin enforcement for a single trusted research team. Multi-tenant deployment still requires per-user sessions, project authorization, distributed rate limits, an authenticated GitHub submission token, and independently verified worker network isolation. Do not treat the shared credential as multi-user isolation.
