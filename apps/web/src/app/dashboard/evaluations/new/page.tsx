import { Info } from "@phosphor-icons/react/dist/ssr";

import { EvaluationForm } from "@/components/evaluations/evaluation-form";
import { listBrands } from "@/features/brands/service";
import { getDictionary } from "@/i18n/server";

export default async function NewEvaluationPage() {
  const { dictionary, locale } = await getDictionary();
  const copy = dictionary.evaluations;
  const brands = await listBrands().catch(() => []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-12">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">Phase 2</p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] md:text-5xl">{copy.createTitle}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{copy.createDescription}</p>

      <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-control)] border border-[rgba(214,185,120,0.17)] bg-[rgba(214,185,120,0.045)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
        <p>{copy.phaseNotice}</p>
      </div>

      <section className="panel-flat mt-6 p-5 md:p-7">
        <EvaluationForm brands={brands.map(({ id, name }) => ({ id, name }))} dictionary={dictionary} locale={locale} />
      </section>
    </main>
  );
}
