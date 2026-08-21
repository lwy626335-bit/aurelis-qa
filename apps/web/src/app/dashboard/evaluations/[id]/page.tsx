import { ArrowLeft, CheckCircle, Circle, Clock } from "@phosphor-icons/react/dist/ssr";
import { demoReport } from "@aurelis/database/demo";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelEvaluationButton } from "@/components/evaluations/cancel-evaluation-button";
import { getEvaluation } from "@/features/evaluations/service";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function EvaluationStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { dictionary, locale } = await getDictionary();
  const demoIssue = demoReport.issues.find((issue) => issue.id === id);
  if (demoIssue) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10">
        <Link className="inline-flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text)]" href="/dashboard">
          <ArrowLeft aria-hidden="true" className="size-4" /> {dictionary.future.returnDashboard}
        </Link>
        <article className="panel-flat mt-7 p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-[6px] border border-white/10 px-2.5 py-1 font-mono text-[10px] text-[var(--text-secondary)]">{demoIssue.severity}</span>
            <span className="font-mono text-[9px] text-[var(--accent)]">{dictionary.common.demoDataset}</span>
          </div>
          <h1 className="mt-8 text-3xl font-medium tracking-[-0.04em]">{demoIssue.title}</h1>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]" lang="en">{demoIssue.dimension}</p>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            <div><dt className="font-mono text-[10px] text-[var(--accent)]">{dictionary.landing.evidence}</dt><dd className="mt-3 text-sm leading-7 text-[var(--text-secondary)]" lang="en">{demoIssue.evidence}</dd></div>
            <div><dt className="font-mono text-[10px] text-[var(--accent)]">{dictionary.landing.recommendation}</dt><dd className="mt-3 text-sm leading-7 text-[var(--text-secondary)]" lang="en">{demoIssue.recommendation}</dd></div>
          </dl>
        </article>
      </main>
    );
  }
  const evaluation = await getEvaluation(id).catch(() => null);
  if (!evaluation) notFound();

  const copy = dictionary.evaluations;
  const statusLabel = {
    QUEUED: copy.queued,
    RUNNING: copy.running,
    COMPLETED: copy.completed,
    PARTIAL: copy.failed,
    FAILED: copy.failed,
    CANCELLED: copy.cancelled,
  }[evaluation.status];
  const createdAt = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(evaluation.createdAt);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-7 md:py-10">
      <Link className="inline-flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text)]" href="/dashboard/evaluations">
        <ArrowLeft aria-hidden="true" className="size-4" /> {copy.back}
      </Link>

      <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] text-[var(--accent)]">{evaluation.id}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{copy.detailTitle}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{evaluation.project.name} / {evaluation.website.label}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-[6px] border border-[rgba(232,196,107,0.2)] bg-[rgba(232,196,107,0.07)] px-3 py-1.5 font-mono text-xs text-[var(--warning)]">{statusLabel}</span>
          {evaluation.status === "QUEUED" && <CancelEvaluationButton dictionary={dictionary} evaluationId={evaluation.id} />}
        </div>
      </div>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        {[
          [copy.stored, true],
          [copy.technicalUnavailable, false],
          [copy.brandUnavailable, false],
        ].map(([label, complete]) => (
          <article className="panel-flat min-h-36 p-5" key={String(label)}>
            {complete ? <CheckCircle aria-hidden="true" className="size-5 text-[var(--success)]" weight="fill" /> : <Circle aria-hidden="true" className="size-5 text-[var(--text-tertiary)]" />}
            <p className="mt-7 text-sm leading-6 text-[var(--text-secondary)]">{label}</p>
          </article>
        ))}
      </section>

      <div className="mt-4 border-l-2 border-[var(--warning)]/60 bg-[rgba(232,196,107,0.045)] p-4 text-sm text-[var(--text-secondary)]">
        {copy.overallUnavailable}
      </div>

      <section className="panel-flat mt-4 p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Clock aria-hidden="true" className="size-4" /> {createdAt}</div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [copy.inputHash, evaluation.inputHash],
            [copy.rubric, evaluation.rubricVersion],
            [copy.stage, evaluation.job?.stage ?? dictionary.common.unavailable],
            [copy.attempts, String(evaluation.job?.attemptCount ?? 0)],
          ].map(([label, value]) => (
            <div className="min-w-0" key={label}>
              <dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt>
              <dd className="mt-2 truncate font-mono text-xs text-[var(--text-secondary)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
