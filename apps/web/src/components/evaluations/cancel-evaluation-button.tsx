"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary } from "@/i18n/config";

export function CancelEvaluationButton({ dictionary, evaluationId }: { dictionary: Dictionary; evaluationId: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    setCancelling(true);
    const response = await fetch(`/api/evaluations/${evaluationId}`, { method: "DELETE" });
    setCancelling(false);
    if (response.ok) router.refresh();
  }

  return (
    <button
      className="min-h-10 rounded-[var(--radius-control)] border border-white/10 px-4 text-xs text-[var(--text-secondary)] hover:border-white/20 hover:text-[var(--text)] disabled:opacity-60"
      disabled={cancelling}
      onClick={cancel}
      type="button"
    >
      {cancelling ? dictionary.evaluations.cancelling : dictionary.evaluations.cancel}
    </button>
  );
}
