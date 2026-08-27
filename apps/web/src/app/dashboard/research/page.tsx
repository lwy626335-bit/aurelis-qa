import { summarizeScores } from "@aurelis/evaluation";
import { CheckCircle, Flask, Hourglass, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { ExperimentForm } from "@/components/research/experiment-form";
import { listEvaluations } from "@/features/evaluations/service";
import { listExperiments } from "@/features/research/service";
import { localeCode, localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let evaluations: Awaited<ReturnType<typeof listEvaluations>> = [];
  let experiments: Awaited<ReturnType<typeof listExperiments>> = [];
  let unavailable = false;

  try {
    [evaluations, experiments] = await Promise.all([listEvaluations(), listExperiments()]);
  } catch {
    unavailable = true;
  }

  const dateFormatter = new Intl.DateTimeFormat(localeCode(locale), {
    dateStyle: "medium",
  });

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium tracking-[-0.045em]">{text({ en: "Research mode", ja: "研究モード", zh: "研究模式" })}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        {text({ en: "Run the same input 1–10 times and preserve evaluation conditions and variance.", ja: "同一入力を1〜10回実行し、評価条件と分散を保存します。", zh: "对同一输入运行 1–10 次，并保留评估条件与方差。" })}
      </p>

      <section className="mt-7 border-y border-white/[0.08] py-5">
        <div className="mb-4">
          <h2 className="text-sm font-medium">{text({ en: "New experiment", ja: "新しい実験", zh: "新建实验" })}</h2>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{text({ en: "Repeat a stored evaluation under the same recorded conditions.", ja: "保存済み評価を基準に、同じ条件で反復実行します。", zh: "基于已保存的评估，在相同记录条件下重复运行。" })}</p>
        </div>
        <ExperimentForm evaluations={evaluations.map((item) => ({ id: item.id, label: item.website.label }))} locale={locale} />
      </section>

      {unavailable ? (
        <div className="panel-flat mt-5 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Research data is unavailable.", ja: "研究データを読み込めません。", zh: "研究数据暂不可用。" })}
        </div>
      ) : experiments.length === 0 ? (
        <section className="mt-5 grid min-h-64 place-items-center border-y border-white/[0.08] py-10 text-center">
          <div>
            <Flask aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" weight="light" />
            <h2 className="mt-5 text-xl font-medium">{text({ en: "No experiments yet", ja: "実験はまだありません", zh: "还没有实验" })}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {evaluations.length
                ? text({ en: "Use the form above to create the first repeated run.", ja: "上のフォームから最初の反復実験を作成してください。", zh: "使用上方表单创建第一次重复实验。" })
                : text({ en: "Create a source evaluation before starting an experiment.", ja: "実験を作成する前に、基準となる評価を作成してください。", zh: "开始实验前，请先创建一次基准评估。" })}
            </p>
          </div>
        </section>
      ) : (
        <section className="panel-flat mt-5 overflow-hidden" aria-labelledby="experiment-list">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <h2 className="text-sm font-medium" id="experiment-list">{text({ en: "Experiments", ja: "実験一覧", zh: "实验列表" })}</h2>
            <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{experiments.length}</span>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {experiments.map((experiment, index) => {
              const scores = experiment.runs
                .map((run) => run.evaluation.overallScore)
                .filter((value): value is number => value !== null);
              const stats = scores.length ? summarizeScores(scores) : null;
              const complete = experiment.runs.length > 0 && scores.length === experiment.runs.length;
              const active = experiment.runs.some((run) => run.evaluation.status === "QUEUED" || run.evaluation.status === "RUNNING");
              const StatusIcon = complete ? CheckCircle : active ? Hourglass : WarningCircle;
              const statusLabel = complete
                ? text({ en: "Complete", ja: "完了", zh: "已完成" })
                : active
                  ? text({ en: "In progress", ja: "実行中", zh: "运行中" })
                  : text({ en: "Insufficient data", ja: "データ不足", zh: "数据不足" });
              const statusTone = complete ? "text-[var(--success)]" : active ? "text-[var(--warning)]" : "text-[var(--text-tertiary)]";
              const displayName = /^Experiment \d+(?:-|$)/.test(experiment.name)
                ? text({ en: `Repeated evaluation ${experiments.length - index}`, ja: `反復実験 ${experiments.length - index}`, zh: `重复评估 ${experiments.length - index}` })
                : experiment.name;
              const sourceName = displayName === experiment.name ? null : experiment.name;

              return (
                <article className="grid gap-5 p-5 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(90px,0.55fr))_auto] md:items-center" key={experiment.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{displayName}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] ${statusTone}`}>
                        <StatusIcon aria-hidden="true" className="size-3.5" weight={complete ? "fill" : "regular"} /> {statusLabel}
                      </span>
                    </div>
                    {sourceName && <p className="mt-1 truncate text-[10px] text-[var(--text-tertiary)]">{sourceName}</p>}
                    <p className="mt-1 truncate text-[11px] text-[var(--text-tertiary)]">{experiment.project.name} · {dateFormatter.format(experiment.createdAt)}</p>
                  </div>
                  <dl className="contents">
                    <div>
                      <dt className="text-[9px] text-[var(--text-tertiary)] uppercase">{text({ en: "Runs", ja: "実行", zh: "运行次数" })}</dt>
                      <dd className="mono-number mt-1 text-lg">{scores.length}<span className="text-xs text-[var(--text-tertiary)]"> / {experiment.runs.length}</span></dd>
                    </div>
                    <div>
                      <dt className="text-[9px] text-[var(--text-tertiary)] uppercase">{text({ en: "Mean", ja: "平均", zh: "平均值" })}</dt>
                      <dd className="mono-number mt-1 text-lg">{stats?.mean ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] text-[var(--text-tertiary)] uppercase">{text({ en: "Std. dev.", ja: "標準偏差", zh: "标准差" })}</dt>
                      <dd className="mono-number mt-1 text-lg">{scores.length > 1 ? stats?.standardDeviation : "—"}</dd>
                    </div>
                  </dl>
                  <p className="text-[10px] leading-4 text-[var(--text-tertiary)] md:max-w-28">
                    {scores.length > 1 ? text({ en: "Spread available", ja: "分散を計算済み", zh: "可查看离散程度" }) : text({ en: "Needs 2+ scores", ja: "2件以上必要", zh: "至少需要 2 个分数" })}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
