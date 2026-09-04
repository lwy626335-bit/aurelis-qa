"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { localize, type Locale } from "@/i18n/config";

export function DeleteEvaluationButton({ evaluationId, evaluationType = "website", locale }: { evaluationId: string; evaluationType?: "logo" | "website"; locale: Locale }) {
  const router = useRouter();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const endpoint = evaluationType === "logo"
        ? `/api/logo-evaluations/${evaluationId}`
        : `/api/evaluations/${evaluationId}?purge=true`;
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Deletion failed");
      }
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
          en: "This permanently deletes the evaluation and all of its stored results. This action cannot be undone.",
          ja: "この評価と保存されたすべての結果を完全に削除します。この操作は取り消せません。",
          zh: "这会永久删除该评估及其全部已保存结果，操作无法撤销。",
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
