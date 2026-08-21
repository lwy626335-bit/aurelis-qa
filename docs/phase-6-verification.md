# Phase 6 verification

Implemented on 2026-08-21.

## Implemented

- Database-backed evaluation history
- Two-evaluation comparison with explicit same/different condition labels
- Immutable rubric creation with unique versions and weights constrained to total 1.0
- Research experiments with 1–10 cloned queued runs (UI default: 3)
- Input hash, model ID, prompt version, rubric version, corpus version, weight set, and tool versions remain attached to evaluations
- Population mean, standard deviation, and variance calculated by deterministic application code

## Interpretation

Statistics are displayed only for completed run scores. No causal or significance claim is generated from small samples. Different evaluation conditions are labeled rather than silently compared as equivalent.
