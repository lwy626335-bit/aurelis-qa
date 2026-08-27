import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Database,
  MagnifyingGlass,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { InteractiveRow } from "@/components/ui/interactive-row";
import { listEvaluations } from "@/features/evaluations/service";
import { localeCode, localize, type Dictionary } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const statuses = ["ALL", "QUEUED", "RUNNING", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"] as const;

function statusLabel(status: string, copy: Dictionary["evaluations"]) {
  if (status === "QUEUED") return copy.queued;
  if (status === "RUNNING") return copy.running;
  if (status === "COMPLETED") return copy.completed;
  if (status === "PARTIAL") return copy.partial;
  if (status === "FAILED") return copy.failed;
  if (status === "CANCELLED") return copy.cancelled;
  return status;
}

function StatusBadge({ status, copy }: { status: string; copy: Dictionary["evaluations"] }) {
  const tone =
    status === "COMPLETED"
      ? "border-[rgba(112,214,165,0.2)] bg-[rgba(112,214,165,0.07)] text-[var(--success)]"
      : status === "FAILED"
        ? "border-[rgba(237,116,116,0.22)] bg-[rgba(237,116,116,0.07)] text-[var(--critical)]"
        : status === "CANCELLED"
          ? "border-white/[0.09] bg-white/[0.03] text-[var(--text-tertiary)]"
          : "border-[rgba(232,196,107,0.2)] bg-[rgba(232,196,107,0.06)] text-[var(--warning)]";
  const Icon =
    status === "COMPLETED"
      ? CheckCircle
      : status === "FAILED"
        ? WarningCircle
        : status === "CANCELLED"
          ? XCircle
          : Clock;

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-[6px] border px-2 py-1 font-mono text-[9px] ${tone}`}>
      <Icon aria-hidden="true" className="size-3" weight={status === "COMPLETED" ? "fill" : "regular"} />
      {statusLabel(status, copy)}
    </span>
  );
}

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { dictionary, locale } = await getDictionary();
  const copy = dictionary.evaluations;
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const query = await searchParams;
  const search = query.q?.trim() ?? "";
  const selectedStatus = statuses.includes(query.status as (typeof statuses)[number]) ? query.status! : "ALL";
  let evaluations: Awaited<ReturnType<typeof listEvaluations>> = [];
  let unavailable = false;

  try {
    evaluations = await listEvaluations();
  } catch {
    unavailable = true;
  }

  const normalizedSearch = search.toLocaleLowerCase(localeCode(locale));
  const filtered = evaluations.filter((evaluation) => {
    const matchesStatus = selectedStatus === "ALL" || evaluation.status === selectedStatus;
    const searchable = `${evaluation.website.label} ${evaluation.project.name} ${evaluation.inputType}`.toLocaleLowerCase();
    return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const visibleEvaluations = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dateFormatter = new Intl.DateTimeFormat(localeCode(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function pageHref(pageNumber: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    params.set("page", String(pageNumber));
    return `/dashboard/evaluations?${params.toString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-7 md:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-medium tracking-[-0.045em]">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{copy.description}</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]" href="/dashboard/evaluations/new">
          {copy.createTitle}<ArrowRight aria-hidden="true" className="ml-2 size-4" />
        </Link>
      </div>

      <form className="mt-7 grid gap-3 border-y border-white/[0.08] py-4 md:grid-cols-[minmax(0,1fr)_190px_auto_auto]" method="get">
        <label className="relative">
          <span className="sr-only">{text({ en: "Search evaluations", ja: "評価を検索", zh: "搜索评估" })}</span>
          <MagnifyingGlass aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input className="field pl-10" defaultValue={search} name="q" placeholder={text({ en: "Search target or project", ja: "対象またはプロジェクトを検索", zh: "搜索评估对象或项目" })} />
        </label>
        <label>
          <span className="sr-only">{text({ en: "Filter by status", ja: "状態で絞り込む", zh: "按状态筛选" })}</span>
          <select className="field" defaultValue={selectedStatus} name="status">
            {statuses.map((status) => (
              <option key={status} value={status}>{status === "ALL" ? text({ en: "All statuses", ja: "すべての状態", zh: "全部状态" }) : statusLabel(status, copy)}</option>
            ))}
          </select>
        </label>
        <button className="min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-medium text-[#17140d]" type="submit">
          {text({ en: "Apply", ja: "適用", zh: "应用" })}
        </button>
        {(search || selectedStatus !== "ALL") && (
          <Link className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-white/10 px-4 text-sm text-[var(--text-secondary)]" href="/dashboard/evaluations">
            {text({ en: "Clear", ja: "クリア", zh: "清除" })}
          </Link>
        )}
      </form>

      {unavailable ? (
        <div className="panel-flat mt-5 p-6 text-sm text-[var(--critical)]" role="alert">{copy.databaseUnavailable}</div>
      ) : evaluations.length === 0 ? (
        <div className="panel-flat mt-5 grid min-h-64 place-items-center p-7 text-center">
          <div>
            <Database aria-hidden="true" className="mx-auto size-7 text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-medium">{copy.empty}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{copy.emptyBody}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5 border-y border-white/[0.08] py-14 text-center">
          <MagnifyingGlass aria-hidden="true" className="mx-auto size-6 text-[var(--text-tertiary)]" />
          <h2 className="mt-4 text-lg font-medium">{text({ en: "No matching evaluations", ja: "一致する評価がありません", zh: "没有匹配的评估" })}</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{text({ en: "Change the search term or status filter.", ja: "検索語または状態フィルターを変更してください。", zh: "请修改搜索词或状态筛选条件。" })}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <p>{text({ en: `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`, ja: `${filtered.length} 件`, zh: `${filtered.length} 条结果` })}</p>
            <p>{text({ en: `Page ${page} of ${totalPages}`, ja: `${page} / ${totalPages} ページ`, zh: `第 ${page} 页，共 ${totalPages} 页` })}</p>
          </div>

          <div className="panel-flat mt-3 divide-y divide-white/[0.06] md:hidden">
            {visibleEvaluations.map((evaluation) => (
              <InteractiveRow className="grid grid-cols-[1fr_auto] gap-3 rounded-none p-4" href={`/dashboard/evaluations/${evaluation.id}`} key={evaluation.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{evaluation.website.label}</p>
                  <p className="mt-1 truncate text-[11px] text-[var(--text-tertiary)]">{evaluation.project.name} · {evaluation.inputType}</p>
                  <div className="mt-3"><StatusBadge copy={copy} status={evaluation.status} /></div>
                </div>
                <div className="flex flex-col items-end justify-between gap-4">
                  <span className="text-[10px] text-[var(--text-tertiary)]">{dateFormatter.format(evaluation.createdAt)}</span>
                  <CaretRight aria-hidden="true" className="size-4 text-[var(--text-tertiary)]" />
                </div>
              </InteractiveRow>
            ))}
          </div>

          <div className="panel-flat mt-3 hidden overflow-hidden md:block" aria-label={dictionary.dashboard.recentTable}>
            <div aria-hidden="true" className="grid grid-cols-[minmax(0,1.5fr)_0.75fr_0.9fr_1fr_auto] border-b border-white/[0.07] px-5 py-3 text-[10px] text-[var(--text-tertiary)]">
              <span>{dictionary.dashboard.target}</span>
              <span>{copy.inputType}</span>
              <span>{dictionary.dashboard.status}</span>
              <span>{copy.created}</span>
              <span />
            </div>
            <div className="divide-y divide-white/[0.055]">
              {visibleEvaluations.map((evaluation) => (
                <InteractiveRow
                  aria-label={`${dictionary.dashboard.open}: ${evaluation.website.label}`}
                  className="group grid grid-cols-[minmax(0,1.5fr)_0.75fr_0.9fr_1fr_auto] items-center rounded-none px-5 py-4 text-sm"
                  href={`/dashboard/evaluations/${evaluation.id}`}
                  key={evaluation.id}
                >
                  <span className="min-w-0 font-medium">
                    <span className="block truncate">{evaluation.website.label}</span>
                    <span className="mt-1 block truncate text-[10px] font-normal text-[var(--text-tertiary)]">{evaluation.project.name}</span>
                  </span>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">{evaluation.inputType}</span>
                  <StatusBadge copy={copy} status={evaluation.status} />
                  <span className="text-xs text-[var(--text-tertiary)]">{dateFormatter.format(evaluation.createdAt)}</span>
                  <CaretRight aria-hidden="true" className="size-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </InteractiveRow>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <nav aria-label={text({ en: "Evaluation pages", ja: "評価ページ", zh: "评估分页" })} className="mt-5 flex justify-end gap-2">
              <Link aria-disabled={page === 1} className={`inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-control)] border border-white/10 px-3 text-xs ${page === 1 ? "pointer-events-none opacity-40" : "text-[var(--text-secondary)]"}`} href={pageHref(Math.max(1, page - 1))}>
                <CaretLeft aria-hidden="true" className="size-3.5" /> {text({ en: "Previous", ja: "前へ", zh: "上一页" })}
              </Link>
              <Link aria-disabled={page === totalPages} className={`inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-control)] border border-white/10 px-3 text-xs ${page === totalPages ? "pointer-events-none opacity-40" : "text-[var(--text-secondary)]"}`} href={pageHref(Math.min(totalPages, page + 1))}>
                {text({ en: "Next", ja: "次へ", zh: "下一页" })} <CaretRight aria-hidden="true" className="size-3.5" />
              </Link>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
