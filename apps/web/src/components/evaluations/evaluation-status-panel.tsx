"use client";

import { useGSAP } from "@gsap/react";
import { CheckCircle, Circle, WarningCircle } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { localize, type Locale } from "@/i18n/config";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export type EvaluationStatusSnapshot = {
  evaluationStatus: "QUEUED" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED";
  jobStatus: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | null;
  stage: string | null;
  attemptCount: number;
  maxAttempts: number;
  hasTechnicalResult: boolean;
  hasBrandResult: boolean;
  hasBrandTarget: boolean;
  hasVisualResult: boolean;
  failureCode: string | null;
  failureMessage: string | null;
};

const terminalStatuses = new Set<EvaluationStatusSnapshot["evaluationStatus"]>([
  "COMPLETED",
  "PARTIAL",
  "FAILED",
  "CANCELLED",
]);

function resultSignature(snapshot: EvaluationStatusSnapshot) {
  return `${snapshot.evaluationStatus}:${snapshot.hasTechnicalResult}:${snapshot.hasVisualResult}:${snapshot.hasBrandResult}`;
}

export function EvaluationStatusPanel({
  evaluationId,
  initialSnapshot,
  locale,
}: {
  evaluationId: string;
  initialSnapshot: EvaluationStatusSnapshot;
  locale: Locale;
}) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const latestResult = useRef(resultSignature(initialSnapshot));
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (terminalStatuses.has(initialSnapshot.evaluationStatus)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (delay: number) => {
      if (!cancelled && document.visibilityState === "visible") {
        timer = setTimeout(poll, delay);
      }
    };

    const poll = async () => {
      if (cancelled || document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/evaluations/${evaluationId}/status`, { cache: "no-store" });
        if (!response.ok) throw new Error("Status unavailable");
        const result = await response.json() as { snapshot: EvaluationStatusSnapshot };
        if (cancelled) return;

        setSnapshot(result.snapshot);
        setSyncError("");
        const nextSignature = resultSignature(result.snapshot);
        if (nextSignature !== latestResult.current) {
          latestResult.current = nextSignature;
          router.refresh();
        }
        if (!terminalStatuses.has(result.snapshot.evaluationStatus)) schedule(1600);
      } catch {
        if (cancelled) return;
        setSyncError(localize(locale, {
          en: "The latest status is unavailable. Retrying automatically.",
          ja: "最新状態を取得できません。自動的に再試行します。",
          zh: "暂时无法获取最新状态，系统会自动重试。",
        }));
        schedule(5000);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void poll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    schedule(1200);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [evaluationId, initialSnapshot.evaluationStatus, locale, router]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-status-card]",
        { autoAlpha: 0.72, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.035, clearProps: "transform,opacity,visibility" },
      );
    },
    {
      dependencies: [snapshot.evaluationStatus, snapshot.hasTechnicalResult, snapshot.hasVisualResult, snapshot.hasBrandResult],
      revertOnUpdate: true,
      scope: root,
    },
  );

  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const statusLabels = text({
    en: { QUEUED: "Queued", RUNNING: "Running", COMPLETED: "Completed", PARTIAL: "Partially complete", FAILED: "Failed", CANCELLED: "Cancelled" },
    ja: { QUEUED: "待機中", RUNNING: "評価中", COMPLETED: "完了", PARTIAL: "一部完了", FAILED: "失敗", CANCELLED: "キャンセル済み" },
    zh: { QUEUED: "等待中", RUNNING: "评估中", COMPLETED: "已完成", PARTIAL: "部分完成", FAILED: "失败", CANCELLED: "已取消" },
  });
  const running = snapshot.evaluationStatus === "RUNNING";
  const stages = [
    { complete: true, active: false, label: text({ en: "Input stored", ja: "入力を保存", zh: "输入已保存" }) },
    {
      complete: snapshot.hasTechnicalResult,
      active: running && !snapshot.hasTechnicalResult,
      label: snapshot.hasTechnicalResult
        ? text({ en: "Technical evaluation complete", ja: "技術評価を完了", zh: "技术评估已完成" })
        : text({ en: "Technical evaluation", ja: "技術評価", zh: "技术评估" }),
    },
    {
      complete: snapshot.hasVisualResult,
      active: running && snapshot.hasTechnicalResult && !snapshot.hasVisualResult,
      label: snapshot.hasVisualResult
        ? text({ en: "Visual evaluation complete", ja: "ビジュアル評価を完了", zh: "视觉评估已完成" })
        : text({ en: "Visual evaluation", ja: "ビジュアル評価", zh: "视觉评估" }),
    },
    {
      complete: !snapshot.hasBrandTarget || snapshot.hasBrandResult,
      active: running && snapshot.hasVisualResult && snapshot.hasBrandTarget && !snapshot.hasBrandResult,
      label: !snapshot.hasBrandTarget
        ? text({ en: "Brand evaluation not requested", ja: "ブランド評価は未指定", zh: "未请求品牌评估" })
        : snapshot.hasBrandResult
        ? text({ en: "Brand evaluation complete", ja: "ブランド評価を完了", zh: "品牌评估已完成" })
        : text({ en: "Brand evaluation", ja: "ブランド評価", zh: "品牌评估" }),
    },
  ];

  return (
    <section aria-label={text({ en: "Evaluation progress", ja: "評価の進行状況", zh: "评估进度" })} className="mt-7" ref={root}>
      <div className="flex flex-wrap items-center justify-between gap-3" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(232,196,107,0.2)] bg-[rgba(232,196,107,0.07)] px-3 py-1.5 font-mono text-xs text-[var(--warning)]">
          {(snapshot.evaluationStatus === "QUEUED" || snapshot.evaluationStatus === "RUNNING") && (
            <span aria-hidden="true" className="status-pulse size-1.5 rounded-full bg-current" />
          )}
          {statusLabels[snapshot.evaluationStatus]}
        </span>
        {snapshot.jobStatus === "RUNNING" && snapshot.maxAttempts > 0 && (
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
            {text({
              en: `Attempt ${snapshot.attemptCount}/${snapshot.maxAttempts}`,
              ja: `試行 ${snapshot.attemptCount}/${snapshot.maxAttempts}`,
              zh: `尝试 ${snapshot.attemptCount}/${snapshot.maxAttempts}`,
            })}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => (
          <article className="panel-flat min-h-36 p-5" data-status-card key={stage.label}>
            {stage.complete ? (
              <CheckCircle aria-hidden="true" className="size-5 text-[var(--success)]" weight="fill" />
            ) : stage.active ? (
              <span aria-hidden="true" className="status-pulse block size-4 rounded-full border border-[var(--accent)] bg-[rgba(214,185,120,0.18)]" />
            ) : snapshot.evaluationStatus === "FAILED" ? (
              <WarningCircle aria-hidden="true" className="size-5 text-[var(--warning)]" />
            ) : (
              <Circle aria-hidden="true" className="size-5 text-[var(--text-tertiary)]" />
            )}
            <p className="mt-7 text-sm leading-6 text-[var(--text-secondary)]">{stage.label}</p>
            {stage.active && <p className="mt-1 text-[10px] text-[var(--accent)]">{text({ en: "In progress", ja: "処理中", zh: "处理中" })}</p>}
          </article>
        ))}
      </div>

      {syncError && <div className="mt-4"><AsyncStatus tone="warning">{syncError}</AsyncStatus></div>}
    </section>
  );
}
