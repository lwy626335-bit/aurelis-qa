import { ArrowLeft, LockKey } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

const sections = {
  brands: { title: { en: "Brand profiles", ja: "ブランドProfile", zh: "品牌资料" }, description: { en: "Create brand profiles and manage their reference corpora.", ja: "ブランドProfileを作成し、Reference Corpusを管理します。", zh: "创建品牌资料并管理其参考语料。" } },
  history: { title: { en: "Evaluation history", ja: "評価履歴", zh: "评估历史" }, description: { en: "Inspect persistent history, comparisons, and score trends.", ja: "永続化された履歴、比較、スコア推移を確認します。", zh: "查看已保存的历史、对比与分数趋势。" } },
  rubrics: { title: { en: "Rubric management", ja: "Rubric管理", zh: "评分规则管理" }, description: { en: "Manage versioned rubrics and their scoring weights.", ja: "バージョン付きRubricと採点Weightを管理します。", zh: "管理带版本的评分规则及其权重。" } },
  research: { title: { en: "Research mode", ja: "研究モード", zh: "研究模式" }, description: { en: "Run repeated experiments and inspect reproducibility data.", ja: "反復Experimentを実行し、再現性データを確認します。", zh: "运行重复实验并检查可复现性数据。" } },
  documentation: { title: { en: "Documentation", ja: "ドキュメント", zh: "文档" }, description: { en: "Architecture and verification documents are included in the repository.", ja: "アーキテクチャと検証文書はリポジトリに含まれています。", zh: "架构与验证文档已包含在代码仓库中。" } },
  privacy: { title: { en: "Privacy", ja: "プライバシー", zh: "隐私" }, description: { en: "Review data retention, model use, and deletion behavior.", ja: "データ保存、モデル利用、削除動作を確認します。", zh: "查看数据保留、模型使用与删除方式。" } },
} as const;

type Section = keyof typeof sections;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const item = sections[section as Section];
  const { locale } = await getDictionary();
  return { title: item ? localize(locale, item.title) : "Not found" };
}

export default async function SectionStatusPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section as Section];
  if (!item) notFound();
  const { dictionary, locale } = await getDictionary();

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <LockKey aria-hidden="true" className="size-7 text-[var(--accent)]" weight="light" />
        <h1 className="mt-10 text-4xl font-medium tracking-[-0.045em] md:text-5xl">{localize(locale, item.title)}</h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[var(--text-secondary)]">{localize(locale, item.description)}</p>
        <div className="mt-8 border-l-2 border-[var(--accent)]/55 pl-4">
          <p className="text-sm font-medium text-[var(--text)]">{dictionary.future.title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{dictionary.future.body}</p>
        </div>
        <Link href="/dashboard" className="mt-10 inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[#e4cc98]">
          <ArrowLeft aria-hidden="true" className="size-4" /> {dictionary.future.returnDashboard}
        </Link>
      </div>
    </main>
  );
}
