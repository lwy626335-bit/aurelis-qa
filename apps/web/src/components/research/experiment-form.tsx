"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { localize, type Locale } from "@/i18n/config";

export function ExperimentForm({ evaluations, locale }: { evaluations: { id: string; label: string }[]; locale: Locale }) {
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const unavailable = evaluations.length === 0;

  async function submit(data: FormData) {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/experiments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          runCount: Number(data.get("runCount")),
          sourceEvaluationId: data.get("sourceEvaluationId"),
        }),
      });
      if (!response.ok) {
        setError(text({ en: "Could not create the experiment.", ja: "実験を作成できません。", zh: "无法创建实验。" }));
        return;
      }
      router.refresh();
    } catch {
      setError(text({ en: "Could not create the experiment.", ja: "実験を作成できません。", zh: "无法创建实验。" }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
      <label className="text-xs text-[var(--text-secondary)]">
        {text({ en: "Experiment name", ja: "実験名", zh: "实验名称" })}
        <input className="field mt-2" maxLength={100} minLength={2} name="name" required />
      </label>
      <label className="text-xs text-[var(--text-secondary)]">
        {text({ en: "Source evaluation", ja: "基準評価", zh: "基准评估" })}
        <select className="field mt-2" disabled={unavailable} name="sourceEvaluationId" required>
          {unavailable
            ? <option value="">{text({ en: "No evaluations available", ja: "利用可能な評価がありません", zh: "没有可用的评估" })}</option>
            : evaluations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-xs text-[var(--text-secondary)]">
        {text({ en: "Runs", ja: "実行回数", zh: "运行次数" })}
        <input className="field mt-2" defaultValue={3} max={10} min={1} name="runCount" required type="number" />
      </label>
      <Button busy={submitting} disabled={unavailable}>
        {submitting ? text({ en: "Creating…", ja: "作成中…", zh: "正在创建…" }) : text({ en: "Create", ja: "作成", zh: "创建" })}
        {!submitting && <ArrowRight aria-hidden="true" className="ml-2 size-4" />}
      </Button>
      {error && <div className="md:col-span-4"><AsyncStatus tone="error">{error}</AsyncStatus></div>}
    </form>
  );
}
