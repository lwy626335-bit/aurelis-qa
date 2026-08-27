"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { localize, type Locale } from "@/i18n/config";

export function RubricForm({ locale }: { locale: Locale }) {
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);

  async function submit(data: FormData) {
    const dimensions = String(data.get("dimensions") ?? "").split("\n").filter(Boolean).map((line) => { const [key = "", label = "", weight = "", maxScore = "100"] = line.split(",").map((item) => item.trim()); return { key, label, maxScore: Number(maxScore), weight: Number(weight) }; });
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/rubrics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ description: String(data.get("description") ?? "") || null, dimensions, name: data.get("name"), version: data.get("version") }) });
      if (!response.ok) throw new Error("Invalid rubric");
      setTone("success");
      setMessage(text({ en: "Saved a new immutable version.", ja: "新しい変更不可のVersionを保存しました。", zh: "已保存新的不可变版本。" }));
      router.refresh();
    } catch {
      setTone("error");
      setMessage(text({ en: "Check the unique version and weights (total 1.0).", ja: "Version名とWeightの合計（1.0）を確認してください。", zh: "请检查唯一版本名以及权重总和（应为 1.0）。" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-[var(--text-secondary)]">{text({ en: "Name", ja: "名称", zh: "名称" })}<input className="field mt-2" name="name" required /></label>
        <label className="text-xs text-[var(--text-secondary)]">Version<input className="field mt-2 font-mono" name="version" placeholder="research-v1.0" required /></label>
      </div>
      <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "Description", ja: "説明", zh: "说明" })}<input className="field mt-2" name="description" /></label>
      <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "One per line: key, label, weight, maxScore", ja: "各行: key, label, weight, maxScore", zh: "每行一项：key, label, weight, maxScore" })}<textarea className="field mt-2 min-h-36 font-mono" defaultValue={"technical, Technical, 0.6, 100\nbrand, Brand, 0.4, 100"} name="dimensions" required /></label>
      <Button busy={busy}>{text({ en: "Create version", ja: "Version作成", zh: "创建版本" })}</Button>
      {message && <AsyncStatus tone={tone}>{message}</AsyncStatus>}
    </form>
  );
}
