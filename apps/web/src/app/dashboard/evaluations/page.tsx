import { ArrowRight, Database } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { listEvaluations } from "@/features/evaluations/service";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function EvaluationsPage() {
  const { dictionary, locale } = await getDictionary();
  const copy = dictionary.evaluations;
  let evaluations: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;
  try {
    evaluations = await listEvaluations();
  } catch {
    unavailable = true;
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)] uppercase">Phase 2</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em]">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{copy.description}</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]" href="/dashboard/evaluations/new">
          {copy.createTitle}<ArrowRight aria-hidden="true" className="ml-2 size-4" />
        </Link>
      </div>

      {unavailable ? (
        <div className="panel-flat mt-7 p-6 text-sm text-[var(--critical)]" role="alert">{copy.databaseUnavailable}</div>
      ) : evaluations.length === 0 ? (
        <div className="panel-flat mt-7 grid min-h-64 place-items-center p-7 text-center">
          <div>
            <Database aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-medium">{copy.empty}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{copy.emptyBody}</p>
          </div>
        </div>
      ) : (
        <div className="panel-flat mt-7 overflow-x-auto" tabIndex={0} aria-label={dictionary.dashboard.recentTable}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/[0.07] text-[10px] text-[var(--text-tertiary)]">
              <tr>
                <th className="px-5 py-3 font-normal">{dictionary.dashboard.target}</th>
                <th className="px-4 py-3 font-normal">{copy.inputType}</th>
                <th className="px-4 py-3 font-normal">{dictionary.dashboard.status}</th>
                <th className="px-4 py-3 font-normal">{copy.created}</th>
                <th className="px-5 py-3"><span className="sr-only">{dictionary.dashboard.open}</span></th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr className="border-b border-white/[0.055] last:border-0 hover:bg-white/[0.02]" key={evaluation.id}>
                  <th className="px-5 py-4 font-medium" scope="row">{evaluation.website.label}</th>
                  <td className="px-4 py-4 font-mono text-xs text-[var(--text-secondary)]">{evaluation.inputType}</td>
                  <td className="px-4 py-4 text-[var(--warning)]">{evaluation.status}</td>
                  <td className="px-4 py-4 text-xs text-[var(--text-tertiary)]">{dateFormatter.format(evaluation.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link className="text-xs text-[var(--accent)]" href={`/dashboard/evaluations/${evaluation.id}`}>{dictionary.dashboard.open}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
