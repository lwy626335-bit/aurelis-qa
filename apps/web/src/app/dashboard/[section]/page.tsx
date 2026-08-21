import { ArrowLeft, LockKey } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const sections = {
  evaluations: { title: "Evaluations", phase: 2, description: "URL and HTML evaluation workflows arrive in Phase 2. No audit job is running." },
  brands: { title: "Brand profiles", phase: 2, description: "Brand profile creation and reference corpus management arrive in Phase 2 and Phase 4." },
  history: { title: "Evaluation history", phase: 6, description: "Persistent history, comparison, and trend analysis arrive in Phase 6." },
  rubrics: { title: "Rubric management", phase: 6, description: "Versioned rubric editing and weight management arrive in Phase 6." },
  research: { title: "Research mode", phase: 6, description: "Experiment runs, variance analysis, and reproducibility controls arrive in Phase 6." },
  documentation: { title: "Documentation", phase: 1, description: "Phase 1 architecture and verification documents are included in the repository." },
  privacy: { title: "Privacy", phase: 2, description: "The full data retention interface arrives before live evaluations are enabled." },
} as const;

type Section = keyof typeof sections;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const item = sections[section as Section];
  return { title: item?.title ?? "Not found" };
}

export default async function PhaseStatusPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections[section as Section];
  if (!item) notFound();

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <LockKey aria-hidden="true" className="size-7 text-[var(--accent)]" weight="light" />
          <span className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] text-[var(--text-tertiary)]">Phase {item.phase}</span>
        </div>
        <h1 className="mt-10 text-4xl font-medium tracking-[-0.045em] md:text-5xl">{item.title}</h1>
        <p className="mt-5 max-w-[52ch] text-base leading-7 text-[var(--text-secondary)]">{item.description}</p>
        <div className="mt-8 border-l-2 border-[var(--accent)]/55 pl-4">
          <p className="text-sm font-medium text-[var(--text)]">Not implemented</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">This page does not simulate a successful workflow or return fabricated API results.</p>
        </div>
        <Link href="/dashboard" className="mt-10 inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[#e4cc98]">
          <ArrowLeft aria-hidden="true" className="size-4" /> Return to overview
        </Link>
      </div>
    </main>
  );
}
