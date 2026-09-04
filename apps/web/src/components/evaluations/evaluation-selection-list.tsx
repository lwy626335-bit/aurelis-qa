"use client";

import { useGSAP } from "@gsap/react";
import { CaretRight, CheckCircle, Clock, WarningCircle, XCircle } from "@phosphor-icons/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export type EvaluationListItem = {
  createdAt: string;
  id: string;
  inputType: string;
  projectName: string;
  status: string;
  websiteLabel: string;
};

export type EvaluationSelectionLabels = {
  cancelConfirm: string;
  cancelDescription: string;
  cancelFailed: string;
  cancelPartial: string;
  cancelSelected: string;
  cancelSuccess: string;
  cancelling: string;
  clearSelection: string;
  closeDialog: string;
  confirmTitle: string;
  created: string;
  inputType: string;
  listLabel: string;
  open: string;
  selectAll: string;
  selectItem: string;
  selected: string;
  selectionSummary: string;
  status: string;
  statusLabels: Record<string, string>;
  target: string;
};

type BatchResult = { failed: number; skipped: number; success: number };

function format(template: string, values: Record<string, number | string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function isCancellable(status: string) {
  return status === "QUEUED" || status === "RUNNING";
}

function StatusBadge({ labels, status }: { labels: EvaluationSelectionLabels; status: string }) {
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
      {labels.statusLabels[status] ?? status}
    </span>
  );
}

