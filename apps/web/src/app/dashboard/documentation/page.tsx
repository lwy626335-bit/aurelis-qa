import { ArrowLeft, BookOpenText } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function DocumentationPage() {
  const { dictionary, locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <BookOpenText aria-hidden="true" className="size-7 text-[var(--accent)]" weight="light" />
        <h1 className="mt-10 text-4xl font-medium tracking-[-0.045em] md:text-5xl">
          {text({ en: "Documentation", ja: "ドキュメント", zh: "文档" })}
        </h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[var(--text-secondary)]">
          {text({ en: "Architecture and verification documents are included in the repository.", ja: "アーキテクチャと検証文書はリポジトリに含まれています。", zh: "架构与验证文档已包含在代码仓库中。" })}
        </p>
        <Link href="/dashboard" className="mt-10 inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[#e4cc98]">
          <ArrowLeft aria-hidden="true" className="size-4" /> {dictionary.future.returnDashboard}
        </Link>
      </div>
    </main>
  );
}
