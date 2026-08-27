"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { useRouteMotion } from "@/components/motion/route-motion-provider";
import { localize, type Locale } from "@/i18n/config";

const splitList = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

export function BrandForm({ locale }: { locale: Locale }) {
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const router = useRouter();
  const { startNavigation } = useRouteMotion();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError("");
    const examples = String(formData.get("examples") ?? "").split(/\n---\n/).map((content, index) => ({ content: content.trim(), label: `Example ${index + 1}` })).filter((item) => item.content);
    const referenceContent = String(formData.get("referenceContent") ?? "").trim();
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
    try {
      const response = await fetch("/api/brands", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        description: formData.get("description"), examples, forbiddenVocabulary: splitList(formData.get("forbiddenVocabulary")), language: formData.get("language"), name: formData.get("name"), personalities: splitList(formData.get("personalities")), preferredVocabulary: splitList(formData.get("preferredVocabulary")), projectName: formData.get("projectName"), references: referenceContent ? [{ content: referenceContent, sourceTitle: String(formData.get("sourceTitle") ?? "Reference"), sourceUrl: sourceUrl || null }] : [], targetAudience: formData.get("targetAudience"),
      }) });
      const result = (await response.json()) as { brandId?: string };
      if (!response.ok || !result.brandId) {
        throw new Error("Invalid brand profile");
      }
      startNavigation("/dashboard/brands", "completion");
      router.push("/dashboard/brands");
      router.refresh();
    } catch {
      setError(text({ en: "Check the input. Provide three examples or at least 300 reference words.", ja: "入力を確認してください。3件の例文、または300語以上のReferenceが必要です。", zh: "请检查输入。需要提供三个示例，或至少 300 个词的参考内容。" }));
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["projectName", text({ en: "Project name", ja: "プロジェクト名", zh: "项目名称" })],
    ["name", text({ en: "Brand name", ja: "ブランド名", zh: "品牌名称" })],
    ["targetAudience", text({ en: "Target audience", ja: "対象オーディエンス", zh: "目标受众" })],
    ["personalities", text({ en: "Personalities (comma separated)", ja: "ブランド特性（カンマ区切り）", zh: "品牌特质（用逗号分隔）" })],
    ["preferredVocabulary", text({ en: "Preferred vocabulary (comma separated)", ja: "推奨語彙（カンマ区切り）", zh: "推荐词汇（用逗号分隔）" })],
    ["forbiddenVocabulary", text({ en: "Forbidden vocabulary (comma separated)", ja: "禁止語彙（カンマ区切り）", zh: "禁用词汇（用逗号分隔）" })],
  ];
  return <form action={submit} className="mt-7 space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label]) => <label className="text-xs text-[var(--text-secondary)]" key={name}>{label}<input className="field mt-2" name={name} required={!["preferredVocabulary", "forbiddenVocabulary"].includes(name)} /></label>)}</div>
    <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "Description", ja: "企業概要", zh: "品牌简介" })}<textarea className="field mt-2 min-h-28" minLength={20} name="description" required /></label>
    <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "Example copy (separate samples with a --- line, maximum 10)", ja: "例文（各サンプルを --- の行で区切る、最大10件）", zh: "示例文案（使用单独一行 --- 分隔，最多 10 条）" })}<textarea className="field mt-2 min-h-56" name="examples" required /></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="text-xs text-[var(--text-secondary)]">{text({ en: "Reference title", ja: "Reference名", zh: "参考资料名称" })}<input className="field mt-2" name="sourceTitle" /></label><label className="text-xs text-[var(--text-secondary)]">{text({ en: "Public reference URL (optional)", ja: "公開Reference URL（任意）", zh: "公开参考资料 URL（可选）" })}<input className="field mt-2" name="sourceUrl" type="url" /></label></div>
    <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "Reference content", ja: "Reference本文", zh: "参考资料正文" })}<textarea className="field mt-2 min-h-44" name="referenceContent" /></label>
    <label className="block text-xs text-[var(--text-secondary)]">{text({ en: "Target content language", ja: "対象コンテンツ言語", zh: "目标内容语言" })}<select className="field mt-2" defaultValue={locale} name="language"><option value="en">English</option><option value="ja">日本語</option><option value="zh">简体中文</option></select></label>
    {error && <AsyncStatus tone="error">{error}</AsyncStatus>}
    <Button busy={busy}>{busy ? text({ en: "Saving…", ja: "保存中…", zh: "正在保存…" }) : text({ en: "Save brand", ja: "ブランドを保存", zh: "保存品牌" })}</Button>
  </form>;
}
