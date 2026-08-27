import { demoReport } from "@aurelis/database/demo";
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  Code,
  Fingerprint,
  Quotes,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { ButtonLink } from "@/components/ui/button-link";
import { LandingMotion } from "@/components/landing/landing-motion";
import { SiteHeader } from "@/components/landing/site-header";
import type { Dictionary, Locale } from "@/i18n/config";

const pipelineIcons = [Code, Fingerprint, Sparkle, ChartLineUp];

export function LandingPage({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.landing;
  return (
    <LandingMotion>
      <SiteHeader dictionary={dictionary} locale={locale} />
      <main id="main-content">
        <section data-hero className="relative isolate overflow-hidden border-b border-white/[0.07]">
          <div data-ambient className="aurelis-grid pointer-events-none absolute inset-0 -z-10 opacity-55" aria-hidden="true" />
          <div
            className="pointer-events-none absolute right-[-16rem] top-[-20rem] -z-10 size-[48rem] rounded-full bg-[radial-gradient(circle,rgba(214,185,120,0.09),transparent_68%)] blur-3xl"
            aria-hidden="true"
          />
          <div className="aurelis-shell grid gap-14 py-14 md:min-h-[760px] md:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)] md:items-center md:py-20 lg:gap-20">
            <div data-hero-copy className="relative max-w-2xl md:pb-12 lg:pl-[7vw]">
              <span className="pointer-events-none absolute -left-6 top-0 hidden h-44 w-px bg-gradient-to-b from-[var(--accent)]/65 to-transparent lg:block" aria-hidden="true" />
              <p data-hero-eyebrow className="font-mono text-[10px] font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
                {copy.eyebrow}
              </p>
              <h1 data-hero-title className="mt-6 max-w-[10ch] text-balance text-5xl font-medium leading-[0.96] tracking-[-0.06em] text-[var(--text)] sm:text-6xl lg:text-[4.65rem]">
                <span className="block">{copy.heroTitle}</span>
              </h1>
              <p data-hero-description className="mt-7 max-w-[34rem] text-pretty text-base leading-7 text-[var(--text-secondary)] md:text-lg">
                {copy.heroDescription}
              </p>
              <div data-hero-actions className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
                <ButtonLink href="/dashboard/demo">
                  {copy.exploreScore} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                </ButtonLink>
                <Link href="#methodology" className="group inline-flex min-h-11 items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                  {copy.viewMethodology}
                  <ArrowRight aria-hidden="true" className="ml-2 size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div data-hero-rule className="mt-11 flex items-center gap-3 text-[9px] font-medium tracking-[0.14em] text-[var(--text-tertiary)] uppercase">
                <span className="h-px flex-1 origin-left bg-gradient-to-r from-[var(--accent)]/55 via-white/10 to-transparent" />
                <span>{demoReport.metadata.rubric}</span>
              </div>
            </div>

            <article
              data-hero-visual
              aria-label={`${dictionary.snapshot.preview}. ${dictionary.common.demoDataset}.`}
              className="relative mx-auto grid min-h-[520px] w-full max-w-[760px] grid-cols-1 content-center gap-3 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.09] bg-[rgba(11,13,18,0.86)] p-3 shadow-[0_32px_100px_rgba(2,3,6,0.32),inset_0_1px_rgba(255,255,255,0.035)] sm:min-h-[600px] sm:grid-cols-12 sm:grid-rows-12 sm:gap-0 sm:p-6 md:translate-y-4 md:bg-[rgba(11,13,18,0.72)] md:backdrop-blur-sm"
            >
              <div className="fine-grid pointer-events-none absolute inset-0 opacity-55" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_42%,rgba(214,185,120,0.08),transparent_38%)]" aria-hidden="true" />
              <div data-hero-scan className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px bg-[var(--accent)] opacity-0 shadow-[0_0_18px_rgba(214,185,120,0.35)]" aria-hidden="true" />

              <header data-hero-layer className="relative border border-white/[0.09] bg-[rgba(7,8,11,0.88)] p-4 sm:col-span-8 sm:col-start-1 sm:row-span-3 sm:row-start-1 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[var(--text)]">{demoReport.project}</p>
                    <p className="mt-1 font-mono text-[9px] text-[var(--text-tertiary)]">{demoReport.url}</p>
                  </div>
                  <span className="rounded-[6px] border border-[color-mix(in_srgb,var(--accent)_24%,transparent)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] px-2 py-1 font-mono text-[8px] text-[var(--accent)]">
                    {dictionary.common.demoDataset}
                  </span>
                </div>
                <div className="mt-6 flex items-end justify-between border-t border-white/[0.07] pt-4">
                  <p className="text-[10px] text-[var(--text-tertiary)]">{dictionary.snapshot.qualityScore}</p>
                  <p className="mono-number text-5xl font-medium leading-none text-[var(--text)] sm:text-6xl">
                    {demoReport.overallScore}
                  </p>
                </div>
              </header>

              <div data-hero-layer className="relative border border-white/[0.09] bg-[rgba(17,19,24,0.86)] p-4 sm:col-span-7 sm:col-start-6 sm:row-span-4 sm:row-start-4 sm:p-5">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    [dictionary.snapshot.technical, demoReport.scores.technical],
                    [dictionary.snapshot.brand, demoReport.scores.brand],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="mono-number text-3xl text-[var(--text)]">{value}</p>
                      <p className="mt-2 text-[9px] text-[var(--text-tertiary)]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 h-px overflow-hidden bg-white/[0.07]">
                  <span className="block h-full w-[87.6%] bg-[var(--accent)]/70" />
                </div>
                <p className="mt-3 text-[10px] leading-5 text-[var(--text-secondary)]">{dictionary.snapshot.technicalTruth}</p>
              </div>

              <div data-hero-layer className="relative border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[rgba(214,185,120,0.055)] p-4 sm:col-span-7 sm:col-start-2 sm:row-span-4 sm:row-start-8 sm:p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--accent)] uppercase">{dictionary.snapshot.reliability}</p>
                  <p className="mono-number text-3xl text-[var(--text)]">{demoReport.scores.reliability}<span className="text-sm text-[var(--text-tertiary)]">%</span></p>
                </div>
                <div className="mt-6 grid grid-cols-[auto_1fr] gap-4 border-t border-white/[0.08] pt-4">
                  <span className="mono-number text-2xl text-[var(--accent)]">0{demoReport.issues.length}</span>
                  <p className="text-[10px] leading-5 text-[var(--text-secondary)]">{dictionary.snapshot.findings}</p>
                </div>
              </div>

              <div data-hero-axis className="pointer-events-none absolute bottom-5 right-5 hidden items-center gap-2 font-mono text-[8px] tracking-[0.16em] text-[var(--text-tertiary)] uppercase sm:flex" aria-hidden="true">
                <span className="block h-px w-8 bg-white/[0.16]" />
                Evidence / score
              </div>
            </article>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-white/[0.07] py-16 md:py-24">
          <div className="aurelis-shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(520px,1.2fr)] lg:gap-24">
            <div data-reveal className="max-w-xl lg:pt-9">
              <p className="font-mono text-[9px] tracking-[0.18em] text-[var(--accent)] uppercase">01 — 05</p>
              <h2 className="mt-5 text-balance text-4xl font-medium tracking-[-0.045em] text-[var(--text)] md:text-6xl">
                {copy.qualityTitle}
              </h2>
              <p className="mt-6 max-w-[46ch] text-base leading-7 text-[var(--text-secondary)] md:text-lg md:leading-8">
                {copy.qualityBody}
              </p>
            </div>
            <div className="relative lg:mt-0">
              <span data-principle-line aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px origin-top bg-[var(--accent)]/75" />
              <ol aria-label={copy.qualityTitle} data-principles className="border-y border-white/[0.09]">
                {copy.principles.map((principle, index) => (
                  <li
                    key={principle}
                    data-principle
                    className={`${index === 2 ? "bg-[rgba(214,185,120,0.045)]" : ""} grid min-h-20 grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-white/[0.07] px-4 last:border-b-0 sm:min-h-24 sm:grid-cols-[4rem_1fr_auto] sm:px-6 ${index % 2 === 1 ? "lg:ml-10" : ""}`}
                  >
                    <span className="mono-number text-sm text-[var(--text-tertiary)]">0{index + 1}</span>
                    <p className="text-base font-medium tracking-[-0.02em] text-[var(--text)] sm:text-lg">{principle}</p>
                    <span aria-hidden="true" className="h-px w-5 bg-white/[0.15] sm:w-8" />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="methodology" className="py-16 md:py-24">
          <div className="aurelis-shell">
            <div data-reveal className="max-w-3xl">
              <h2 className="text-balance text-4xl font-medium tracking-[-0.045em] text-[var(--text)] md:text-6xl">
                {copy.methodTitle}
              </h2>
              <p className="mt-5 max-w-[58ch] text-base leading-7 text-[var(--text-secondary)]">
                {copy.methodBody}
              </p>
            </div>

            <ol data-methodology className="relative mt-10 grid overflow-hidden border-y border-white/[0.09] lg:grid-cols-4">
              <span data-method-line aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-px origin-left bg-[var(--accent)] lg:block" />
              {copy.pipeline.map(([label, detail], index) => {
                const Icon = pipelineIcons[index];
                return (
                  <li data-method-step key={label} className="group relative grid grid-cols-[auto_1fr] gap-4 border-b border-white/[0.07] py-5 last:border-b-0 lg:block lg:min-h-48 lg:border-b-0 lg:border-l lg:px-5 lg:py-6 lg:first:border-l-0">
                    <div className="flex items-center gap-3 lg:block">
                      <span className="font-mono text-[9px] text-[var(--text-tertiary)]">0{index + 1}</span>
                      <Icon aria-hidden="true" className="mt-0 size-5 text-[var(--accent)] lg:mt-5 lg:size-6" weight="light" />
                    </div>
                    <div className="lg:absolute lg:inset-x-5 lg:bottom-6">
                      <h3 className="text-lg font-medium text-[var(--text)]">{label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[var(--surface)] py-14 md:py-20">
          <div className="aurelis-shell grid overflow-hidden border-y border-white/[0.08] lg:grid-cols-[1.2fr_0.8fr] lg:divide-x lg:divide-white/[0.08]">
            <div data-score-panel className="border-b border-white/[0.08] py-7 lg:border-b-0 lg:p-8">
              <p className="font-mono text-[10px] text-[var(--text-tertiary)]">TECHNICAL QUALITY</p>
              <p className="mono-number mt-6 text-6xl font-medium text-[var(--text)] md:text-7xl">91</p>
              <h2 className="mt-6 text-2xl font-medium tracking-[-0.03em]">{copy.technicalTitle}</h2>
              <p className="mt-3 max-w-[48ch] text-sm leading-7 text-[var(--text-secondary)]">
                {copy.technicalBody}
              </p>
            </div>

            <div data-score-panel className="flex flex-col justify-between gap-8 bg-[rgba(214,185,120,0.035)] py-7 lg:p-8">
              <div>
                <p className="font-mono text-[10px] text-[var(--accent)]">BRAND VOICE</p>
                <p className="mono-number mt-6 text-6xl font-medium text-[var(--text)] md:text-7xl">82</p>
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em]">{copy.brandTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {copy.brandBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="evidence" className="py-16 md:py-24">
          <div className="aurelis-shell grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div data-reveal className="lg:sticky lg:top-28">
              <ShieldCheck aria-hidden="true" className="size-8 text-[var(--accent)]" weight="light" />
              <h2 className="mt-7 text-balance text-4xl font-medium tracking-[-0.045em] md:text-5xl">{copy.evidenceTitle}</h2>
              <p className="mt-5 max-w-[40ch] text-base leading-7 text-[var(--text-secondary)]">
                {copy.evidenceBody}
              </p>
            </div>

            <div data-reveal className="panel-flat overflow-hidden">
              <div className="border-b border-white/[0.07] p-5 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{copy.toneConsistency}</p>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.brandEvaluation}</p>
                  </div>
                  <p className="mono-number text-3xl">18<span className="text-sm text-[var(--text-tertiary)]"> / 20</span></p>
                </div>
              </div>
              <dl className="grid md:grid-cols-2">
                <div className="border-b border-white/[0.07] p-5 md:border-r md:p-7">
                  <dt className="font-mono text-[10px] text-[var(--accent)]">{copy.evidence}</dt>
                  <dd className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {copy.evidenceText}
                  </dd>
                </div>
                <div className="border-b border-white/[0.07] p-5 md:p-7">
                  <dt className="font-mono text-[10px] text-[var(--accent)]">{copy.reason}</dt>
                  <dd className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {copy.reasonText}
                  </dd>
                </div>
                <div className="p-5 md:border-r md:p-7">
                  <dt className="font-mono text-[10px] text-[var(--accent)]">{copy.recommendation}</dt>
                  <dd className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {copy.recommendationText}
                  </dd>
                </div>
                <div className="bg-white/[0.018] p-5 md:p-7">
                  <dt className="font-mono text-[10px] text-[var(--accent)]">{copy.evidenceStrength}</dt>
                  <dd className="mt-4 flex items-center gap-2 text-sm text-[var(--text)]">
                    <CheckCircle aria-hidden="true" className="size-4 text-[var(--success)]" weight="fill" /> {copy.strong}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[rgba(255,255,255,0.018)] py-16 md:py-20">
          <div className="aurelis-shell">
            <div data-reveal className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
              <div>
                <Quotes aria-hidden="true" className="size-7 text-[var(--accent)]" weight="fill" />
                <h2 className="mt-6 text-3xl font-medium tracking-[-0.04em] md:text-4xl">{copy.researchTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                  {copy.researchBody}
                </p>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Model", demoReport.metadata.modelId],
                  ["Prompt", demoReport.metadata.promptVersion],
                  ["Input hash", demoReport.metadata.inputHash],
                  ["Reliability", `${demoReport.scores.reliability}%`],
                ].map(([label, value]) => (
                  <div className="min-w-0 bg-[var(--surface)] p-4" key={label}>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
                    <p className="mt-3 truncate font-mono text-xs text-[var(--text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.07] py-20 md:py-28">
          <div data-reveal className="aurelis-shell text-center">
            <h2 className="mx-auto max-w-[13ch] text-balance text-5xl font-medium leading-[1.02] tracking-[-0.055em] md:text-7xl">
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-[40ch] text-base leading-7 text-[var(--text-secondary)]">
              {copy.ctaBody}
            </p>
            <ButtonLink href="/dashboard/demo" className="mt-8">
              {dictionary.common.openDemo} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] py-8">
        <div className="aurelis-shell flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <AurelisMark />
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">{copy.footerTagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--text-tertiary)]">
            <Link href="#methodology" className="hover:text-[var(--text)]">{copy.nav[0][0]}</Link>
            <Link href="/dashboard/research" className="hover:text-[var(--text)]">{copy.nav[2][0]}</Link>
            <Link href="/dashboard/documentation" className="hover:text-[var(--text)]">{copy.documentation}</Link>
            <Link href="/dashboard/privacy" className="hover:text-[var(--text)]">{copy.privacy}</Link>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </LandingMotion>
  );
}
