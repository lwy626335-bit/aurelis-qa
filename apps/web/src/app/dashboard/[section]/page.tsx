import { ArrowLeft, LockKey } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/server";

const sections = {
  brands: { title: ["Brand profiles", "ブランドProfile"], phase: 4, description: ["Brand profile creation and reference corpus management arrive in Phase 4.", "ブランドProfileとReference Corpus管理はPhase 4で実装します。"] },
  history: { title: ["Evaluation history", "評価履歴"], phase: 6, description: ["Persistent history, comparison, and trend analysis arrive in Phase 6.", "永続履歴、比較、トレンド分析はPhase 6で実装します。"] },
  rubrics: { title: ["Rubric management", "Rubric管理"], phase: 6, description: ["Versioned rubric editing and weight management arrive in Phase 6.", "バージョン付きRubric編集と重み管理はPhase 6で実装します。"] },
  research: { title: ["Research mode", "研究モード"], phase: 6, description: ["Experiment runs, variance analysis, and reproducibility controls arrive in Phase 6.", "Experiment Run、分散分析、再現性管理はPhase 6で実装します。"] },
  documentation: { title: ["Documentation", "ドキュメント"], phase: 1, description: ["Architecture and verification documents are included in the repository.", "アーキテクチャと検証文書はリポジトリに含まれています。"] },
  privacy: { title: ["Privacy", "プライバシー"], phase: 7, description: ["The complete retention and deletion interface arrives during production hardening.", "完全な保存・削除画面はProduction Hardeningで実装します。"] },
} as const;

type Section = keyof typeof sections;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const item = sections[section as Section];
  const { locale } = await getDictionary();
  return { title: item?.title[locale === "ja" ? 1 : 0] ?? "Not found" };
}

export default async function PhaseStatusPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section as Section];
  if (!item) notFound();
  const { dictionary, locale } = await getDictionary();
  const index = locale === "ja" ? 1 : 0;

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <LockKey aria-hidden="true" className="size-7 text-[var(--accent)]" weight="light" />
          <span className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] text-[var(--text-tertiary)]">Phase {item.phase}</span>
        </div>
        <h1 className="mt-10 text-4xl font-medium tracking-[-0.045em] md:text-5xl">{item.title[index]}</h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[var(--text-secondary)]">{item.description[index]}</p>
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
