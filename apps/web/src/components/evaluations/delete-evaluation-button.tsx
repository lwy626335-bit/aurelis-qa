"use client";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
export function DeleteEvaluationButton({ evaluationId, locale }: { evaluationId: string; locale: Locale }) { const router = useRouter(); const ja = locale === "ja"; async function remove() { if (!window.confirm(ja ? "この評価と関連結果を完全に削除しますか？" : "Permanently delete this evaluation and its related results?")) return; const response = await fetch(`/api/evaluations/${evaluationId}?purge=true`, { method: "DELETE" }); if (response.ok) router.push("/dashboard/history"); } return <button className="text-xs text-[var(--critical)] underline underline-offset-4" onClick={remove}>{ja ? "評価を削除" : "Delete evaluation"}</button>; }
