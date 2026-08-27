"use client";

import { ArrowRight, Code, Globe } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { useRouteMotion } from "@/components/motion/route-motion-provider";
import { localize, type Dictionary, type Locale } from "@/i18n/config";

export function EvaluationForm({ brands, dictionary, locale }: { brands: { id: string; name: string }[]; dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.evaluations;
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const router = useRouter();
  const { startNavigation } = useRouteMotion();
  const [inputType, setInputType] = useState<"URL" | "HTML">("URL");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setSubmitting(true);

    const payload = {
      inputType,
      brandProfileId: formData.get("brandProfileId") || null,
      projectName: formData.get("projectName"),
      targetLabel: formData.get("targetLabel"),
      language: formData.get("language"),
      ...(inputType === "URL"
        ? { url: formData.get("url") }
        : {
            html: formData.get("html"),
            css: formData.get("css"),
            javascript: formData.get("javascript"),
          }),
    };

    try {
      const response = await fetch("/api/evaluations", {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { evaluationId?: string };
      if (!response.ok || !result.evaluationId) {
        setError(response.status === 400 ? copy.invalid : copy.createFailed);
        return;
      }
      const destination = `/dashboard/evaluations/${result.evaluationId}`;
      startNavigation(destination, "completion");
      router.push(destination);
    } catch {
      setError(copy.createFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="mt-8 space-y-7">
      <fieldset>
        <legend className="text-xs font-medium text-[var(--text-secondary)]">{copy.inputType}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([
            ["URL", copy.websiteUrl, Globe],
            ["HTML", copy.codeInput, Code],
          ] as const).map(([value, label, Icon]) => (
            <button
              aria-pressed={inputType === value}
              className={`interactive-control flex min-h-20 items-center gap-3 rounded-[var(--radius-control)] border px-4 text-left text-sm ${
                inputType === value
                  ? "border-[var(--accent)]/55 bg-[rgba(214,185,120,0.07)] text-[var(--text)]"
                  : "border-white/10 bg-white/[0.025] text-[var(--text-secondary)] hover:border-white/20"
              }`}
              key={value}
              onClick={() => setInputType(value)}
              type="button"
            >
              <Icon aria-hidden="true" className="size-5 text-[var(--accent)]" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs text-[var(--text-secondary)]">
          {copy.projectName}
          <input aria-describedby="project-name-help" className="field mt-2" maxLength={100} minLength={2} name="projectName" required />
          <span className="mt-2 block text-[10px] leading-4 text-[var(--text-tertiary)]" id="project-name-help">
            {text({ en: "The workspace name used to group related evaluations.", ja: "評価をグループ化するワークスペース名です。", zh: "用于归类相关评估的工作区名称。" })}
          </span>
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          {copy.targetLabel}
          <input aria-describedby="target-label-help" className="field mt-2" maxLength={120} minLength={2} name="targetLabel" required />
          <span className="mt-2 block text-[10px] leading-4 text-[var(--text-tertiary)]" id="target-label-help">
            {text({ en: "A specific name that makes this target recognizable in reports.", ja: "レポート一覧で識別できる具体的な名前を入力します。", zh: "输入一个能在报告列表中清楚识别该对象的名称。" })}
          </span>
        </label>
      </div>

      <label className="block text-xs text-[var(--text-secondary)]">
        {copy.targetLanguage}
        <select className="field mt-2" defaultValue={locale} name="language">
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">简体中文</option>
        </select>
      </label>

      <label className="block text-xs text-[var(--text-secondary)]">
        {text({ en: "Brand profile (optional)", ja: "ブランドプロフィール（任意）", zh: "品牌资料（可选）" })}
        <select aria-describedby="brand-profile-help" className="field mt-2" defaultValue="" name="brandProfileId">
          <option value="">{text({ en: "No brand evaluation", ja: "ブランド評価なし", zh: "不进行品牌评估" })}</option>
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <span className="mt-2 block text-[10px] leading-4 text-[var(--text-tertiary)]" id="brand-profile-help">
          {text({ en: "Uses the selected reference data as evidence for brand evaluation.", ja: "選択した参照データをブランド評価の根拠として使用します。", zh: "使用所选参考语料作为品牌评估证据。" })}
        </span>
      </label>

      {inputType === "URL" ? (
        <label className="block text-xs text-[var(--text-secondary)]">
          {copy.url}
          <input className="field mt-2 font-mono" name="url" placeholder="https://example.com" required type="url" />
        </label>
      ) : (
        <div className="space-y-5">
          <label className="block text-xs text-[var(--text-secondary)]">
            {copy.html}
            <textarea className="field mt-2 min-h-52 resize-y font-mono" name="html" required spellCheck={false} />
          </label>
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="text-xs text-[var(--text-secondary)]">
              {copy.css}
              <textarea className="field mt-2 min-h-36 resize-y font-mono" name="css" spellCheck={false} />
            </label>
            <label className="text-xs text-[var(--text-secondary)]">
              {copy.javascript}
              <textarea className="field mt-2 min-h-36 resize-y font-mono" name="javascript" spellCheck={false} />
            </label>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">{copy.limit}</p>
        </div>
      )}

      {error && <AsyncStatus tone="error">{error}</AsyncStatus>}

      {submitting && (
        <div aria-live="polite" className="max-w-sm" role="status">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="evaluation-progress h-full w-1/2 bg-[var(--accent)]" />
          </div>
          <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">
            {text({ en: "Validating the input and creating the evaluation task.", ja: "入力を確認し、評価タスクを作成しています。", zh: "正在验证输入并创建评估任务。" })}
          </p>
        </div>
      )}

      <Button busy={submitting} type="submit">
        {submitting ? copy.submitting : copy.submit}
        {!submitting && <ArrowRight aria-hidden="true" className="ml-2 size-4" />}
      </Button>
    </form>
  );
}
