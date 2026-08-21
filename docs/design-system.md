# Design system

## Direction

AURELIS uses a calm, premium, evidence-first dark data-intelligence language. The landing page is cinematic and spacious. The dashboard is denser and analytical. Both surfaces share the same tokens and reusable score visualization.

Design dials used for Phase 1:

- Variance: 7 of 10
- Motion: 5 of 10
- Density: 6 of 10

## Foundations

- Font: self-hosted Geist Sans and Geist Mono through `next/font/local` via the Geist package
- Background: near-black neutral surfaces, not a tinted purple canvas
- Primary accent: restrained warm gold
- AI semantic accent: violet, limited to brand interpretation values
- Status accents: green, amber, and red only for meaning
- Radius: 9px controls, 12px cards, 16px large surfaces
- Shadows: reserved for elevated panels, not every container
- Layout: bounded shell with asymmetric compositions and strong section rhythm

The raised tertiary text token is `#858893`, verified by axe against the dashboard surfaces at WCAG AA small-text contrast.

## Motion

GSAP is scoped to the landing page. `useGSAP` owns setup and cleanup, `ScrollTrigger` is used only for composed section reveals and a subtle desktop ambient scrub, and `gsap.matchMedia()` provides a reduced-motion path. The dashboard disables chart entrance animation to improve information stability and screenshot reproducibility.

No continuous scroll listener is used. Native CSS handles hover and control transitions.

## Accessibility

- Semantic landmarks and heading order
- Skip link on the public page
- Native `details` mobile navigation that works before React hydration
- Descriptive names for icon-only controls
- Text alternatives for radar and trend data
- Focusable horizontally scrolling table region on small screens
- Reduced-motion coverage in CSS, GSAP, and automated tests
- Serious and critical axe violations treated as release blockers
