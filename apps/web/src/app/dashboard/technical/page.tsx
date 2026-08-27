import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { listEvaluations } from "@/features/evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function TechnicalPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let evaluations: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;

  try {
    evaluations = await listEvaluations();
  } catch {
    unavailable = true;
  }
  const completed = evaluations.filter((evaluation) => evaluation.technicalResult);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium tracking-[-0.045em]">{text({ en: "Technical evaluation", ja: "技術評価", zh: "技术评估" })}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{text({ en: "Lighthouse lab, axe, Nu HTML Checker, and deterministic DOM/SEO checks are stored separately.", ja: "Lighthouse Lab、axe、Nu HTML Checker、DOM/SEOの決定的検査を分離して保存します。", zh: "Lighthouse 实验数据、axe、Nu HTML Checker 与确定性的 DOM/SEO 检查会分别保存。" })}</p>
      <div className="mt-7 grid gap-4">
        {unavailable ? (
          <div className="panel-flat p-6 text-sm text-[var(--critical)]" role="alert">{text({ en: "Technical evaluation data is unavailable.", ja: "技術評価データを取得できません。", zh: "技术评估数据暂不可用。" })}</div>
        ) : completed.length === 0 ? (
          <section className="grid min-h-64 place-items-center border-y border-white/[0.08] py-12 text-center">
            <div>
              <h2 className="text-xl font-medium">{text({ en: "No completed technical evaluations", ja: "完了した技術評価がありません", zh: "还没有已完成的技术评估" })}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{text({ en: "Create an evaluation and completed technical checks will appear here.", ja: "評価を作成すると、完了した技術チェックがここに表示されます。", zh: "创建评估后，已完成的技术检查会显示在这里。" })}</p>
              <ButtonLink className="mt-6" href="/dashboard/evaluations/new">{text({ en: "Create evaluation", ja: "評価を作成", zh: "创建评估" })}</ButtonLink>
            </div>
          </section>
        ) : completed.map((evaluation) => (
          <Link className="interactive-row panel-flat flex items-center justify-between gap-5 p-5 hover:border-white/20" href={`/dashboard/evaluations/${evaluation.id}`} key={evaluation.id}>
            <div><h2 className="text-sm font-medium">{evaluation.website.label}</h2><p className="mt-2 text-xs text-[var(--text-tertiary)]">{evaluation.project.name}</p></div>
            <div className="flex items-center gap-4"><CheckCircle aria-hidden="true" className="size-5 text-[var(--success)]" weight="fill" /><span className="mono-number text-2xl">{evaluation.technicalScore?.toFixed(1)}</span></div>
          </Link>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]"><Clock aria-hidden="true" className="size-4" /> {text({ en: "Field metrics are shown separately only when collected.", ja: "Field Metricsは取得時のみ別表示します。", zh: "只有实际采集到现场指标时，才会单独显示。" })}</p>
    </main>
  );
}
