"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { localize, type Dictionary, type Locale } from "@/i18n/config";

export function CancelEvaluationButton({
  dictionary,
  evaluationId,
  locale,
}: {
  dictionary: Dictionary;
  evaluationId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setCancelling(true);
    setError("");
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Cancellation failed");
      }
      router.refresh();
    } catch {
      setError(localize(locale, {
        en: "The evaluation could not be cancelled. Please try again.",
        ja: "評価をキャンセルできませんでした。もう一度お試しください。",
        zh: "无法取消该评估，请重试。",
      }));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button busy={cancelling} onClick={cancel} tone="secondary" type="button">
        {cancelling ? dictionary.evaluations.cancelling : dictionary.evaluations.cancel}
      </Button>
      {error && <AsyncStatus tone="error">{error}</AsyncStatus>}
    </div>
  );
}
