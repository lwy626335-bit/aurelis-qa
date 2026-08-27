import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { ButtonLink } from "@/components/ui/button-link";
import { listBrands } from "@/features/brands/service";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  let brands: Awaited<ReturnType<typeof listBrands>> = [];
  let unavailable = false;

  try {
    brands = await listBrands();
  } catch {
    unavailable = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-4xl font-medium tracking-[-0.045em]">{text({ en: "Brands", ja: "ブランド", zh: "品牌" })}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {text({ en: "Track the reference corpus used for evaluation.", ja: "評価に使用するReference Corpusを追跡します。", zh: "管理评估所使用的参考语料。" })}
          </p>
        </div>
        <ButtonLink href="/dashboard/brands/new">
          {text({ en: "New brand", ja: "新規作成", zh: "新建品牌" })}<ArrowRight aria-hidden="true" className="ml-2 size-4" />
        </ButtonLink>
      </div>
      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">
          {text({ en: "Brand storage is unavailable. No data was changed.", ja: "ブランドストレージを利用できません。データは変更されていません。", zh: "品牌数据存储暂不可用，数据没有发生变化。" })}
        </div>
      ) : brands.length === 0 ? (
        <section className="mt-7 grid min-h-72 place-items-center border-y border-white/[0.08] py-12 text-center">
          <div>
            <Sparkle aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-medium">{text({ en: "No brand profiles yet", ja: "ブランドプロフィールがありません", zh: "还没有品牌资料" })}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Add a reference corpus to enable brand evaluation.", ja: "最初のReference Corpusを登録して、ブランド評価を有効にします。", zh: "添加参考语料，即可启用品牌评估。" })}</p>
            <ButtonLink className="mt-6" href="/dashboard/brands/new">{text({ en: "Create brand", ja: "ブランドを作成", zh: "创建品牌" })}</ButtonLink>
          </div>
        </section>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {brands.map((brand) => (
          <article className="panel-flat p-5" key={brand.id}>
            <h2 className="text-lg font-medium">{brand.name}</h2>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">{brand.project.name}</p>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{brand.description}</p>
            <dl className="mt-5 flex gap-6 text-xs">
              <div><dt className="text-[var(--text-tertiary)]">Examples</dt><dd className="mt-1 font-mono">{brand.examples.length}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">References</dt><dd className="mt-1 font-mono">{brand.referenceSources.length}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">Corpus</dt><dd className="mt-1 font-mono">{brand.corpusVersion}</dd></div>
            </dl>
          </article>
          ))}
        </div>
      )}
    </main>
  );
}
