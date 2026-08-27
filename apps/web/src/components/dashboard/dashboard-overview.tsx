import { demoReport } from "@aurelis/database/demo";
import { ArrowRight, ArrowUpRight, CaretRight, CheckCircle, Clock, Info, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ScoreGauge } from "@/components/data/score-gauge";
import { CopyMetadata } from "@/components/dashboard/copy-metadata";
import { getDemoContent } from "@/components/dashboard/demo-content";
import { DashboardOverviewMotion } from "@/components/dashboard/dashboard-overview-motion";
import { QualityDimensions, QualityTrend } from "@/components/dashboard/quality-charts";
import { ButtonLink } from "@/components/ui/button-link";
import { localeCode, type Dictionary, type Locale } from "@/i18n/config";
import { formatScore } from "@/lib/utils";

const severityTone = {
  Critical: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  High: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  Medium: "text-[var(--warning)] bg-[rgba(232,196,107,0.07)] border-[rgba(232,196,107,0.17)]",
  Low: "text-[var(--text-secondary)] bg-white/[0.035] border-white/[0.08]",
};

export function DashboardOverview({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.dashboard;
  const content = getDemoContent(locale);
  const evaluatedAt = new Intl.DateTimeFormat(localeCode(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(demoReport.evaluatedAt));
  const metadata = [
    [content.auditStatus, content.notRun],
    [content.datasetVersion, demoReport.metadata.datasetVersion],
    [content.model, demoReport.metadata.modelId],
    [content.prompt, demoReport.metadata.promptVersion],
    [content.rubric, demoReport.metadata.rubric],
    [content.corpus, demoReport.metadata.referenceCorpusVersion],
    [content.weights, `${copy.technical} 60% · ${copy.brand} 40%`],
    [content.reliabilityParts, Object.values(demoReport.metadata.reliabilityComponents).join(" / ")],
    [content.inputHash, demoReport.metadata.inputHash],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-7 md:py-8">
      <DashboardOverviewMotion>
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-demo-header>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
              <span>{copy.projects}</span><CaretRight aria-hidden="true" className="size-3" /><span>{content.project}</span>
            </div>
            <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] md:text-4xl">{copy.overviewTitle}</h1>
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Clock aria-hidden="true" className="size-3.5" /> {evaluatedAt} UTC
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="interactive-control rounded-[var(--radius-control)] px-1 py-2 text-xs text-[var(--text-secondary)] underline decoration-white/20 underline-offset-4 hover:text-[var(--text)]" href="#score-method">
              {content.viewMethod}
            </Link>
            <ButtonLink href="/dashboard/evaluations/new">
              {content.runEvaluation} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </header>

        <aside className="mt-7 flex items-start gap-3 border-y border-[rgba(214,185,120,0.17)] bg-[rgba(214,185,120,0.035)] px-4 py-3.5 text-xs leading-5 text-[var(--text-secondary)]" data-demo-mode>
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
          <p><strong className="font-medium text-[var(--text)]">{content.modeLabel}.</strong> {content.modeBody}</p>
        </aside>

        <section aria-labelledby="score-summary" className="mt-7 grid gap-5 xl:grid-cols-12">
          <article className="panel dashboard-grid-surface relative overflow-hidden p-5 md:p-7 xl:col-span-5" data-score-summary>
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.14em] text-[var(--accent)] uppercase">{content.resultEyebrow}</p>
                  <h2 id="score-summary" className="mt-3 text-lg font-medium">{copy.overall}</h2>
                </div>
                <span className="rounded-[6px] border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] text-[var(--text-secondary)]">{copy.grade} {demoReport.grade}</span>
              </div>
              <p className="mt-4 max-w-[46ch] text-sm leading-6 text-[var(--text-secondary)]">{content.resultSummary}</p>

              <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <ScoreGauge className="size-44 md:size-48" label={dictionary.snapshot.qualityScore} outOf={dictionary.snapshot.outOf} score={demoReport.overallScore} size="compact" />
                <div className="min-w-0 flex-1 border-t border-white/[0.08] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <p className="font-mono text-[10px] text-[var(--text-tertiary)]">{content.formulaLabel}</p>
                  <p className="mono-number mt-2 text-lg text-[var(--text)]">{content.formula}</p>
                  <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">{content.gradeMeaning}</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 border-t border-white/[0.08]">
                {[
                  [copy.technical, demoReport.scores.technical],
                  [copy.brand, demoReport.scores.brand],
                ].map(([label, score]) => (
                  <div className="py-5 first:border-r first:border-white/[0.08] first:pr-4 last:pl-4" key={String(label)}>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
                    <p className="mono-number mt-2 text-3xl">{formatScore(Number(score), 1)}</p>
                  </div>
                ))}
                <div className="col-span-2 flex items-center justify-between gap-4 border-t border-white/[0.08] py-4">
                  <div>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{copy.reliability}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{content.reliabilityBody}</p>
                  </div>
                  <p className="mono-number flex items-center gap-2 text-2xl"><CheckCircle aria-hidden="true" className="size-4 text-[var(--success)]" weight="fill" />{demoReport.scores.reliability}%</p>
                </div>
              </div>
            </div>
          </article>

          <article className="border-y border-white/[0.095] xl:col-span-7">
            <div className="flex items-end justify-between gap-4 px-1 py-5 md:px-6">
              <div>
                <p className="font-mono text-[9px] tracking-[0.14em] text-[var(--accent)] uppercase">{content.priorityAction}</p>
                <h2 className="mt-2 text-xl font-medium">{copy.findings}</h2>
                <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{content.findingsBody}</p>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{demoReport.issues.length} {copy.openFindings}</span>
            </div>
            <ol className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
              {content.issues.map((issue, index) => (
                <li data-priority-finding key={issue.id}>
                  <Link className="interactive-row group grid gap-4 px-1 py-5 md:grid-cols-[36px_1fr_auto] md:px-6" href={`/dashboard/demo/findings/${issue.id}`}>
                    <span className="font-mono text-xs text-[var(--text-tertiary)]">0{index + 1}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-[6px] border px-2 py-1 font-mono text-[9px] ${severityTone[issue.severity]}`}>{issue.severityLabel}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">{issue.dimensionLabel}</span>
                      </div>
                      <h3 className="mt-3 text-sm font-medium leading-6 text-[var(--text)] md:text-base">{issue.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{issue.evidence}</p>
                    </div>
                    <span className="grid size-11 place-items-center self-center rounded-[var(--radius-control)] border border-white/[0.08] text-[var(--text-tertiary)] transition-colors group-hover:border-white/20 group-hover:text-[var(--accent)]" aria-label={`${content.openFinding}: ${issue.title}`}>
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-4 border-t border-white/[0.07] px-1 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{content.runEvaluation}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{demoReport.url}</p>
              </div>
              <ButtonLink href="/dashboard/evaluations/new">{content.runEvaluation}<ArrowRight aria-hidden="true" className="ml-2 size-4" /></ButtonLink>
            </div>
          </article>
        </section>

        <section className="mt-5 grid border-y border-white/[0.08] sm:grid-cols-2 xl:grid-cols-4" data-demo-section id="score-method">
          {[
            [content.auditStatus, content.notRun],
            [content.formulaLabel, "60 / 40"],
            [content.datasetVersion, demoReport.metadata.datasetVersion],
            [content.delta, `+${demoReport.scoreDelta}`],
          ].map(([label, value], index) => (
            <div className="min-w-0 border-b border-white/[0.07] px-4 py-4 last:border-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0" key={label}>
              <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
              <p className={`mt-2 truncate ${index === 1 || index === 3 ? "mono-number text-lg text-[var(--text)]" : "font-mono text-[11px] text-[var(--text-secondary)]"}`}>{value}</p>
              {index === 3 && <p className="mt-2 text-[10px] leading-4 text-[var(--text-tertiary)]">{content.deltaBody}</p>}
            </div>
          ))}
        </section>

        <section className="mt-12" data-demo-section>
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-[var(--accent)] uppercase">{content.analysisEyebrow}</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em]">{content.dimensionsTitle}</h2>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-12">
            <article className="panel-flat p-5 md:p-6 xl:col-span-5">
              <h3 className="text-sm font-medium">{content.dimensionsTitle}</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{content.dimensionsBody}</p>
              <QualityDimensions data={content.dimensions} locale={locale} />
            </article>
            <article className="panel-flat overflow-hidden p-5 md:p-6 xl:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">{content.distributionTitle}</h3>
                  <p className="mt-2 max-w-[58ch] text-xs leading-5 text-[var(--text-tertiary)]">{content.distributionBody}</p>
                </div>
                <p className="mono-number text-2xl">{formatScore(demoReport.overallScore, 1)}</p>
              </div>
              <QualityTrend data={content.trend} locale={locale} />
            </article>
          </div>
        </section>

        <section className="mt-5" data-demo-section>
          <details className="group border-y border-white/[0.08]" id="provenance">
            <summary className="interactive-control flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 px-1 py-4 marker:content-none md:px-6">
              <div>
                <h2 className="text-sm font-medium">{content.provenanceTitle}</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{content.provenanceBody}</p>
              </div>
              <ShieldCheck aria-hidden="true" className="size-5 shrink-0 text-[var(--accent)]" />
            </summary>
            <dl className="grid border-t border-white/[0.07] md:grid-cols-2">
              {metadata.map(([label, value]) => (
                <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.06] px-1 py-3 last:border-0 md:px-6 md:odd:border-r" key={label}>
                  <div className="min-w-0">
                    <dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt>
                    <dd className="mt-1 break-all font-mono text-[11px] leading-5 text-[var(--text-secondary)]">{value}</dd>
                  </div>
                  <CopyMetadata copiedLabel={content.copied} label={content.copyValue} value={value} />
                </div>
              ))}
            </dl>
          </details>
        </section>

        <section className="mt-12 border-t border-white/[0.09]" aria-labelledby="sample-history" data-demo-section>
          <div className="flex items-end justify-between gap-4 py-5">
            <div>
              <h2 id="sample-history" className="text-lg font-medium">{content.sampleHistory}</h2>
              <p className="mt-2 max-w-[65ch] text-xs leading-5 text-[var(--text-tertiary)]">{content.sampleHistoryBody}</p>
            </div>
          </div>
          <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06] md:hidden">
            {content.recent.map((evaluation) => (
              <li className="grid grid-cols-[1fr_auto] gap-3 py-4" key={evaluation.id}>
                <div className="min-w-0"><p className="text-sm font-medium">{evaluation.targetLabel}</p><p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{evaluation.dateLabel} · {content.sample}</p></div>
                <span className="mono-number text-xl">{formatScore(evaluation.score, 1)}</span>
              </li>
            ))}
          </ul>
          <table className="hidden w-full border-collapse text-left md:table">
            <caption className="sr-only">{content.sampleHistoryBody}</caption>
            <thead className="border-y border-white/[0.06] text-[10px] text-[var(--text-tertiary)]"><tr><th className="px-2 py-3 font-normal">{content.target}</th><th className="px-2 py-3 font-normal">{content.date}</th><th className="px-2 py-3 font-normal">{content.score}</th><th className="px-2 py-3 font-normal">{content.status}</th></tr></thead>
            <tbody className="divide-y divide-white/[0.05]">{content.recent.map((evaluation) => <tr key={evaluation.id}><th className="px-2 py-4 text-xs font-medium">{evaluation.targetLabel}</th><td className="px-2 py-4 text-xs text-[var(--text-tertiary)]">{evaluation.dateLabel}</td><td className="mono-number px-2 py-4 text-base">{formatScore(evaluation.score, 1)}</td><td className="px-2 py-4 text-xs text-[var(--text-secondary)]">{content.sample}</td></tr>)}</tbody>
          </table>
        </section>
      </DashboardOverviewMotion>
    </main>
  );
}
