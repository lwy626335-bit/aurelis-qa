import { demoReport, DEMO_DATASET_LABEL } from "@aurelis/database/demo";
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

const metricCards = [
  { label: "Technical", value: demoReport.scores.technical, detail: "+3 from previous", tone: "default" },
  { label: "Brand voice", value: demoReport.scores.brand, detail: "+3 from previous", tone: "ai" },
  { label: "Reliability", value: demoReport.scores.reliability, detail: "Strong evidence", tone: "success", suffix: "%" },
];

const severityTone = {
  Critical: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  High: "text-[var(--critical)] bg-[rgba(237,116,116,0.08)] border-[rgba(237,116,116,0.18)]",
  Medium: "text-[var(--warning)] bg-[rgba(232,196,107,0.07)] border-[rgba(232,196,107,0.17)]",
  Low: "text-[var(--text-secondary)] bg-white/[0.035] border-white/[0.08]",
};

export function DashboardOverview() {
  return (
    <main className="mx-auto w-full max-w-[1560px] px-4 py-6 md:px-7 md:py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span>Projects</span><CaretRight aria-hidden="true" className="size-3" /><span>{demoReport.project}</span>
          </div>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] md:text-4xl">Evaluation overview</h1>
          <p className="mt-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Clock aria-hidden="true" className="size-3.5" /> Evaluated Aug 17, 2026 at 09:42 UTC
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/evaluations" tone="secondary">Evaluation history</ButtonLink>
          <ButtonLink href="/dashboard/evaluations/new">
            New evaluation <ArrowRight aria-hidden="true" className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-control)] border border-[rgba(214,185,120,0.17)] bg-[rgba(214,185,120,0.045)] px-4 py-3 text-xs leading-5 text-[var(--text-secondary)]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
        <p><strong className="font-medium text-[var(--text)]">{DEMO_DATASET_LABEL}.</strong> These values demonstrate the interface. No URL, Lighthouse, validator, or AI evaluation ran in Phase 1.</p>
      </div>

      <section aria-labelledby="score-summary" className="mt-6 grid gap-4 xl:grid-cols-[1.12fr_1.88fr]">
        <article className="panel flex min-h-[326px] flex-col justify-between p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="score-summary" className="text-sm font-medium">Overall quality</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Deterministic weighted result</p>
            </div>
            <span className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">Grade {demoReport.grade}</span>
          </div>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
            <ScoreGauge score={demoReport.overallScore} />
            <div className="w-full max-w-[210px] border-t border-white/[0.07] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              <p className="flex items-center gap-1.5 text-sm text-[var(--success)]">
                <ArrowUpRight aria-hidden="true" className="size-4" /> +{demoReport.scoreDelta}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">Quality improved across the last five demo evaluations.</p>
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
              <h2 className="text-sm font-medium">Quality profile</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Current and previous evaluation</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--text-tertiary)]">
              <span className="text-[var(--accent)]">Current</span><span>Previous</span>
            </div>
          </div>
          <QualityRadar data={demoReport.dimensions} />
        </article>

        <article className="panel-flat p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium">Score trend</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Five demo evaluations</p>
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
              <h2 className="text-sm font-medium">Priority findings</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Evidence-backed recommendations</p>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{demoReport.issues.length} open</span>
          </div>
          <div>
            {demoReport.issues.map((issue) => (
              <div key={issue.id} className="grid gap-4 border-b border-white/[0.06] p-5 last:border-0 md:grid-cols-[112px_1fr_auto] md:items-center md:px-6">
                <span className={`w-fit rounded-[6px] border px-2 py-1 font-mono text-[9px] ${severityTone[issue.severity]}`}>{issue.severity}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[var(--text)]">{issue.title}</h3>
                  <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">{issue.dimension}: {issue.evidence}</p>
                </div>
                <Link href={`/dashboard/evaluations/${issue.id}`} className="grid size-9 place-items-center rounded-[var(--radius-control)] border border-white/[0.08] text-[var(--text-tertiary)] hover:border-white/20 hover:text-[var(--text)]" aria-label={`View ${issue.title}`}>
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-flat p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Evaluation metadata</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Reproducibility record</p>
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
            <h2 id="recent-evaluations" className="text-sm font-medium">Recent evaluations</h2>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">Sample history for interface verification</p>
          </div>
          <Link href="/dashboard/history" className="text-xs text-[var(--accent)] hover:text-[#e4cc98]">View history</Link>
        </div>
        <div className="overflow-x-auto" tabIndex={0} aria-label="Recent evaluations table, horizontally scrollable on small screens">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-[var(--text-tertiary)]">
                <th scope="col" className="px-6 py-3 font-normal">Target</th>
                <th scope="col" className="px-4 py-3 font-normal">Date</th>
                <th scope="col" className="px-4 py-3 font-normal">Score</th>
                <th scope="col" className="px-4 py-3 font-normal">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {demoReport.recentEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="border-b border-white/[0.05] text-xs last:border-0 hover:bg-white/[0.018]">
                  <th scope="row" className="px-6 py-4 font-medium text-[var(--text)]">{evaluation.target}</th>
                  <td className="px-4 py-4 text-[var(--text-tertiary)]">{evaluation.date}</td>
                  <td className="mono-number px-4 py-4 text-base text-[var(--text)]">{formatScore(evaluation.score, 1)}</td>
                  <td className="px-4 py-4 text-[var(--success)]">{evaluation.status}</td>
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
