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
import { QualitySnapshot } from "@/components/data/quality-snapshot";
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
          <div data-ambient className="aurelis-grid pointer-events-none absolute inset-0 -z-10 opacity-75" aria-hidden="true" />
          <div
            className="pointer-events-none absolute right-[-14rem] top-[-18rem] -z-10 size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(214,185,120,0.10),transparent_66%)] blur-2xl"
            aria-hidden="true"
          />
          <div className="aurelis-shell grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-12 md:grid-cols-[minmax(0,0.88fr)_minmax(420px,1.12fr)] md:py-16">
            <div data-hero-copy className="max-w-2xl">
              <p data-motion className="font-mono text-[11px] font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
                {copy.eyebrow}
              </p>
              <h1 data-motion className="mt-5 max-w-[11ch] text-balance text-5xl font-medium leading-[0.98] tracking-[-0.055em] text-[var(--text)] sm:text-6xl lg:text-[4.7rem]">
                {copy.heroTitle}
              </h1>
              <p data-motion className="mt-6 max-w-[36rem] text-pretty text-base leading-7 text-[var(--text-secondary)] md:text-lg">
                {copy.heroDescription}
              </p>
              <div data-motion className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/dashboard">
                  {dictionary.common.openDemo} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                </ButtonLink>
                <ButtonLink href="#methodology" tone="secondary">
                  {copy.viewMethodology}
                </ButtonLink>
              </div>
              <div data-hero-rule className="mt-10 h-px w-full bg-gradient-to-r from-[var(--accent)]/50 via-white/10 to-transparent" />
            </div>

            <div data-hero-visual data-motion className="relative mx-auto w-full max-w-[720px] md:translate-y-4">
              <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle,rgba(140,140,255,0.055),transparent_68%)]" aria-hidden="true" />
              <QualitySnapshot dictionary={dictionary} />
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.07] py-20 md:py-28">
          <div className="aurelis-shell">
            <div data-reveal className="max-w-4xl">
              <h2 className="text-balance text-4xl font-medium tracking-[-0.045em] text-[var(--text)] md:text-6xl">
                {copy.qualityTitle}
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-8 text-[var(--text-secondary)]">
                {copy.qualityBody}
              </p>
            </div>
            <div data-reveal className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-5">
              {copy.principles.map((principle, index) => (
                <div
                  key={principle}
                  className={`${index === 0 || index === 3 ? "bg-[rgba(214,185,120,0.055)]" : "bg-[var(--surface)]"} min-h-36 p-5`}
                >
                  <span className="mono-number text-2xl text-[var(--text-tertiary)]">0{index + 1}</span>
                  <p className="mt-10 text-sm font-medium text-[var(--text)]">{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="methodology" className="py-20 md:py-32">
          <div className="aurelis-shell">
            <div data-reveal className="max-w-3xl">
              <h2 className="text-balance text-4xl font-medium tracking-[-0.045em] text-[var(--text)] md:text-6xl">
                {copy.methodTitle}
              </h2>
              <p className="mt-5 max-w-[58ch] text-base leading-7 text-[var(--text-secondary)]">
                {copy.methodBody}
              </p>
            </div>

            <ol data-reveal className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {copy.pipeline.map(([label, detail], index) => {
                const Icon = pipelineIcons[index];
                return (
                  <li key={label} className="group relative min-h-52 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.025] p-5">
                    <Icon aria-hidden="true" className="size-6 text-[var(--accent)]" weight="light" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-lg font-medium text-[var(--text)]">{label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--accent)]/70 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-x-100" />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[var(--surface)] py-20 md:py-28">
          <div className="aurelis-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div data-reveal className="rounded-[var(--radius-card)] border border-white/[0.08] bg-[var(--background)] p-6 md:p-9">
              <p className="font-mono text-[10px] text-[var(--text-tertiary)]">TECHNICAL QUALITY</p>
              <p className="mono-number mt-8 text-7xl font-medium text-[var(--text)] md:text-8xl">91</p>
              <h2 className="mt-8 text-2xl font-medium tracking-[-0.03em]">{copy.technicalTitle}</h2>
              <p className="mt-3 max-w-[48ch] text-sm leading-7 text-[var(--text-secondary)]">
                {copy.technicalBody}
              </p>
            </div>

            <div data-reveal className="flex flex-col justify-between gap-12 rounded-[var(--radius-card)] border border-[rgba(140,140,255,0.16)] bg-[rgba(140,140,255,0.045)] p-6 md:p-9">
              <div>
                <p className="font-mono text-[10px] text-[#aaaaff]">BRAND VOICE</p>
                <p className="mono-number mt-8 text-7xl font-medium text-[var(--text)] md:text-8xl">82</p>
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

        <section id="evidence" className="py-20 md:py-32">
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

        <section className="border-y border-white/[0.07] bg-[rgba(255,255,255,0.018)] py-20 md:py-28">
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

        <section className="py-20 md:py-32">
          <div className="aurelis-shell">
            <div data-reveal className="mx-auto max-w-5xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-medium tracking-[-0.04em] md:text-5xl">{copy.seeSystem}</h2>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{dictionary.common.demoDataset}. {copy.noLiveAudit}</p>
                </div>
                <ButtonLink href="/dashboard" tone="secondary">
                  {copy.openDashboard} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                </ButtonLink>
              </div>
              <QualitySnapshot compact dictionary={dictionary} />
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.07] py-24 md:py-36">
          <div data-reveal className="aurelis-shell text-center">
            <h2 className="mx-auto max-w-[13ch] text-balance text-5xl font-medium leading-[1.02] tracking-[-0.055em] md:text-7xl">
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-[40ch] text-base leading-7 text-[var(--text-secondary)]">
              {copy.ctaBody}
            </p>
            <ButtonLink href="/dashboard" className="mt-8">
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
