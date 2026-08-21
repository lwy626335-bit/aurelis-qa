import { BrandForm } from "@/components/brands/brand-form";
import { getDictionary } from "@/i18n/server";

export default async function NewBrandPage() {
  const { locale } = await getDictionary();
  return <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10"><p className="font-mono text-[10px] text-[var(--accent)]">PHASE 4</p><h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{locale === "ja" ? "ブランドプロフィール作成" : "Create brand profile"}</h1><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{locale === "ja" ? "主観的なラベルだけでなく、実際の例文とReference Corpusを根拠として保存します。" : "Ground the profile in real example copy and a traceable reference corpus, not subjective labels alone."}</p><section className="panel-flat mt-7 p-5 md:p-7"><BrandForm locale={locale} /></section></main>;
}
