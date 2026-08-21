"use client";

import { useState } from "react";

import type { Locale } from "@/i18n/config";

type Suggestion = { original: string; rationale: string; rewrite: string };

export function RewriteSuggestions({ evaluationId, locale }: { evaluationId: string; locale: Locale }) {
  const ja = locale === "ja";
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function generate() {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/evaluations/${evaluationId}/rewrite`, { method: "POST" });
    const result = await response.json() as { suggestions?: Suggestion[] };
    if (!response.ok || !result.suggestions) setMessage(ja ? "AI Rewriteは現在利用できません。元のコンテンツは変更されていません。" : "AI rewrite is unavailable. The source content was not changed.");
    else setSuggestions(result.suggestions);
    setBusy(false);
  }
  return <section className="panel-flat mt-4 p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-medium">{ja ? "Rewrite提案" : "Rewrite suggestions"}</h2><p className="mt-1 text-xs text-[var(--text-tertiary)]">{ja ? "提案のみ。ソースを自動変更しません。" : "Suggestions only. Source content is never changed automatically."}</p></div><button className="min-h-10 rounded-[var(--radius-control)] border border-white/10 px-4 text-xs disabled:opacity-60" disabled={busy} onClick={generate}>{busy ? (ja ? "生成中…" : "Generating…") : (ja ? "提案を生成" : "Generate suggestions")}</button></div>{message && <p className="mt-4 text-sm text-[var(--warning)]" role="status">{message}</p>}<div className="mt-5 space-y-4">{suggestions.map((item, index) => <article className="border-l-2 border-[var(--accent)] p-4" key={`${item.original}-${index}`}><p className="text-xs text-[var(--text-tertiary)]" lang={ja ? "ja" : "en"}>{item.original}</p><p className="mt-3 text-sm leading-6">{item.rewrite}</p><p className="mt-2 text-xs text-[var(--text-secondary)]">{item.rationale}</p></article>)}</div></section>;
}
