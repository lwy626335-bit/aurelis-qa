import { demoReport } from "@aurelis/database/demo";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDemoContent } from "@/components/dashboard/demo-content";
import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary } from "@/i18n/server";

export default async function DemoFindingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale } = await getDictionary();
  const content = getDemoContent(locale);
  const issue = content.issues.find((item) => item.id === id);
  if (!issue || !demoReport.issues.some((item) => item.id === id)) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10">
      <Link className="interactive-control inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] text-xs text-[var(--text-tertiary)] hover:text-[var(--text)]" href="/dashboard/demo">
        <ArrowLeft aria-hidden="true" className="size-4" /> {content.backToDemo}
      </Link>
      <article className="panel dashboard-grid-surface mt-6 overflow-hidden p-6 md:p-9">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[6px] border border-white/10 px-2.5 py-1 font-mono text-[10px] text-[var(--text-secondary)]">{issue.severityLabel}</span>
            <span className="font-mono text-[9px] text-[var(--accent)]">{content.modeLabel}</span>
          </div>
          <h1 className="mt-8 max-w-3xl text-3xl font-medium tracking-[-0.04em] md:text-5xl">{issue.title}</h1>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">{issue.dimensionLabel}</p>
          <dl className="mt-9 grid gap-7 border-t border-white/[0.08] pt-7 md:grid-cols-2">
            <div><dt className="font-mono text-[10px] text-[var(--accent)]">{content.issueEvidence}</dt><dd className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{issue.evidence}</dd></div>
            <div><dt className="font-mono text-[10px] text-[var(--accent)]">{content.issueRecommendation}</dt><dd className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{issue.recommendation}</dd></div>
          </dl>
          <div className="mt-9 border-t border-white/[0.08] pt-6">
            <ButtonLink href="/dashboard/evaluations/new">{content.runThisCheck}<ArrowRight aria-hidden="true" className="ml-2 size-4" /></ButtonLink>
          </div>
        </div>
      </article>
    </main>
  );
}
