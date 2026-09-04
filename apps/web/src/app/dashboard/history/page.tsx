import { ArrowUpRight, Database } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { InteractiveRow } from "@/components/ui/interactive-row";
import { listEvaluations } from "@/features/evaluations/service";
import { listLogoEvaluations } from "@/features/logo-evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, { locale }] = await Promise.all([searchParams, getDictionary()]);
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const selected = type === "website" || type === "logo" ? type : "all";
  let unavailable = false;
  let rows: Array<{ createdAt: Date; href: string; id: string; overall: number | null; status: string; target: string; technical: number | null; type: "website" | "logo"; visual: number | null }> = [];

  try {
    const [websites, logos] = await Promise.all([listEvaluations(), listLogoEvaluations()]);
    rows = [
      ...websites.map((item) => ({ createdAt: item.createdAt, href: `/dashboard/evaluations/${item.id}`, id: item.id, overall: item.overallScore, status: item.status, target: item.website.label, technical: item.technicalScore, type: "website" as const, visual: item.visualScore })),
      ...logos.map((item) => ({ createdAt: item.createdAt, href: `/dashboard/logo/${item.id}`, id: item.id, overall: item.overallScore, status: "COMPLETED", target: item.targetLabel, technical: null, type: "logo" as const, visual: item.overallScore })),
    ].filter((item) => selected === "all" || item.type === selected).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">{text({ en: "Evaluation history", ja: "評価履歴", zh: "评估历史" })}</h1>
      <nav aria-label={text({ en: "Filter evaluation type", ja: "評価タイプで絞り込む", zh: "按评价类型筛选" })} className="mt-6 flex flex-wrap gap-2">
        {(["all", "website", "logo"] as const).map((value) => <Link className={`rounded-[var(--radius-control)] border px-3 py-2 text-xs ${selected === value ? "border-[var(--accent)]/50 bg-[rgba(214,185,120,0.07)] text-[var(--text)]" : "border-white/10 text-[var(--text-secondary)]"}`} href={value === "all" ? "/dashboard/history" : `/dashboard/history?type=${value}`} key={value}>{value === "all" ? text({ en: "All", ja: "すべて", zh: "全部" }) : value === "website" ? text({ en: "Websites", ja: "Webサイト", zh: "网页" }) : "Logo"}</Link>)}
      </nav>

      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">{text({ en: "Evaluation history is unavailable. No data was changed.", ja: "評価履歴を取得できません。データは変更されていません。", zh: "暂时无法获取评估历史，数据没有发生变化。" })}</div>
      ) : rows.length === 0 ? (
        <section className="mt-7 grid min-h-72 place-items-center border-y border-white/[0.08] py-12 text-center"><div><Database aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" /><h2 className="mt-5 text-xl font-medium">{text({ en: "No evaluation history", ja: "評価履歴がありません", zh: "还没有评估历史" })}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Create an evaluation to start this history.", ja: "最初の評価を作成すると、ここに結果が表示されます。", zh: "创建第一次评估后，结果会显示在这里。" })}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><ButtonLink href="/dashboard/evaluations/new">{text({ en: "Evaluate website", ja: "Webサイトを評価", zh: "评价网页" })}</ButtonLink><ButtonLink href="/dashboard/logo" tone="secondary">{text({ en: "Evaluate logo", ja: "ロゴを評価", zh: "评价 Logo" })}</ButtonLink></div></div></section>
      ) : (
        <section aria-label={text({ en: "Evaluation history", ja: "評価履歴", zh: "评估历史" })} className="panel-flat mt-7 overflow-hidden">
          <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.7fr_0.9fr_auto] border-b border-white/10 px-5 py-3 text-[10px] text-[var(--text-tertiary)] md:grid"><span>{text({ en: "Target", ja: "対象", zh: "评估对象" })}</span><span>{text({ en: "Type", ja: "種類", zh: "类型" })}</span><span>{text({ en: "Technical", ja: "技術", zh: "技术" })}</span><span>{text({ en: "Visual / overall", ja: "ビジュアル／総合", zh: "视觉 / 综合" })}</span><span>{text({ en: "Status", ja: "状態", zh: "状态" })}</span><span /></div>
          <div className="divide-y divide-white/[0.06]">{rows.map((item) => <InteractiveRow aria-label={`${text({ en: "Open", ja: "開く", zh: "打开" })}: ${item.target}`} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-none p-5 md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.7fr_0.9fr_auto]" href={item.href} key={`${item.type}:${item.id}`}><span className="min-w-0"><span className="block truncate text-sm font-medium">{item.target}</span><span className="mt-1 block text-[10px] text-[var(--text-tertiary)] md:hidden">{item.type} · {item.status}</span></span><span className="mono-number text-xl md:hidden">{item.overall ?? "—"}</span><span className="hidden text-xs capitalize md:block">{item.type}</span><span className="hidden font-mono text-sm md:block">{item.technical ?? "—"}</span><span className="hidden font-mono text-sm md:block">{item.visual ?? item.overall ?? "—"}</span><span className="hidden text-xs md:block">{item.status}</span><ArrowUpRight aria-hidden="true" className="hidden size-4 text-[var(--text-tertiary)] md:block" /></InteractiveRow>)}</div>
        </section>
      )}
    </main>
  );
}
