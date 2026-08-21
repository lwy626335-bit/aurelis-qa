import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { listBrands } from "@/features/brands/service";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const { locale } = await getDictionary();
  const brands = await listBrands().catch(() => []);
  const ja = locale === "ja";
  return <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] text-[var(--accent)]">PHASE 4</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{ja ? "ブランド" : "Brands"}</h1><p className="mt-3 text-sm text-[var(--text-secondary)]">{ja ? "評価に使用するReference Corpusを追跡します。" : "Track the reference corpus used for evaluation."}</p></div><Link className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]" href="/dashboard/brands/new">{ja ? "新規作成" : "New brand"}<ArrowRight className="ml-2 size-4" /></Link></div><div className="mt-7 grid gap-4 md:grid-cols-2">{brands.length ? brands.map((brand) => <article className="panel-flat p-5" key={brand.id}><h2 className="text-lg font-medium">{brand.name}</h2><p className="mt-2 text-xs text-[var(--text-tertiary)]">{brand.project.name}</p><p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{brand.description}</p><dl className="mt-5 flex gap-6 text-xs"><div><dt className="text-[var(--text-tertiary)]">Examples</dt><dd className="mt-1 font-mono">{brand.examples.length}</dd></div><div><dt className="text-[var(--text-tertiary)]">References</dt><dd className="mt-1 font-mono">{brand.referenceSources.length}</dd></div><div><dt className="text-[var(--text-tertiary)]">Corpus</dt><dd className="mt-1 font-mono">{brand.corpusVersion}</dd></div></dl></article>) : <div className="panel-flat p-7 text-sm text-[var(--text-secondary)]">{ja ? "ブランドプロフィールはありません。" : "No brand profiles yet."}</div>}</div></main>;
}
