import { summarizeScores } from "@aurelis/evaluation";
import { ChartBar, Database, Info } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { listEvaluations } from "@/features/evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  CANCELLED: "bg-[var(--text-tertiary)]",
  COMPLETED: "bg-[var(--success)]",
  FAILED: "bg-[var(--critical)]",
  QUEUED: "bg-[var(--warning)]",
  RUNNING: "bg-[var(--accent)]",
};

export default async function AnalyticsPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const statusLabels: Record<string, string> = text({
    en: { CANCELLED: "Cancelled", COMPLETED: "Completed", FAILED: "Failed", PARTIAL: "Partially complete", QUEUED: "Queued", RUNNING: "Running" },
    ja: { CANCELLED: "キャンセル済み", COMPLETED: "完了", FAILED: "失敗", PARTIAL: "一部完了", QUEUED: "待機中", RUNNING: "実行中" },
    zh: { CANCELLED: "已取消", COMPLETED: "已完成", FAILED: "失败", PARTIAL: "部分完成", QUEUED: "等待中", RUNNING: "运行中" },
  });
  let evaluations: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;

  try {
    evaluations = await listEvaluations();
  } catch {
    unavailable = true;
  }

  const scores = evaluations
    .map((item) => item.overallScore)
    .filter((value): value is number => value !== null);
  const stats = scores.length ? summarizeScores(scores) : null;
  const hasSpread = scores.length > 1;
  const statuses = Object.entries(Object.groupBy(evaluations, (item) => item.status))
    .map(([status, rows]) => [status, rows?.length ?? 0] as const)
    .sort((left, right) => right[1] - left[1]);

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium tracking-[-0.045em]">{text({ en: "Analytics", ja: "分析", zh: "分析" })}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        {text({ en: "Descriptive statistics and processing status across stored evaluations.", ja: "保存済み評価の記述統計と処理状態を表示します。", zh: "显示已保存评估的描述性统计与处理状态。" })}
      </p>

      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Evaluation storage is unavailable.", ja: "評価ストレージを利用できません。", zh: "评估数据存储暂不可用。" })}
        </div>
      ) : evaluations.length === 0 ? (
        <section className="mt-7 grid min-h-72 place-items-center border-y border-white/[0.08] py-12 text-center">
          <div>
            <Database aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-medium">{text({ en: "No evaluations to analyze", ja: "分析できる評価がありません", zh: "没有可供分析的评估" })}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Create an evaluation to populate this workspace.", ja: "最初の評価を作成すると、ここに統計が表示されます。", zh: "创建第一次评估后，这里会显示统计信息。" })}</p>
            <Link className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]" href="/dashboard/evaluations/new">
              {text({ en: "Create evaluation", ja: "評価を作成", zh: "创建评估" })}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="mt-7 grid overflow-hidden border-y border-white/[0.08] lg:grid-cols-[1.08fr_0.92fr] lg:divide-x lg:divide-white/[0.08]">
            <article className="py-7 lg:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--accent)] uppercase">{text({ en: "Score summary", ja: "スコア概要", zh: "分数概览" })}</p>
                  <h2 className="mt-3 text-lg font-medium">{text({ en: "Mean overall score", ja: "平均総合スコア", zh: "平均综合分数" })}</h2>
                </div>
                <ChartBar aria-hidden="true" className="size-6 text-[var(--text-tertiary)]" weight="light" />
              </div>
              <p className="mono-number mt-8 text-7xl font-medium md:text-8xl">{stats?.mean ?? "—"}</p>
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-control)] border border-white/[0.08] bg-white/[0.08]">
                <div className="bg-[var(--surface)] p-4">
                  <dt className="text-[10px] text-[var(--text-tertiary)]">{text({ en: "Scored", ja: "採点済み", zh: "已评分" })}</dt>
                  <dd className="mono-number mt-2 text-2xl">{scores.length}<span className="text-xs text-[var(--text-tertiary)]"> / {evaluations.length}</span></dd>
                </div>
                <div className="bg-[var(--surface)] p-4">
                  <dt className="text-[10px] text-[var(--text-tertiary)]">{text({ en: "Std. deviation", ja: "標準偏差", zh: "标准差" })}</dt>
                  <dd className="mono-number mt-2 text-2xl">{hasSpread ? stats?.standardDeviation : "—"}</dd>
                </div>
              </dl>
              {!hasSpread && (
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--text-tertiary)]">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
                  {text({ en: "At least two scored evaluations are required before spread can be interpreted.", ja: "分散を解釈するには、少なくとも2件の採点済み評価が必要です。", zh: "至少需要两次已评分评估，才能解释数据离散程度。" })}
                </p>
              )}
            </article>

            <article className="border-t border-white/[0.08] py-7 lg:border-t-0 lg:p-7">
              <h2 className="text-lg font-medium">{text({ en: "Processing distribution", ja: "処理状態の分布", zh: "处理状态分布" })}</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">
                {text({ en: "Current state of every stored evaluation.", ja: "保存済み評価の現在状態です。", zh: "所有已保存评估的当前状态。" })}
              </p>
              <ul className="mt-7 space-y-5">
                {statuses.map(([status, count]) => {
                  const percentage = evaluations.length ? (count / evaluations.length) * 100 : 0;
                  return (
                    <li key={status}>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${statusTone[status] ?? "bg-[var(--text-tertiary)]"}`} />
                          {statusLabels[status] ?? status}
                        </span>
                        <span className="font-mono">{count}<span className="ml-2 text-[var(--text-tertiary)]">{percentage.toFixed(0)}%</span></span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`h-full origin-left ${statusTone[status] ?? "bg-[var(--text-tertiary)]"}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          </section>

          <section className="mt-5 border-l-2 border-[var(--accent)]/60 pl-4">
            <h2 className="text-sm font-medium">{text({ en: "Interpretation guardrail", ja: "解釈上の注意", zh: "解读说明" })}</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--text-tertiary)]">
              {text({ en: "These are descriptive summaries of stored data. They make no causal, statistical-significance, or population-generalization claim.", ja: "これらは保存済みデータの記述統計です。因果関係、統計的有意性、母集団への一般化は主張しません。", zh: "这些只是已保存数据的描述性摘要，不代表因果关系、统计显著性，也不能直接推广到总体。" })}
            </p>
          </section>
        </>
      )}
    </main>
  );
}
