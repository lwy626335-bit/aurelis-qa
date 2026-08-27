import { ArrowUpRight, Database } from "@phosphor-icons/react/dist/ssr";

import { ButtonLink } from "@/components/ui/button-link";
import { InteractiveRow } from "@/components/ui/interactive-row";
import { listEvaluations } from "@/features/evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let rows: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;

  try {
    rows = await listEvaluations();
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">{text({ en: "Evaluation history", ja: "評価履歴", zh: "评估历史" })}</h1>
      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Evaluation history is unavailable. No data was changed.", ja: "評価履歴を取得できません。データは変更されていません。", zh: "暂时无法获取评估历史，数据没有发生变化。" })}
        </div>
      ) : rows.length === 0 ? (
        <section className="mt-7 grid min-h-72 place-items-center border-y border-white/[0.08] py-12 text-center">
          <div>
            <Database aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-medium">{text({ en: "No evaluation history", ja: "評価履歴がありません", zh: "还没有评估历史" })}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Create an evaluation to start this history.", ja: "最初の評価を作成すると、ここに結果が表示されます。", zh: "创建第一次评估后，结果会显示在这里。" })}</p>
            <ButtonLink className="mt-6" href="/dashboard/evaluations/new">{text({ en: "Create evaluation", ja: "評価を作成", zh: "创建评估" })}</ButtonLink>
          </div>
        </section>
      ) : (
        <section aria-label={text({ en: "Evaluation history", ja: "評価履歴", zh: "评估历史" })} className="panel-flat mt-7 overflow-hidden">
          <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.7fr_0.9fr_auto] border-b border-white/10 px-5 py-3 text-[10px] text-[var(--text-tertiary)] md:grid">
            <span>{text({ en: "Target", ja: "対象", zh: "评估对象" })}</span>
            <span>{text({ en: "Technical", ja: "技術", zh: "技术" })}</span>
            <span>{text({ en: "Brand", ja: "ブランド", zh: "品牌" })}</span>
            <span>{text({ en: "Overall", ja: "総合", zh: "综合" })}</span>
            <span>{text({ en: "Status", ja: "状態", zh: "状态" })}</span>
            <span />
          </div>
          <div className="divide-y divide-white/[0.06]">
            {rows.map((item) => (
              <InteractiveRow
                aria-label={`${text({ en: "Open", ja: "開く", zh: "打开" })}: ${item.website.label}`}
                className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-none p-5 md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.7fr_0.9fr_auto]"
                href={`/dashboard/evaluations/${item.id}`}
                key={item.id}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{item.website.label}</span>
                  <span className="mt-1 block text-[10px] text-[var(--text-tertiary)] md:hidden">{item.status}</span>
                </span>
                <span className="mono-number text-xl md:hidden">{item.overallScore ?? "—"}</span>
                <span className="hidden font-mono text-sm md:block">{item.technicalScore ?? "—"}</span>
                <span className="hidden font-mono text-sm md:block">{item.brandScore ?? "—"}</span>
                <span className="hidden font-mono text-sm md:block">{item.overallScore ?? "—"}</span>
                <span className="hidden text-xs md:block">{item.status}</span>
                <ArrowUpRight aria-hidden="true" className="hidden size-4 text-[var(--text-tertiary)] md:block" />
              </InteractiveRow>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
