import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { listEvaluations } from "@/features/evaluations/service";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function TechnicalPage() {
  const { locale } = await getDictionary();
  const evaluations = await listEvaluations().catch(() => []);
  const completed = evaluations.filter((evaluation) => evaluation.technicalResult);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)]">PHASE 3</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{locale === "ja" ? "技術評価" : "Technical evaluation"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{locale === "ja" ? "Lighthouse Lab、axe、Nu HTML Checker、DOM/SEOの決定的検査を分離して保存します。" : "Lighthouse lab, axe, Nu HTML Checker, and deterministic DOM/SEO checks are stored separately."}</p>
      <div className="mt-7 grid gap-4">
        {completed.length === 0 ? (
          <div className="panel-flat p-7 text-sm text-[var(--text-secondary)]">{locale === "ja" ? "完了した技術評価はありません。Workerを起動すると待機中のHTML評価を処理します。" : "No technical evaluations are complete. Start the worker to consume queued HTML evaluations."}</div>
        ) : completed.map((evaluation) => (
          <Link className="panel-flat flex items-center justify-between gap-5 p-5 hover:border-white/20" href={`/dashboard/evaluations/${evaluation.id}`} key={evaluation.id}>
            <div><h2 className="text-sm font-medium">{evaluation.website.label}</h2><p className="mt-2 text-xs text-[var(--text-tertiary)]">{evaluation.project.name}</p></div>
            <div className="flex items-center gap-4"><CheckCircle aria-hidden="true" className="size-5 text-[var(--success)]" weight="fill" /><span className="mono-number text-2xl">{evaluation.technicalScore?.toFixed(1)}</span></div>
          </Link>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]"><Clock aria-hidden="true" className="size-4" /> {locale === "ja" ? "Field Metricsは取得時のみ別表示します。" : "Field metrics are shown separately only when collected."}</p>
    </main>
  );
}
