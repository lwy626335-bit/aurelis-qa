"use client";

import { ArrowRight, Code, Globe } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary, Locale } from "@/i18n/config";

export function EvaluationForm({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.evaluations;
  const router = useRouter();
  const [inputType, setInputType] = useState<"URL" | "HTML">("URL");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setSubmitting(true);

    const payload = {
      inputType,
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
      router.push(`/dashboard/evaluations/${result.evaluationId}`);
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
              className={`flex min-h-20 items-center gap-3 rounded-[var(--radius-control)] border px-4 text-left text-sm ${
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
          <input className="field mt-2" maxLength={100} minLength={2} name="projectName" required />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          {copy.targetLabel}
          <input className="field mt-2" maxLength={120} minLength={2} name="targetLabel" required />
        </label>
      </div>

      <label className="block text-xs text-[var(--text-secondary)]">
        {copy.targetLanguage}
        <select className="field mt-2" defaultValue={locale} name="language">
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
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

      {error && <p className="text-sm text-[var(--critical)]" role="alert">{error}</p>}

      <button
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d] disabled:cursor-wait disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? copy.submitting : copy.submit}
        {!submitting && <ArrowRight aria-hidden="true" className="ml-2 size-4" />}
      </button>
    </form>
  );
}
