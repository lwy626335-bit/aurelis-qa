"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouteMotion } from "@/components/motion/route-motion-provider";
import { localize, type Locale } from "@/i18n/config";

export function DeleteEvaluationButton({ evaluationId, locale }: { evaluationId: string; locale: Locale }) {
  const router = useRouter();
  const { startNavigation } = useRouteMotion();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}?purge=true`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Deletion failed");
      }
      startNavigation("/dashboard/history", "completion");
      router.push("/dashboard/history");
      router.refresh();
    } catch {
      setError(text({ en: "The evaluation could not be deleted. Please try again.", ja: "評価を削除できませんでした。もう一度お試しください。", zh: "无法删除该评估，请重试。" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} tone="danger" type="button">
        {text({ en: "Delete evaluation", ja: "評価を削除", zh: "删除评估" })}
      </Button>
      <ConfirmDialog
        busy={busy}
        cancelLabel={text({ en: "Cancel", ja: "キャンセル", zh: "取消" })}
        confirmLabel={text({ en: "Permanently delete", ja: "完全に削除", zh: "永久删除" })}
        description={text({
          en: "This permanently deletes the evaluation, its results, evidence, and job. This action cannot be undone.",
          ja: "この評価、結果、根拠データ、実行ジョブを完全に削除します。この操作は取り消せません。",
          zh: "这会永久删除该评估及其结果、证据和任务，操作无法撤销。",
        })}
        error={error}
        onClose={() => {
          if (!busy) {
            setOpen(false);
            setError("");
          }
        }}
        onConfirm={remove}
        open={open}
        title={text({ en: "Permanently delete this evaluation?", ja: "評価を完全に削除しますか？", zh: "永久删除此评估？" })}
      />
    </>
  );
}
