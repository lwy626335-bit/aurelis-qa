"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function RubricForm({ locale }: { locale: Locale }) {
  const ja = locale === "ja"; const router = useRouter(); const [message, setMessage] = useState("");
  async function submit(data: FormData) {
    const dimensions = String(data.get("dimensions") ?? "").split("\n").filter(Boolean).map((line) => { const [key = "", label = "", weight = "", maxScore = "100"] = line.split(",").map((item) => item.trim()); return { key, label, maxScore: Number(maxScore), weight: Number(weight) }; });
    const response = await fetch("/api/rubrics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ description: String(data.get("description") ?? "") || null, dimensions, name: data.get("name"), version: data.get("version") }) });
    if (!response.ok) { setMessage(ja ? "VersionとWeight（合計1.0）を確認してください。" : "Check the unique version and weights (total 1.0)."); return; }
    router.refresh(); setMessage(ja ? "新しい不変Versionを保存しました。" : "Saved a new immutable version.");
  }
  return <form action={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-[var(--text-secondary)]">{ja ? "名称" : "Name"}<input className="field mt-2" name="name" required /></label><label className="text-xs text-[var(--text-secondary)]">Version<input className="field mt-2 font-mono" name="version" placeholder="research-v1.0" required /></label></div><label className="block text-xs text-[var(--text-secondary)]">{ja ? "説明" : "Description"}<input className="field mt-2" name="description" /></label><label className="block text-xs text-[var(--text-secondary)]">{ja ? "各行: key, label, weight, maxScore" : "One per line: key, label, weight, maxScore"}<textarea className="field mt-2 min-h-36 font-mono" defaultValue={"technical, Technical, 0.6, 100\nbrand, Brand, 0.4, 100"} name="dimensions" required /></label><button className="min-h-10 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm text-[#17140d]">{ja ? "Version作成" : "Create version"}</button>{message && <p className="text-xs text-[var(--text-secondary)]" role="status">{message}</p>}</form>;
}
