import { ArrowLeft, CheckCircle, Circle, Clock } from "@phosphor-icons/react/dist/ssr";
import { demoReport } from "@aurelis/database/demo";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelEvaluationButton } from "@/components/evaluations/cancel-evaluation-button";
import { DeleteEvaluationButton } from "@/components/evaluations/delete-evaluation-button";
import { RewriteSuggestions } from "@/components/evaluations/rewrite-suggestions";
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
    PARTIAL: locale === "ja" ? "一部完了" : "Partially complete",
    FAILED: copy.failed,
    CANCELLED: copy.cancelled,
  }[evaluation.status];
  const createdAt = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(evaluation.createdAt);
  const technical = evaluation.technicalResult;
  const brand = evaluation.brandResult;
  const reviewerMetadata = brand?.reviewerOutput as { reliabilityComponents?: Record<string, number> } | null;
  const validatorMessages = ((technical?.validatorRaw as { messages?: { type?: string }[] } | null)?.messages ?? []);
  const validatorErrors = validatorMessages.filter((message) => message.type === "error" || message.type === "non-document-error").length;

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
          [technical ? (locale === "ja" ? "技術評価を完了" : "Technical evaluation complete") : copy.technicalUnavailable, Boolean(technical)],
          [brand ? (locale === "ja" ? "ブランド評価を完了" : "Brand evaluation complete") : copy.brandUnavailable, Boolean(brand)],
        ].map(([label, complete]) => (
          <article className="panel-flat min-h-36 p-5" key={String(label)}>
            {complete ? <CheckCircle aria-hidden="true" className="size-5 text-[var(--success)]" weight="fill" /> : <Circle aria-hidden="true" className="size-5 text-[var(--text-tertiary)]" />}
            <p className="mt-7 text-sm leading-6 text-[var(--text-secondary)]">{label}</p>
          </article>
        ))}
      </section>

      {(evaluation.overallScore !== null || evaluation.technicalScore !== null || evaluation.brandScore !== null) && <section className="panel-flat mt-4 grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6">{[
        [locale === "ja" ? "総合" : "Overall", evaluation.overallScore], [locale === "ja" ? "技術" : "Technical", evaluation.technicalScore], [locale === "ja" ? "ブランド" : "Brand", evaluation.brandScore], [locale === "ja" ? "信頼性" : "Reliability", evaluation.reliabilityScore],
      ].map(([label, value]) => <div key={String(label)}><p className="text-[10px] text-[var(--text-tertiary)]">{label}</p><p className="mono-number mt-2 text-3xl">{typeof value === "number" ? value.toFixed(1) : dictionary.common.unavailable}</p></div>)}</section>}

      {technical && (
        <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="technical-results">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-[var(--accent)]">LAB + DETERMINISTIC</p>
              <h2 className="mt-2 text-xl font-medium" id="technical-results">{locale === "ja" ? "技術評価結果" : "Technical results"}</h2>
            </div>
            <p className="mono-number text-4xl">{evaluation.technicalScore?.toFixed(1)}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></p>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [locale === "ja" ? "パフォーマンス" : "Performance", technical.performanceScore],
              [locale === "ja" ? "アクセシビリティ" : "Accessibility", technical.accessibilityScore],
              ["SEO", technical.seoScore],
              [locale === "ja" ? "ベストプラクティス" : "Best practices", technical.bestPracticesScore],
              [locale === "ja" ? "HTML品質" : "HTML quality", technical.htmlQualityScore],
            ].map(([label, value]) => (
              <div className="rounded-[var(--radius-control)] border border-white/[0.07] p-4" key={String(label)}>
                <dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt>
                <dd className="mono-number mt-3 text-2xl">{typeof value === "number" ? value.toFixed(1) : dictionary.common.unavailable}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-[var(--text-tertiary)]">
            {locale === "ja" ? `Nu HTML Checker: エラー ${validatorErrors}件。Field Metricsは取得していません。` : `Nu HTML Checker: ${validatorErrors} errors. Field metrics were not collected.`}
          </p>
        </section>
      )}

      {brand && (
        <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="brand-results">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] text-[#aaaaff]">EVALUATOR + REVIEWER</p><h2 className="mt-2 text-xl font-medium" id="brand-results">{locale === "ja" ? "ブランドボイス評価" : "Brand voice results"}</h2></div><p className="mono-number text-4xl text-[#aaaaff]">{evaluation.brandScore?.toFixed(1)}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></p></div>
          <div className="mt-6 space-y-4">{evaluation.evidence.filter((item) => item.dimensionKey.startsWith("brand:")).map((item) => <article className="border-l-2 border-[#8c8cff] bg-white/[0.02] p-4" key={item.id}><h3 className="text-sm font-medium">{item.dimensionKey.replace("brand:", "")}</h3><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.reason}</p>{item.excerpt && <blockquote className="mt-3 text-xs text-[var(--text-tertiary)]" lang={evaluation.website.language}>“{item.excerpt}”</blockquote>}</article>)}</div>
        </section>
      )}

      {reviewerMetadata?.reliabilityComponents && <section className="panel-flat mt-4 p-5 md:p-6"><h2 className="text-lg font-medium">{locale === "ja" ? "信頼性の構成" : "Reliability components"}</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(reviewerMetadata.reliabilityComponents).map(([key, value]) => <div key={key}><dt className="text-[10px] text-[var(--text-tertiary)]">{key}</dt><dd className="mono-number mt-2 text-2xl">{value}%</dd></div>)}</dl></section>}

      {evaluation.recommendations.length > 0 && <section className="panel-flat mt-4 p-5 md:p-6"><h2 className="text-lg font-medium">{locale === "ja" ? "改善提案" : "Recommendations"}</h2><div className="mt-5 space-y-4">{evaluation.recommendations.map((item) => <article className="border-t border-white/[0.07] pt-4 first:border-0 first:pt-0" key={item.id}><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.suggestedFix}</p></article>)}</div></section>}

      {evaluation.recommendations.length > 0 && <RewriteSuggestions evaluationId={evaluation.id} locale={locale} />}

      {evaluation.failureCode && <div className="mt-4 border-l-2 border-[var(--warning)] p-4 text-xs text-[var(--text-secondary)]"><span className="font-mono text-[var(--warning)]">{evaluation.failureCode}</span>{evaluation.failureMessage && <p className="mt-2">{evaluation.failureMessage}</p>}</div>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-5"><a className="text-xs text-[var(--accent)] underline underline-offset-4" href={`/api/reports/${evaluation.id}/pdf`}>{locale === "ja" ? "PDFを出力" : "Export PDF"}</a><DeleteEvaluationButton evaluationId={evaluation.id} locale={locale} /></div>

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
