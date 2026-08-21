import { ArrowLeft, Info } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { getDictionary } from "@/i18n/server";

export default async function ItemStatusPage({ params }: { params: Promise<{ section: string; item: string }> }) {
  const { section, item } = await params;
  const { dictionary } = await getDictionary();
  const phase = section === "brands" ? 4 : 6;
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-5 md:p-8">
      <div className="panel-flat w-full max-w-2xl p-7 md:p-10">
        <Info aria-hidden="true" className="size-7 text-[var(--accent)]" />
        <div className="mt-8 flex items-center justify-between gap-4 font-mono text-[10px] text-[var(--text-tertiary)]">
          <p>{section.toUpperCase()} / {item}</p>
          <span>Phase {phase}</span>
        </div>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{dictionary.future.title}</h1>
        <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">{dictionary.future.body}</p>
        <Link href="/dashboard" className="mt-9 inline-flex items-center gap-2 text-sm text-[var(--accent)]"><ArrowLeft aria-hidden="true" className="size-4" /> {dictionary.future.returnDashboard}</Link>
      </div>
    </main>
  );
}