export function EvaluationSelectionList({
  dateLocale,
  evaluations,
  labels,
}: {
  dateLocale: string;
  evaluations: EvaluationListItem[];
  labels: EvaluationSelectionLabels;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const masterCheckbox = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const selectedItems = useMemo(
    () => evaluations.filter((evaluation) => selected.has(evaluation.id)),
    [evaluations, selected],
  );
  const cancellableItems = selectedItems.filter((evaluation) => isCancellable(evaluation.status));
  const selectedCount = selectedItems.length;
  const cancellableCount = cancellableItems.length;
  const skippedCount = selectedCount - cancellableCount;
  const allSelected = evaluations.length > 0 && selectedCount === evaluations.length;
  const selectionSignature = [...selected].sort().join("|");
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium", timeStyle: "short" }),
    [dateLocale],
  );

  useEffect(() => {
    if (masterCheckbox.current) {
      masterCheckbox.current.indeterminate = selectedCount > 0 && !allSelected;
    }
  }, [allSelected, selectedCount]);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== "function") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const container = root.current;
        if (!container) return;
        const selectionCountElement = container.querySelector("[data-selection-count]");
        const mobileBulkBar = container.querySelector("[data-mobile-bulk-bar]");
        const selectedRows = [...container.querySelectorAll('[data-selection-row][data-selected="true"]')];

        if (selectedCount > 0) {
          if (selectionCountElement) {
            gsap.fromTo(
              selectionCountElement,
              { autoAlpha: 0.65, scale: 0.96 },
              { autoAlpha: 1, scale: 1, duration: 0.18, ease: "power2.out" },
            );
          }
          if (mobileBulkBar) {
            gsap.fromTo(
              mobileBulkBar,
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.22, ease: "power3.out" },
            );
          }
        }
        if (selectedRows.length > 0) {
          gsap.fromTo(
            selectedRows,
            { backgroundColor: "rgba(214,185,120,0.13)", scale: 0.997 },
            { backgroundColor: "rgba(214,185,120,0.045)", scale: 1, duration: 0.18, ease: "power2.out", clearProps: "backgroundColor,scale" },
          );
        }
      });
      return () => media.revert();
    },
    { dependencies: [selectionSignature, selectedCount], revertOnUpdate: true, scope: root },
  );

  function setAll(checked: boolean) {
    setResult(null);
    setSelected(checked ? new Set(evaluations.map((evaluation) => evaluation.id)) : new Set());
  }

  function toggle(id: string, checked: boolean) {
    setResult(null);
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function cancelSelected() {
    setCancelling(true);
    setResult(null);
    const outcomes = await Promise.all(
      cancellableItems.map(async (evaluation) => {
        try {
          const response = await fetch(`/api/evaluations/${evaluation.id}`, { method: "DELETE" });
          return { id: evaluation.id, ok: response.ok };
        } catch {
          return { id: evaluation.id, ok: false };
        }
      }),
    );
    const successfulIds = new Set(outcomes.filter((outcome) => outcome.ok).map((outcome) => outcome.id));
    const nextResult = {
      failed: outcomes.length - successfulIds.size,
      skipped: skippedCount,
      success: successfulIds.size,
    };
    setSelected((current) => new Set([...current].filter((id) => !successfulIds.has(id))));
    setResult(nextResult);
    setCancelling(false);
    setConfirmOpen(false);
    if (successfulIds.size > 0) router.refresh();
  }

  const resultMessage = result
    ? format(
        result.failed === 0 ? labels.cancelSuccess : result.success === 0 ? labels.cancelFailed : labels.cancelPartial,
        result,
      )
    : "";
  const resultTone = result?.failed ? (result.success ? "warning" : "error") : "success";

  return (
    <div className={cn(selectedCount > 0 && "pb-24 sm:pb-0")} ref={root}>
      <div className="panel-flat mt-3 overflow-hidden">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 md:px-5">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 text-xs text-[var(--text-secondary)]">
            <input
              aria-label={labels.selectAll}
              checked={allSelected}
              className="size-4 accent-[var(--accent)]"
              onChange={(event) => setAll(event.target.checked)}
              ref={masterCheckbox}
              type="checkbox"
            />
            <span>{labels.selectAll}</span>
          </label>
          <div className="flex items-center gap-2">
            <span aria-live="polite" className="font-mono text-[10px] text-[var(--text-tertiary)]" data-selection-count>
              {format(labels.selected, { count: selectedCount })}
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <Button className="min-h-9 px-3 text-xs" disabled={selectedCount === 0} onClick={() => setAll(false)} tone="quiet" type="button">
                {labels.clearSelection}
              </Button>
              <Button className="min-h-9 px-3 text-xs" disabled={cancellableCount === 0} onClick={() => setConfirmOpen(true)} tone="danger" type="button">
                {labels.cancelSelected}
              </Button>
            </div>
          </div>
        </div>

        {selectedCount > 0 && (
          <p className="border-b border-white/[0.06] px-4 py-2 text-[10px] text-[var(--text-tertiary)] md:px-5">
            {format(labels.selectionSummary, { cancellable: cancellableCount, skipped: skippedCount })}
          </p>
        )}
        {resultMessage && <div className="border-b border-white/[0.06] px-4 py-3 md:px-5"><AsyncStatus tone={resultTone}>{resultMessage}</AsyncStatus></div>}

        <div className="divide-y divide-white/[0.06] md:hidden">
          {evaluations.map((evaluation) => {
            const isSelected = selected.has(evaluation.id);
            return (
              <div
                className={cn("grid grid-cols-[44px_minmax(0,1fr)] transition-colors", isSelected && "bg-[rgba(214,185,120,0.045)]")}
                data-selected={isSelected}
                data-selection-row
                key={evaluation.id}
              >
                <label className="flex cursor-pointer items-start justify-center py-5">
                  <input
                    aria-label={format(labels.selectItem, { label: evaluation.websiteLabel })}
                    checked={isSelected}
                    className="size-4 accent-[var(--accent)]"
                    onChange={(event) => toggle(evaluation.id, event.target.checked)}
                    type="checkbox"
                  />
                </label>
                <Link className="grid grid-cols-[1fr_auto] gap-3 p-4 pl-0" href={`/dashboard/evaluations/${evaluation.id}`}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{evaluation.websiteLabel}</p>
                    <p className="mt-1 truncate text-[11px] text-[var(--text-tertiary)]">{evaluation.projectName} · {evaluation.inputType}</p>
                    <div className="mt-3"><StatusBadge labels={labels} status={evaluation.status} /></div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-4">
                    <span className="text-[10px] text-[var(--text-tertiary)]">{dateFormatter.format(new Date(evaluation.createdAt))}</span>
                    <CaretRight aria-hidden="true" className="size-4 text-[var(--text-tertiary)]" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block" aria-label={labels.listLabel}>
          <div aria-hidden="true" className="grid grid-cols-[40px_minmax(0,1.5fr)_0.75fr_0.9fr_1fr_auto] border-b border-white/[0.07] px-5 py-3 text-[10px] text-[var(--text-tertiary)]">
            <span />
            <span>{labels.target}</span>
            <span>{labels.inputType}</span>
            <span>{labels.status}</span>
            <span>{labels.created}</span>
            <span />
          </div>
          <div className="divide-y divide-white/[0.055]">
            {evaluations.map((evaluation) => {
              const isSelected = selected.has(evaluation.id);
              return (
                <div
                  className={cn("group grid grid-cols-[40px_minmax(0,1.5fr)_0.75fr_0.9fr_1fr_auto] items-center px-5 transition-colors", isSelected && "bg-[rgba(214,185,120,0.045)]")}
                  data-selected={isSelected}
                  data-selection-row
                  key={evaluation.id}
                >
                  <label className="flex min-h-16 cursor-pointer items-center">
                    <input
                      aria-label={format(labels.selectItem, { label: evaluation.websiteLabel })}
                      checked={isSelected}
                      className="size-4 accent-[var(--accent)]"
                      onChange={(event) => toggle(evaluation.id, event.target.checked)}
                      type="checkbox"
                    />
                  </label>
                  <Link
                    aria-label={`${labels.open}: ${evaluation.websiteLabel}`}
                    className="col-span-5 grid min-h-16 grid-cols-[minmax(0,1.5fr)_0.75fr_0.9fr_1fr_auto] items-center text-sm"
                    href={`/dashboard/evaluations/${evaluation.id}`}
                  >
                    <span className="min-w-0 font-medium">
                      <span className="block truncate">{evaluation.websiteLabel}</span>
                      <span className="mt-1 block truncate text-[10px] font-normal text-[var(--text-tertiary)]">{evaluation.projectName}</span>
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)]">{evaluation.inputType}</span>
                    <StatusBadge labels={labels} status={evaluation.status} />
                    <span className="text-xs text-[var(--text-tertiary)]">{dateFormatter.format(new Date(evaluation.createdAt))}</span>
                    <CaretRight aria-hidden="true" className="size-4 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-white/10 bg-[rgba(20,21,25,0.94)] p-3 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:hidden" data-mobile-bulk-bar>
          <Button className="min-h-10 flex-1 px-3 text-xs" onClick={() => setAll(false)} tone="secondary" type="button">
            {labels.clearSelection}
          </Button>
          <Button className="min-h-10 flex-1 px-3 text-xs" disabled={cancellableCount === 0} onClick={() => setConfirmOpen(true)} tone="danger" type="button">
            {labels.cancelSelected}
          </Button>
        </div>
      )}

      <ConfirmDialog
        busy={cancelling}
        cancelLabel={labels.closeDialog}
        confirmLabel={cancelling ? labels.cancelling : labels.cancelConfirm}
        description={format(labels.cancelDescription, { cancellable: cancellableCount, skipped: skippedCount })}
        onClose={() => !cancelling && setConfirmOpen(false)}
        onConfirm={cancelSelected}
        open={confirmOpen}
        title={labels.confirmTitle}
      />
    </div>
  );
}
