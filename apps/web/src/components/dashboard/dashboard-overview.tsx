import { demoReport } from "@aurelis/database/demo";
import {
  ArrowRight,
  ArrowUpRight,
  CaretRight,
  CheckCircle,
  Clock,
  Info,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ScoreGauge } from "@/components/data/score-gauge";
import { ButtonLink } from "@/components/ui/button-link";
import { formatScore } from "@/lib/utils";
import { QualityRadar, QualityTrend } from "@/components/dashboard/quality-charts";
import type { Dictionary, Locale } from "@/i18n/config";

const severityTone = {
  Critical: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  High: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  Medium: "text-[var(--warning)] bg-[rgba(232,196,107,0.07)] border-[rgba(232,196,107,0.17)]",
  Low: "text-[var(--text-secondary)] bg-white/[0.035] border-white/[0.08]",
};

export function DashboardOverview({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.dashboard;
  const metricCards = [
    { label: copy.technical, value: demoReport.scores.technical, detail: copy.previousDelta, tone: "default" },
    { label: copy.brand, value: demoReport.scores.brand, detail: copy.previousDelta, tone: "ai" },
    { label: copy.reliability, value: demoReport.scores.reliability, detail: copy.strongEvidence, tone: "success", suffix: "%" },
  ];
  const evaluatedAt = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(demoReport.evaluatedAt));

  return (
    <main className="mx-auto w-full max-w-[1560px] px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span>{copy.projects}</span><CaretRight aria-hidden="true" className="size-3" /><span>{demoReport.project}</span>
          </div>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] md:text-4xl">{copy.overviewTitle}</h1>
          <p className="mt-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Clock aria-hidden="true" className="size-3.5" /> {evaluatedAt} UTC
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/evaluations" tone="secondary">{copy.history}</ButtonLink>
          <ButtonLink href="/dashboard/evaluations/new">
            {copy.newEvaluation} <ArrowRight aria-hidden="true" className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-control)] border border-[rgba(214,185,120,0.17)] bg-[rgba(214,185,120,0.045)] px-4 py-3 text-xs leading-5 text-[var(--text-secondary)]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
        <p><strong className="font-medium text-[var(--text)]">{dictionary.common.demoDataset}.</strong> {copy.demoNotice}</p>
      </div>

      <section aria-labelledby="score-summary" className="mt-6 grid gap-4 xl:grid-cols-[1.12fr_1.88fr]">
        <article className="panel flex min-h-[326px] flex-col justify-between p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="score-summary" className="text-sm font-medium">{copy.overall}</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.weighted}</p>
            </div>
            <span className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">{copy.grade} {demoReport.grade}</span>
          </div>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
            <ScoreGauge label={dictionary.snapshot.qualityScore} outOf={dictionary.snapshot.outOf} score={demoReport.overallScore} />
            <div className="w-full max-w-[210px] border-t border-white/[0.07] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              <p className="flex items-center gap-1.5 text-sm text-[var(--success)]">
                <ArrowUpRight aria-hidden="true" className="size-4" /> +{demoReport.scoreDelta}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{copy.improvement}</p>
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-3">
          {metricCards.map((metric) => (
            <article className="panel-flat flex min-h-[190px] flex-col justify-between p-5" key={metric.label}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xs font-medium text-[var(--text-secondary)]">{metric.label}</h2>
                {metric.tone === "success" && <CheckCircle aria-hidden="true" className="size-4 text-[var(--success)]" weight="fill" />}
              </div>
              <div>
                <p className={`mono-number text-5xl font-medium ${metric.tone === "ai" ? "text-[#aaaaff]" : "text-[var(--text)]"}`}>
                  {metric.value}<span className="text-base text-[var(--text-tertiary)]">{metric.suffix}</span>
                </p>
                <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">{metric.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
        <article className="panel-flat p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">{copy.profile}</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.currentPrevious}</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--text-tertiary)]">
              <span className="text-[var(--accent)]">{copy.current}</span><span>{copy.previous}</span>
            </div>
          </div>
          <QualityRadar data={demoReport.dimensions} />
        </article>

        <article className="panel-flat p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">{copy.trend}</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.fiveDemo}</p>
            </div>
            <p className="mono-number text-2xl">{formatScore(demoReport.overallScore, 1)}</p>
          </div>
          <QualityTrend data={demoReport.trend} />
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="panel-flat overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.07] p-5 md:px-6">
            <div>
              <h2 className="text-sm font-medium">{copy.findings}</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.recommendations}</p>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{demoReport.issues.length} {copy.openFindings}</span>
          </div>
          <div>
            {demoReport.issues.map((issue) => (
              <div key={issue.id} className="grid gap-4 border-b border-white/[0.06] p-5 last:border-0 md:grid-cols-[112px_1fr_auto] md:items-center md:px-6">
                <span className={`w-fit rounded-[6px] border px-2 py-1 font-mono text-[9px] ${severityTone[issue.severity]}`}>{issue.severity}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[var(--text)]">{issue.title}</h3>
                  <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">{issue.dimension}: {issue.evidence}</p>
                </div>
                <Link href={`/dashboard/evaluations/${issue.id}`} className="grid size-9 place-items-center rounded-[var(--radius-control)] border border-white/[0.08] text-[var(--text-tertiary)] hover:border-white/20 hover:text-[var(--text)]" aria-label={`${copy.viewFinding} ${issue.title}`}>
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-flat p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">{copy.metadata}</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.reproducibility}</p>
            </div>
            <WarningCircle aria-hidden="true" className="size-4 text-[var(--warning)]" />
          </div>
          <dl className="mt-6 space-y-4">
            {[
              ["Model", demoReport.metadata.modelId],
              ["Prompt", demoReport.metadata.promptVersion],
              ["Rubric", demoReport.metadata.rubric],
              ["Corpus", demoReport.metadata.referenceCorpusVersion],
              ["Input hash", demoReport.metadata.inputHash],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[86px_1fr] gap-3">
                <dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt>
                <dd className="min-w-0 truncate font-mono text-[10px] text-[var(--text-secondary)]">{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="panel-flat mt-4 overflow-hidden" aria-labelledby="recent-evaluations">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-5 md:px-6">
          <div>
            <h2 id="recent-evaluations" className="text-sm font-medium">{copy.recent}</h2>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">{copy.sampleHistory}</p>
          </div>
          <Link href="/dashboard/history" className="text-xs text-[var(--accent)] hover:text-[#e4cc98]">{copy.viewHistory}</Link>
        </div>
        <div className="overflow-x-auto" tabIndex={0} aria-label={copy.recentTable}>
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-[var(--text-tertiary)]">
                <th scope="col" className="px-6 py-3 font-normal">{copy.target}</th>
                <th scope="col" className="px-4 py-3 font-normal">{copy.date}</th>
                <th scope="col" className="px-4 py-3 font-normal">{copy.score}</th>
                <th scope="col" className="px-4 py-3 font-normal">{copy.status}</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">{copy.open}</span></th>
              </tr>
            </thead>
            <tbody>
              {demoReport.recentEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="border-b border-white/[0.05] text-xs last:border-0 hover:bg-white/[0.018]">
                  <th scope="row" className="px-6 py-4 font-medium text-[var(--text)]">{evaluation.target}</th>
                  <td className="px-4 py-4 text-[var(--text-tertiary)]">{evaluation.date}</td>
                  <td className="mono-number px-4 py-4 text-base text-[var(--text)]">{formatScore(evaluation.score, 1)}</td>
                  <td className="px-4 py-4 text-[var(--success)]">{dictionary.evaluations.completed}</td>
                  <td className="px-6 py-4 text-right"><ArrowUpRight aria-hidden="true" className="ml-auto size-4 text-[var(--text-tertiary)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
