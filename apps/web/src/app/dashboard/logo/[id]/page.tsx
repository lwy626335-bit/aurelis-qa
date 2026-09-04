import { ArrowLeft, Robot, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreGauge } from "@/components/data/score-gauge";
import { DeleteEvaluationButton } from "@/components/evaluations/delete-evaluation-button";
import { getLogoEvaluation } from "@/features/logo-evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { logoEvaluationOutputSchema } from "@aurelis/evaluation";

export const dynamic = "force-dynamic";

export default async function LogoEvaluationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evaluation, { locale }] = await Promise.all([getLogoEvaluation(id).catch(() => null), getDictionary()]);
  if (!evaluation) notFound();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const result = logoEvaluationOutputSchema.parse({
    aiAssessment: evaluation.aiAssessment,
    dimensions: evaluation.dimensionScores,
    recommendations: evaluation.recommendations,
    summary: evaluation.summary,
  });
  const labels: Record<string, string> = {
    "brand-fit": text({ en: "Brand fit", ja: "ブランド適合", zh: "品牌匹配" }),
    distinctiveness: text({ en: "Distinctiveness", ja: "独自性", zh: "独特性" }),
    legibility: text({ en: "Legibility", ja: "可読性", zh: "可读性" }),
    scalability: text({ en: "Scalability", ja: "拡張性", zh: "缩放适配" }),
    versatility: text({ en: "Versatility", ja: "汎用性", zh: "应用适配" }),
  };

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 md:px-7 md:py-12">
      <Link className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]" href="/dashboard/logo"><ArrowLeft aria-hidden="true" className="size-4" />{text({ en: "Evaluate another logo", ja: "別のロゴを評価", zh: "评价另一个 Logo" })}</Link>
      <section className="mt-7 grid gap-8 border-y border-white/[0.08] py-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <ScoreGauge label={text({ en: "Logo score", ja: "ロゴスコア", zh: "Logo 评分" })} score={evaluation.overallScore} />
        <div>
          <p className="font-mono text-[10px] text-[var(--accent)]">{evaluation.modelId} · {evaluation.promptVersion}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{evaluation.targetLabel}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{result.summary}</p>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">{evaluation.brandName} · {evaluation.industry} · {evaluation.brandKeywords.join(" · ")}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label={text({ en: "Logo score dimensions", ja: "ロゴ評価項目", zh: "Logo 评分维度" })}>
        {result.dimensions.map((item) => <article className="panel-flat p-4" key={item.key}><p className="text-[10px] text-[var(--text-tertiary)]">{labels[item.key]}</p><p className="mono-number mt-3 text-3xl text-[var(--accent)]">{item.score}</p><p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{item.observation}</p></article>)}
      </section>

      {result.aiAssessment.applies && <section className="panel-flat mt-4 p-5 md:p-6" aria-labelledby="ai-risk-title">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><Robot aria-hidden="true" className="size-5 text-[var(--accent)]" /><div><p className="font-mono text-[9px] text-[var(--accent)]">AI-SPECIFIC REVIEW</p><h2 className="mt-1 text-xl font-medium" id="ai-risk-title">{text({ en: "AI traces and risk", ja: "AI痕跡とリスク", zh: "AI 痕迹与风险" })}</h2></div></div><span className="rounded-[6px] border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase">{result.aiAssessment.riskLevel}</span></div>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{result.aiAssessment.summary}</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Genericness", result.aiAssessment.genericness], ["Artifact risk", result.aiAssessment.artifactRisk], ["Consistency risk", result.aiAssessment.consistencyRisk], ["Refinement need", result.aiAssessment.refinementNeed]].map(([label, value]) => <div key={label}><dt className="text-[10px] text-[var(--text-tertiary)]">{label}</dt><dd className="mono-number mt-2 text-2xl">{value}</dd></div>)}</dl>
      </section>}

      <section className="panel-flat mt-4 p-5 md:p-6">
        <div className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="size-5 text-[var(--accent)]" /><h2 className="text-xl font-medium">{text({ en: "Priority improvements", ja: "優先改善事項", zh: "优先改进建议" })}</h2></div>
        <div className="mt-5 space-y-4">{result.recommendations.map((item, index) => <article className="border-t border-white/[0.07] pt-4 first:border-0 first:pt-0" key={item.title}><p className="font-mono text-[9px] text-[var(--accent)]">0{index + 1} · {item.priority}</p><h3 className="mt-2 text-sm font-medium">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.action}</p></article>)}</div>
      </section>

      <div className="mt-6 flex justify-end border-t border-white/[0.07] pt-5">
        <DeleteEvaluationButton evaluationId={evaluation.id} evaluationType="logo" locale={locale} />
      </div>
    </main>
  );
}
