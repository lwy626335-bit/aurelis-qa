"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, ImageSquare, Sparkle } from "@phosphor-icons/react";
import { gsap } from "gsap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AsyncStatus } from "@/components/ui/async-status";
import { Button } from "@/components/ui/button";
import { localize, type Locale } from "@/i18n/config";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export function LogoEvaluationForm({ locale }: { locale: Locale }) {
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useGSAP(() => {
    if (!previewUrl || typeof window.matchMedia !== "function") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-logo-preview]", { autoAlpha: 0, scale: 0.96, y: 8 }, { autoAlpha: 1, duration: 0.45, ease: "power3.out", scale: 1, stagger: 0.06, y: 0 });
    });
    return () => media.revert();
  }, { dependencies: [previewUrl], revertOnUpdate: true, scope: root });

  async function submit(formData: FormData) {
    setError("");
    setSubmitting(true);
    formData.set("aiGenerated", String(aiGenerated));
    try {
      const response = await fetch("/api/logo-evaluations", { body: formData, method: "POST" });
      const result = await response.json() as { code?: string; evaluationId?: string };
      if (!response.ok || !result.evaluationId) {
        setError(result.code === "AI_EVALUATION_UNAVAILABLE"
          ? text({ en: "Visual AI is not configured. Add an OpenAI API key and try again.", ja: "ビジュアルAIが設定されていません。OpenAI APIキーを追加して再試行してください。", zh: "视觉 AI 尚未配置，请添加 OpenAI API 密钥后重试。" })
          : text({ en: "The logo could not be evaluated. Check the file and try again.", ja: "ロゴを評価できませんでした。ファイルを確認して再試行してください。", zh: "无法评价该 Logo，请检查文件后重试。" }));
        return;
      }
      router.push(`/dashboard/logo/${result.evaluationId}`);
    } catch {
      setError(text({ en: "The logo could not be evaluated. Try again.", ja: "ロゴを評価できませんでした。再試行してください。", zh: "无法评价该 Logo，请重试。" }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={submit} className="space-y-7" ref={root}>
      <label className="block text-xs text-[var(--text-secondary)]">
        {text({ en: "Logo file", ja: "ロゴファイル", zh: "Logo 文件" })}
        <span className="mt-2 grid min-h-32 cursor-pointer place-items-center rounded-[var(--radius-control)] border border-dashed border-white/15 bg-black/10 p-5 text-center hover:border-[var(--accent)]/50">
          <ImageSquare aria-hidden="true" className="size-6 text-[var(--accent)]" />
          <span className="mt-2 block text-sm text-[var(--text)]">{text({ en: "Choose PNG, JPEG, or WebP", ja: "PNG・JPEG・WebPを選択", zh: "选择 PNG、JPEG 或 WebP" })}</span>
          <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">{text({ en: "Maximum 8 MB. The source image is not stored.", ja: "最大8MB。元画像は保存されません。", zh: "最大 8 MB，原图不会被保存。" })}</span>
          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            name="logo"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setPreviewUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return file ? URL.createObjectURL(file) : "";
              });
            }}
            required
            type="file"
          />
        </span>
      </label>

      {previewUrl && (
        <div className="grid gap-3 sm:grid-cols-2" aria-label={text({ en: "Logo preview", ja: "ロゴプレビュー", zh: "Logo 预览" })}>
          <div className="grid min-h-48 place-items-center rounded-[var(--radius-control)] bg-white p-6" data-logo-preview>
            <span className="relative block h-32 w-full"><Image alt={text({ en: "Logo on a light background", ja: "明るい背景のロゴ", zh: "浅色背景上的 Logo" })} fill sizes="(min-width: 640px) 40vw, 80vw" src={previewUrl} style={{ objectFit: "contain" }} unoptimized /></span>
          </div>
          <div className="grid min-h-48 place-items-center rounded-[var(--radius-control)] border border-white/10 bg-[#090a0d] p-6" data-logo-preview>
            <span className="relative block h-32 w-full"><Image alt={text({ en: "Logo on a dark background", ja: "暗い背景のロゴ", zh: "深色背景上的 Logo" })} fill sizes="(min-width: 640px) 40vw, 80vw" src={previewUrl} style={{ objectFit: "contain" }} unoptimized /></span>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs text-[var(--text-secondary)]">
          {text({ en: "Evaluation label", ja: "評価名", zh: "评价名称" })}
          <input className="field mt-2" maxLength={120} minLength={2} name="targetLabel" required />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          {text({ en: "Brand name", ja: "ブランド名", zh: "品牌名称" })}
          <input className="field mt-2" maxLength={100} minLength={2} name="brandName" required />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          {text({ en: "Industry", ja: "業界", zh: "所属行业" })}
          <input className="field mt-2" maxLength={100} minLength={2} name="industry" required />
        </label>
        <label className="text-xs text-[var(--text-secondary)]">
          {text({ en: "Brand keywords", ja: "ブランドキーワード", zh: "品牌关键词" })}
          <input className="field mt-2" maxLength={320} name="brandKeywords" placeholder={text({ en: "precise, trusted, modern", ja: "精密、信頼、現代的", zh: "精准、可信、现代" })} required />
          <span className="mt-2 block text-[10px] text-[var(--text-tertiary)]">{text({ en: "Separate up to eight keywords with commas.", ja: "最大8個をカンマで区切ります。", zh: "最多八个，用逗号分隔。" })}</span>
        </label>
      </div>

      <label className="block text-xs text-[var(--text-secondary)]">
        {text({ en: "Output language", ja: "出力言語", zh: "输出语言" })}
        <select className="field mt-2" defaultValue={locale} name="language">
          <option value="en">English</option><option value="ja">日本語</option><option value="zh">简体中文</option>
        </select>
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border border-white/10 bg-white/[0.025] px-4 text-sm">
        <input checked={aiGenerated} className="size-4 accent-[var(--accent)]" onChange={(event) => setAiGenerated(event.target.checked)} type="checkbox" />
        <Sparkle aria-hidden="true" className="size-4 text-[var(--accent)]" />
        {text({ en: "This logo was generated with AI", ja: "このロゴはAIで生成されました", zh: "这个 Logo 由 AI 生成" })}
      </label>

      {aiGenerated && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs text-[var(--text-secondary)]">
            {text({ en: "AI tool (optional)", ja: "AIツール（任意）", zh: "AI 工具（可选）" })}
            <input className="field mt-2" maxLength={100} name="aiGenerator" />
          </label>
          <label className="text-xs text-[var(--text-secondary)] sm:col-span-2">
            {text({ en: "Original prompt (optional)", ja: "元のプロンプト（任意）", zh: "原始提示词（可选）" })}
            <textarea className="field mt-2 min-h-24 resize-y" maxLength={4000} name="originalPrompt" />
          </label>
        </div>
      )}

      {error && <AsyncStatus tone="error">{error}</AsyncStatus>}
      {submitting && <AsyncStatus>{text({ en: "Analyzing the image with the visual model…", ja: "ビジュアルモデルで画像を分析しています…", zh: "视觉模型正在分析图像…" })}</AsyncStatus>}

      <Button busy={submitting} type="submit">
        {submitting ? text({ en: "Evaluating…", ja: "評価中…", zh: "正在评价…" }) : text({ en: "Evaluate logo", ja: "ロゴを評価", zh: "评价 Logo" })}
        {!submitting && <ArrowRight aria-hidden="true" className="ml-2 size-4" />}
      </Button>
    </form>
  );
}
