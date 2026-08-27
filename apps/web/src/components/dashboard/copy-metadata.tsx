"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function CopyMetadata({ copiedLabel, label, value }: { copiedLabel: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      aria-label={`${label}: ${value}`}
      className="interactive-control grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--text)]"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      title={copied ? copiedLabel : label}
      type="button"
    >
      {copied ? <Check aria-hidden="true" className="size-4 text-[var(--success)]" /> : <Copy aria-hidden="true" className="size-4" />}
      <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ""}</span>
    </button>
  );
}
