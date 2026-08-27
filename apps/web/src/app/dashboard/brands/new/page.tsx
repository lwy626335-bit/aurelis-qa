import { BrandForm } from "@/components/brands/brand-form";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function NewBrandPage() {
  const { locale } = await getDictionary();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium tracking-[-0.045em]">
        {localize(locale, { en: "Create brand profile", ja: "ブランドプロフィール作成", zh: "创建品牌资料" })}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {localize(locale, {
          en: "Ground the profile in real example copy and a traceable reference corpus, not subjective labels alone.",
          ja: "主観的なラベルだけでなく、実際の例文とReference Corpusを根拠として保存します。",
          zh: "使用真实示例文案与可追溯的参考语料建立品牌资料，而不是只依赖主观标签。",
        })}
      </p>
      <section className="panel-flat mt-7 p-5 md:p-7">
        <BrandForm locale={locale} />
      </section>
    </main>
  );
}
