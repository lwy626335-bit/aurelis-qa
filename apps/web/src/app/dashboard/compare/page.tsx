import { ButtonLink } from "@/components/ui/button-link";
import { buttonStyles } from "@/components/ui/button";
import { listEvaluations } from "@/features/evaluations/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let rows: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;

  try {
    rows = await listEvaluations();
  } catch {
    unavailable = true;
  }
  const query = await searchParams;
  const a = rows.find((item) => item.id === query.a);
  const b = rows.find((item) => item.id === query.b);
  const conditions = a && b ? [
    [text({ en: "Input hash", ja: "入力ハッシュ", zh: "输入哈希" }), a.inputHash, b.inputHash],
    [text({ en: "Rubric", ja: "Rubric", zh: "评分规则" }), a.rubricVersion, b.rubricVersion],
    [text({ en: "Model", ja: "モデル", zh: "模型" }), a.evaluatorModelId, b.evaluatorModelId],
    [text({ en: "Prompt", ja: "Prompt", zh: "提示词" }), a.promptVersion, b.promptVersion],
  ] : [];

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">{text({ en: "Compare evaluations", ja: "評価比較", zh: "对比评估" })}</h1>
      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Evaluation data for comparison is unavailable.", ja: "比較用の評価データを取得できません。", zh: "对比所需的评估数据暂不可用。" })}
        </div>
      ) : rows.length < 2 ? (
        <section className="mt-7 grid min-h-64 place-items-center border-y border-white/[0.08] py-12 text-center">
          <div>
            <h2 className="text-xl font-medium">{text({ en: "Two evaluations are required", ja: "比較には2件の評価が必要です", zh: "至少需要两次评估" })}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Create at least one more evaluation to compare conditions and scores.", ja: "条件やスコアの差を確認するには、もう1件以上作成してください。", zh: "请再创建至少一次评估，以对比条件和分数。" })}</p>
            <ButtonLink className="mt-6" href="/dashboard/evaluations/new">{text({ en: "Create evaluation", ja: "評価を作成", zh: "创建评估" })}</ButtonLink>
          </div>
        </section>
      ) : (
      <form className="panel-flat mt-7 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <select aria-label={text({ en: "First evaluation", ja: "比較元", zh: "第一次评估" })} className="field" defaultValue={query.a} name="a" required>
          {rows.map((item) => <option key={item.id} value={item.id}>{item.website.label} / {item.id.slice(-6)}</option>)}
        </select>
        <select aria-label={text({ en: "Second evaluation", ja: "比較先", zh: "第二次评估" })} className="field" defaultValue={query.b} name="b" required>
          {rows.map((item) => <option key={item.id} value={item.id}>{item.website.label} / {item.id.slice(-6)}</option>)}
        </select>
        <button className={buttonStyles()}>{text({ en: "Compare", ja: "比較", zh: "对比" })}</button>
      </form>
      )}
      {a && b && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="panel-flat p-5"><h2>{a.website.label}</h2><p className="mono-number mt-5 text-4xl">{a.overallScore ?? "—"}</p></article>
          <article className="panel-flat p-5"><h2>{b.website.label}</h2><p className="mono-number mt-5 text-4xl">{b.overallScore ?? "—"}</p></article>
          <section className="panel-flat p-5 md:col-span-2">
            <h2 className="text-lg font-medium">{text({ en: "Evaluation conditions", ja: "評価条件", zh: "评估条件" })}</h2>
            <dl className="mt-4 space-y-3">
              {conditions.map(([label, left, right]) => (
                <div className="grid gap-2 text-xs sm:grid-cols-[120px_1fr_1fr_auto]" key={label}>
                  <dt>{label}</dt><dd className="truncate font-mono">{left ?? "—"}</dd><dd className="truncate font-mono">{right ?? "—"}</dd>
                  <dd className={left === right ? "text-[var(--success)]" : "text-[var(--warning)]"}>{left === right ? text({ en: "Same", ja: "同一", zh: "相同" }) : text({ en: "Different", ja: "相違", zh: "不同" })}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </main>
  );
}
