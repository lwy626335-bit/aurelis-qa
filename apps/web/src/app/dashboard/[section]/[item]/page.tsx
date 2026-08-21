import { ArrowLeft, Info } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default async function ItemStatusPage({ params }: { params: Promise<{ section: string; item: string }> }) {
  const { section, item } = await params;
  const phase = section === "evaluations" || section === "brands" ? 2 : 6;
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <Info aria-hidden="true" className="size-7 text-[var(--accent)]" />
        <div className="mt-8 flex items-center justify-between gap-4 font-mono text-[10px] text-[var(--text-tertiary)]">
          <p>{section.toUpperCase()} / {item}</p>
          <span>Phase {phase}</span>
        </div>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">Detail view not implemented</h1>
        <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">Detailed evidence and workflow routes are scheduled for a later phase. No live result exists at this address.</p>
        <Link href="/dashboard" className="mt-9 inline-flex items-center gap-2 text-sm text-[var(--accent)]"><ArrowLeft aria-hidden="true" className="size-4" /> Return to overview</Link>
      </div>
    </main>
  );
}
