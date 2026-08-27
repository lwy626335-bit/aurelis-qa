"use client";

import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { localize, type Locale } from "@/i18n/config";

type Suggestion = { original: string; rationale: string; rewrite: string };

export function RewriteSuggestions({ evaluationId, locale }: { evaluationId: string; locale: Locale }) {
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/rewrite`, { method: "POST" });
      const result = await response.json() as { suggestions?: Suggestion[] };
      if (!response.ok || !result.suggestions) {
        throw new Error("Rewrite unavailable");
      }
      setSuggestions(result.suggestions);
    } catch {
      setMessage(text({ en: "AI rewrite is unavailable. The source content was not changed.", ja: "AI Rewriteは現在利用できません。元のコンテンツは変更されていません。", zh: "AI 改写暂不可用，原始内容没有发生变化。" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-flat mt-4 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">{text({ en: "Rewrite suggestions", ja: "Rewrite提案", zh: "改写建议" })}</h2>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            {text({ en: "Suggestions only. Source content is never changed automatically.", ja: "提案のみ。ソースを自動変更しません。", zh: "仅提供建议，不会自动修改原始内容。" })}
          </p>
        </div>
        <Button busy={busy} onClick={generate} tone="secondary" type="button">
          {busy ? text({ en: "Generating…", ja: "生成中…", zh: "正在生成…" }) : text({ en: "Generate suggestions", ja: "提案を生成", zh: "生成建议" })}
        </Button>
      </div>
      {message && <div className="mt-4"><AsyncStatus tone="warning">{message}</AsyncStatus></div>}
      <div className="mt-5 space-y-4">
        {suggestions.map((item, index) => (
          <article className="border-l-2 border-[var(--accent)] p-4" key={`${item.original}-${index}`}>
            <p className="text-xs text-[var(--text-tertiary)]" lang={locale === "zh" ? "zh-CN" : locale}>{item.original}</p>
            <p className="mt-3 text-sm leading-6">{item.rewrite}</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{item.rationale}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
