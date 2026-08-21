"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/i18n/config";

const splitList = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

export function BrandForm({ locale }: { locale: Locale }) {
  const ja = locale === "ja";
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    const examples = String(formData.get("examples") ?? "").split(/\n---\n/).map((content, index) => ({ content: content.trim(), label: `Example ${index + 1}` })).filter((item) => item.content);
    const referenceContent = String(formData.get("referenceContent") ?? "").trim();
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
    const response = await fetch("/api/brands", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      description: formData.get("description"), examples, forbiddenVocabulary: splitList(formData.get("forbiddenVocabulary")), language: formData.get("language"), name: formData.get("name"), personalities: splitList(formData.get("personalities")), preferredVocabulary: splitList(formData.get("preferredVocabulary")), projectName: formData.get("projectName"), references: referenceContent ? [{ content: referenceContent, sourceTitle: String(formData.get("sourceTitle") ?? "Reference"), sourceUrl: sourceUrl || null }] : [], targetAudience: formData.get("targetAudience"),
    }) });
    const result = (await response.json()) as { brandId?: string };
    if (!response.ok || !result.brandId) { setError(ja ? "入力を確認してください。3件の例文、または300語以上のReferenceが必要です。" : "Check the input. Provide three examples or at least 300 reference words."); setBusy(false); return; }
    router.push("/dashboard/brands");
    router.refresh();
  }

  const fields = [
    ["projectName", ja ? "プロジェクト名" : "Project name"], ["name", ja ? "ブランド名" : "Brand name"], ["targetAudience", ja ? "対象オーディエンス" : "Target audience"], ["personalities", ja ? "ブランド特性（カンマ区切り）" : "Personalities (comma separated)"], ["preferredVocabulary", ja ? "推奨語彙（カンマ区切り）" : "Preferred vocabulary (comma separated)"], ["forbiddenVocabulary", ja ? "禁止語彙（カンマ区切り）" : "Forbidden vocabulary (comma separated)"],
  ];
  return <form action={submit} className="mt-7 space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label]) => <label className="text-xs text-[var(--text-secondary)]" key={name}>{label}<input className="field mt-2" name={name} required={!["preferredVocabulary", "forbiddenVocabulary"].includes(name)} /></label>)}</div>
    <label className="block text-xs text-[var(--text-secondary)]">{ja ? "企業概要" : "Description"}<textarea className="field mt-2 min-h-28" minLength={20} name="description" required /></label>
    <label className="block text-xs text-[var(--text-secondary)]">{ja ? "例文（各サンプルを --- の行で区切る、最大10件）" : "Example copy (separate samples with a --- line, maximum 10)"}<textarea className="field mt-2 min-h-56" name="examples" required /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="text-xs text-[var(--text-secondary)]">{ja ? "Reference名" : "Reference title"}<input className="field mt-2" name="sourceTitle" /></label><label className="text-xs text-[var(--text-secondary)]">{ja ? "公開Reference URL（任意）" : "Public reference URL (optional)"}<input className="field mt-2" name="sourceUrl" type="url" /></label></div>
    <label className="block text-xs text-[var(--text-secondary)]">{ja ? "Reference本文" : "Reference content"}<textarea className="field mt-2 min-h-44" name="referenceContent" /></label>
    <label className="block text-xs text-[var(--text-secondary)]">{ja ? "対象コンテンツ言語" : "Target content language"}<select className="field mt-2" defaultValue={locale} name="language"><option value="en">English</option><option value="ja">日本語</option></select></label>
    {error && <p className="text-sm text-[var(--critical)]" role="alert">{error}</p>}
    <button className="min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d] disabled:opacity-60" disabled={busy}>{busy ? (ja ? "保存中…" : "Saving…") : (ja ? "ブランドを保存" : "Save brand")}</button>
  </form>;
}
