import { Info } from "@phosphor-icons/react/dist/ssr";

import { LogoEvaluationForm } from "@/components/logo-evaluations/logo-evaluation-form";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function LogoEvaluationPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-12">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">Visual identity review</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em] md:text-5xl">{text({ en: "Evaluate a logo", ja: "ロゴを評価する", zh: "评价 Logo" })}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{text({ en: "Get a comparable five-dimension score, an AI-risk review when applicable, and three prioritized improvements.", ja: "比較可能な5項目のスコア、該当する場合のAIリスク診断、優先度付きの改善案3件を取得します。", zh: "获得可横向比较的五维评分、适用时的 AI 风险诊断，以及三条有优先级的改进建议。" })}</p>
      <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-control)] border border-[rgba(214,185,120,0.17)] bg-[rgba(214,185,120,0.045)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
        <p>{text({ en: "The file is sent to the configured visual model for this request and is not saved by AURELIS.", ja: "ファイルはこの評価のために設定済みビジュアルモデルへ送信され、AURELISには保存されません。", zh: "文件仅在本次评价中发送给已配置的视觉模型，AURELIS 不会保存原图。" })}</p>
      </div>
      <section className="panel-flat mt-6 p-5 md:p-7">
        <LogoEvaluationForm locale={locale} />
      </section>
    </main>
  );
}
