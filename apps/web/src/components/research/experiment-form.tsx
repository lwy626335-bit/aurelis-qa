"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function ExperimentForm({ evaluations, locale }: { evaluations: { id: string; label: string }[]; locale: Locale }) {
  const ja = locale === "ja"; const router = useRouter(); const [error, setError] = useState("");
  async function submit(data: FormData) { const response = await fetch("/api/experiments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: data.get("name"), runCount: Number(data.get("runCount")), sourceEvaluationId: data.get("sourceEvaluationId") }) }); if (!response.ok) { setError(ja ? "Experimentを作成できません。" : "Could not create the experiment."); return; } router.refresh(); }
  return <form action={submit} className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end"><label className="text-xs text-[var(--text-secondary)]">{ja ? "Experiment名" : "Experiment name"}<input className="field mt-2" name="name" required /></label><label className="text-xs text-[var(--text-secondary)]">{ja ? "基準評価" : "Source evaluation"}<select className="field mt-2" name="sourceEvaluationId" required>{evaluations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="text-xs text-[var(--text-secondary)]">Runs<input className="field mt-2" defaultValue={3} max={10} min={1} name="runCount" type="number" /></label><button className="min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm text-[#17140d]">{ja ? "作成" : "Create"}</button>{error && <p className="text-xs text-[var(--critical)] md:col-span-4">{error}</p>}</form>;
}
