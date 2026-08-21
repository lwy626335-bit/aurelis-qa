# Phase 4 verification

Implemented on 2026-08-21 against the official OpenAI Node SDK Responses API structured-output pattern.

## Implemented

- Brand profile CRUD with target audience, personality, vocabulary, example copy, source URL metadata, and manually supplied reference content
- Corpus eligibility: at least three examples or 300 language-aware word segments
- SHA-256 source hashes and corpus version tracking
- Optional brand selection during evaluation intake
- Server-only OpenAI Responses API adapter using `responses.parse()` and `zodTextFormat()`
- Two independent passes: evaluator and reviewer
- Exact seven-dimension rubric, application-owned brand arithmetic, and evidence-anchor verification against target/reference text
- Brand result, evidence, recommendations, model ID, prompt version, and corpus version persistence
- Target output language follows the submitted content language rather than UI locale
- Technical results remain available when AI evaluation fails

## Verified locally

- Brand validation unit tests
- Browser CRUD flow on desktop and Pixel 7
- Bilingual brand pages and axe release gate
- Structured schemas and TypeScript contracts

## External verification boundary

No `OPENAI_API_KEY` is configured in this environment. A live GPT-5.6 Sol request was therefore not sent. The worker exposes `brand-ai: unavailable`, preserves the technical result, and records `AI_EVALUATION_UNAVAILABLE` instead of inventing a brand score. Set `OPENAI_API_KEY`, `OPENAI_EVALUATION_MODEL`, and the independent display name to run the adapter.
