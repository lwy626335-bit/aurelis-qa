import { ArrowLeft, Clock, Robot } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelEvaluationButton } from "@/components/evaluations/cancel-evaluation-button";
import { DeleteEvaluationButton } from "@/components/evaluations/delete-evaluation-button";
import { EvaluationStatusPanel } from "@/components/evaluations/evaluation-status-panel";
import { RewriteSuggestions } from "@/components/evaluations/rewrite-suggestions";
import { getEvaluation } from "@/features/evaluations/service";
import { localeCode, localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { webVisualEvaluationOutputSchema } from "@aurelis/evaluation";

export const dynamic = "force-dynamic";

export default async function EvaluationStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { dictionary, locale } = await getDictionary();
  const evaluation = await getEvaluation(id).catch(() => null);
  if (!evaluation) notFound();

  const copy = dictionary.evaluations;
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const createdAt = new Intl.DateTimeFormat(localeCode(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(evaluation.createdAt);
  const technical = evaluation.technicalResult;
  const brand = evaluation.brandResult;
  const visual = evaluation.visualResult ? webVisualEvaluationOutputSchema.parse({ aiAssessment: evaluation.visualResult.aiAssessment, dimensions: evaluation.visualResult.dimensionScores, recommendations: evaluation.visualResult.recommendations, summary: evaluation.visualResult.summary }) : null;
  const reviewerMetadata = brand?.reviewerOutput as { reliabilityComponents?: Record<string, number> } | null;
  const validatorMessages = ((technical?.validatorRaw as { messages?: { type?: string }[] } | null)?.messages ?? []);
  const validatorErrors = validatorMessages.filter((message) => message.type === "error" || message.type === "non-document-error").length;
  const validatorExecuted = Boolean(technical?.validatorRaw);

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
        {evaluation.status === "QUEUED" && evaluation.job?.status === "QUEUED" && (
          <CancelEvaluationButton dictionary={dictionary} evaluationId={evaluation.id} locale={locale} />
        )}
      </div>

      <EvaluationStatusPanel
        evaluationId={evaluation.id}
        key={`${evaluation.status}:${Boolean(technical)}:${Boolean(visual)}:${Boolean(brand)}`}
        initialSnapshot={{
          evaluationStatus: evaluation.status,
          jobStatus: evaluation.job?.status ?? null,
          stage: evaluation.job?.stage ?? null,
          attemptCount: evaluation.job?.attemptCount ?? 0,
          maxAttempts: evaluation.job?.maxAttempts ?? 0,
          hasTechnicalResult: Boolean(technical),
          hasBrandResult: Boolean(brand),
          hasBrandTarget: Boolean(evaluation.brandProfileId),
          hasVisualResult: Boolean(visual),
          failureCode: evaluation.failureCode,
          failureMessage: evaluation.failureMessage,
        }}
        locale={locale}
      />

      {(evaluation.overallScore !== null || evaluation.technicalScore !== null || evaluation.visualScore !== null || evaluation.brandScore !== null) && <section className="panel-flat mt-4 grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-5 md:p-6">{[
        [text({ en: "Overall", ja: "総合", zh: "综合" }), evaluation.overallScore],
        [text({ en: "Technical", ja: "技術", zh: "技术" }), evaluation.technicalScore],
        [text({ en: "Visual", ja: "ビジュアル", zh: "视觉" }), evaluation.visualScore],
        [text({ en: "Brand", ja: "ブランド", zh: "品牌" }), evaluation.brandScore],
        [text({ en: "Reliability", ja: "信頼性", zh: "可信度" }), evaluation.reliabilityScore],
      ].map(([label, value]) => <div key={String(label)}><p className="text-[10px] text-[var(--text-tertiary)]">{label}</p><p className="mono-number mt-2 text-3xl">{typeof value === "number" ? value.toFixed(1) : dictionary.common.unavailable}</p></div>)}</section>}

      {technical && (
        <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="technical-results">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-[var(--accent)]">LAB + DETERMINISTIC</p>
              <h2 className="mt-2 text-xl font-medium" id="technical-results">{text({ en: "Technical results", ja: "技術評価結果", zh: "技术评估结果" })}</h2>
            </div>
            <p className="mono-number text-4xl">{evaluation.technicalScore?.toFixed(1)}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></p>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [text({ en: "Performance", ja: "パフォーマンス", zh: "性能" }), technical.performanceScore],
              [text({ en: "Accessibility", ja: "アクセシビリティ", zh: "无障碍" }), technical.accessibilityScore],
              ["SEO", technical.seoScore],
              [text({ en: "Best practices", ja: "ベストプラクティス", zh: "最佳实践" }), technical.bestPracticesScore],
              [text({ en: "HTML quality", ja: "HTML品質", zh: "HTML 质量" }), technical.htmlQualityScore],
            ].map(([label, value]) => (
              <div className="rounded-[var(--radius-control)] border border-white/[0.07] p-4" key={String(label)}>
                <dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt>
                <dd className="mono-number mt-3 text-2xl">{typeof value === "number" ? value.toFixed(1) : dictionary.common.unavailable}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-[var(--text-tertiary)]">
            {validatorExecuted
              ? text({ en: `Nu HTML Checker: ${validatorErrors} errors. Field metrics were not collected.`, ja: `Nu HTML Checker: エラー ${validatorErrors}件。実利用データは取得していません。`, zh: `Nu HTML Checker：发现 ${validatorErrors} 个错误。未采集现场指标。` })
              : text({ en: "Nu HTML Checker was not run. Field metrics were not collected.", ja: "Nu HTML Checkerは未実行です。実利用データも取得していません。", zh: "未运行 Nu HTML Checker，也未采集现场指标。" })}
          </p>
        </section>
      )}

      {visual && (
        <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="visual-results">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] text-[var(--accent)]">DESKTOP + MOBILE</p><h2 className="mt-2 text-xl font-medium" id="visual-results">{text({ en: "Visual design results", ja: "ビジュアルデザイン評価", zh: "视觉设计评估结果" })}</h2></div><p className="mono-number text-4xl text-[var(--accent)]">{evaluation.visualScore?.toFixed(1)}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></p></div>
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{visual.summary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{visual.dimensions.map((item) => <article className="rounded-[var(--radius-control)] border border-white/[0.07] p-4" key={item.key}><p className="text-[10px] text-[var(--text-tertiary)]">{item.key}</p><p className="mono-number mt-3 text-2xl">{item.score}</p><p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{item.observation}</p></article>)}</div>
          <div className="mt-6 space-y-4">{visual.recommendations.map((item) => <article className="border-t border-white/[0.07] pt-4" key={item.title}><p className="font-mono text-[9px] text-[var(--accent)] uppercase">{item.priority}</p><h3 className="mt-2 text-sm font-medium">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.action}</p></article>)}</div>
        </section>
      )}

      {visual?.aiAssessment.applies && <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="web-ai-risk"><div className="flex items-center gap-3"><Robot aria-hidden="true" className="size-5 text-[var(--accent)]" /><div><p className="font-mono text-[9px] text-[var(--accent)]">AI-SPECIFIC REVIEW</p><h2 className="mt-1 text-xl font-medium" id="web-ai-risk">{text({ en: "AI traces and risk", ja: "AI痕跡とリスク", zh: "AI 痕迹与风险" })}</h2></div></div><p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{visual.aiAssessment.summary}</p><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Genericness", visual.aiAssessment.genericness], ["Artifact risk", visual.aiAssessment.artifactRisk], ["Consistency risk", visual.aiAssessment.consistencyRisk], ["Refinement need", visual.aiAssessment.refinementNeed]].map(([label, value]) => <div key={label}><dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt><dd className="mono-number mt-2 text-2xl">{value}</dd></div>)}</dl></section>}

      {brand && (
        <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="brand-results">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] text-[var(--accent)]">EVALUATOR + REVIEWER</p><h2 className="mt-2 text-xl font-medium" id="brand-results">{text({ en: "Brand voice results", ja: "ブランドボイス評価", zh: "品牌语调评估结果" })}</h2></div><p className="mono-number text-4xl text-[var(--accent)]">{evaluation.brandScore?.toFixed(1)}<span className="text-sm text-[var(--text-tertiary)]"> / 100</span></p></div>
          <div className="mt-6 space-y-4">{evaluation.evidence.filter((item) => item.dimensionKey.startsWith("brand:")).map((item) => <article className="border-l-2 border-[var(--accent)] bg-white/[0.02] p-4" key={item.id}><h3 className="text-sm font-medium">{item.dimensionKey.replace("brand:", "")}</h3><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.reason}</p>{item.excerpt && <blockquote className="mt-3 text-xs text-[var(--text-tertiary)]" lang={evaluation.website.language}>“{item.excerpt}”</blockquote>}</article>)}</div>
        </section>
      )}

      {reviewerMetadata?.reliabilityComponents && <section className="panel-flat mt-4 p-5 md:p-6"><h2 className="text-lg font-medium">{text({ en: "Reliability components", ja: "信頼性の構成", zh: "可信度构成" })}</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(reviewerMetadata.reliabilityComponents).map(([key, value]) => <div key={key}><dt className="text-[10px] text-[var(--text-tertiary)]">{key}</dt><dd className="mono-number mt-2 text-2xl">{value}%</dd></div>)}</dl></section>}

      {evaluation.recommendations.length > 0 && <section className="panel-flat mt-4 p-5 md:p-6"><h2 className="text-lg font-medium">{text({ en: "Recommendations", ja: "改善提案", zh: "改进建议" })}</h2><div className="mt-5 space-y-4">{evaluation.recommendations.map((item) => <article className="border-t border-white/[0.07] pt-4 first:border-0 first:pt-0" key={item.id}><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.suggestedFix}</p></article>)}</div></section>}

      {evaluation.recommendations.length > 0 && <RewriteSuggestions evaluationId={evaluation.id} locale={locale} />}

      {evaluation.failureCode && <div className="mt-4 border-l-2 border-[var(--warning)] p-4 text-xs text-[var(--text-secondary)]"><span className="font-mono text-[var(--warning)]">{evaluation.failureCode}</span>{evaluation.failureMessage && <p className="mt-2">{evaluation.failureMessage}</p>}</div>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-5"><a className="text-xs text-[var(--accent)] underline underline-offset-4" href={`/api/reports/${evaluation.id}/pdf`}>{text({ en: "Export PDF", ja: "PDFを出力", zh: "导出 PDF" })}</a><DeleteEvaluationButton evaluationId={evaluation.id} locale={locale} /></div>

      {evaluation.overallScore === null && <div className="mt-4 border-l-2 border-[var(--warning)]/60 bg-[rgba(232,196,107,0.045)] p-4 text-sm text-[var(--text-secondary)]">
        {copy.overallUnavailable}
      </div>}

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
