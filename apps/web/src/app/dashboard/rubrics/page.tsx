import { RubricForm } from "@/components/research/rubric-form";
import { listRubrics } from "@/features/rubrics/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function RubricsPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let rubrics: Awaited<ReturnType<typeof listRubrics>> = [];
  let unavailable = false;

  try {
    rubrics = await listRubrics();
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">{text({ en: "Rubrics", ja: "ルーブリック", zh: "评分规则" })}</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{text({ en: "Existing versions are immutable; changes create a new version.", ja: "既存Versionは変更せず、新しいVersionとして保存します。", zh: "现有版本不可修改，任何变更都会创建新版本。" })}</p>
      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Rubric storage is unavailable. No new version was saved.", ja: "Rubricストレージを利用できません。新しいVersionは保存されていません。", zh: "评分规则存储暂不可用，没有保存新版本。" })}
        </div>
      ) : (
        <>
          <section className="panel-flat mt-7 p-5"><RubricForm locale={locale} /></section>
          {rubrics.length === 0 && (
            <p className="mt-4 border-l-2 border-[var(--warning)] py-1 pl-3 text-xs text-[var(--text-secondary)]" role="status">
              {text({ en: "No saved rubrics. Create the first version with the form above.", ja: "保存済みRubricはありません。上のフォームから最初のVersionを作成してください。", zh: "还没有保存的评分规则，请使用上方表单创建第一个版本。" })}
            </p>
          )}
          <div className="mt-4 grid gap-4">
            {rubrics.map((rubric) => (
          <article className="panel-flat p-5" key={rubric.id}>
            <div className="flex items-center justify-between"><h2 className="font-medium">{rubric.name}</h2><span className="font-mono text-xs text-[var(--accent)]">{rubric.version}</span></div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {rubric.dimensions.map((item) => <div className="flex justify-between text-xs" key={item.id}><dt className="text-[var(--text-secondary)]">{item.label}</dt><dd className="font-mono">{item.weight}</dd></div>)}
            </dl>
          </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
