"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useId, useRef } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { localize, type Locale } from "@/i18n/config";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

type DimensionDatum = { dimension: string; score: number; previous: number };
type TrendDatum = { label: string; quality: number; technical: number; brand: number };

const tooltipStyle = {
  background: "#111318",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 9,
  color: "#f5f4f0",
  fontSize: 12,
  boxShadow: "0 18px 48px rgba(2,3,6,0.36)",
};

export function QualityDimensions({ data, locale }: { data: readonly DimensionDatum[]; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== "function") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-current-bar]",
          { autoAlpha: 0.45, scaleX: 0 },
          {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.58,
            ease: "power3.out",
            stagger: 0.055,
            scrollTrigger: { trigger: root.current, start: "top 84%", once: true },
          },
        );
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <figure data-chart="dimensions" className="mt-6" ref={root}>
      <div className="flex items-center justify-end gap-4 text-[10px] text-[var(--text-tertiary)]" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-[var(--accent)]" />{text({ en: "Current", ja: "現在", zh: "当前" })}</span>
        <span className="inline-flex items-center gap-2"><span className="h-px w-5 bg-white/20" />{text({ en: "Reference", ja: "参考値", zh: "参考值" })}</span>
      </div>
      <ul className="mt-5 divide-y divide-white/[0.065]">
        {data.map((item) => (
          <li className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[128px_1fr_58px] sm:items-center" key={item.dimension}>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{item.dimension}</span>
            <div className="relative h-5" aria-hidden="true">
              <span className="absolute inset-x-0 top-2 h-px bg-white/[0.075]" />
              <span className="absolute left-0 top-[11px] h-px bg-white/25" style={{ width: `${item.previous}%` }} />
              <span className="absolute left-0 top-1 h-2 origin-left rounded-r-full bg-[var(--accent)]" data-current-bar style={{ width: `${item.score}%` }} />
              <span className="absolute top-0 size-2 -translate-x-1 rounded-full border border-white/40 bg-[var(--surface)]" style={{ left: `${item.previous}%` }} />
            </div>
            <span className="mono-number text-right text-lg text-[var(--text)]">{item.score.toFixed(item.score % 1 ? 1 : 0)}</span>
            <span className="sr-only">{text({ en: `Reference ${item.previous}`, ja: `参考値 ${item.previous}`, zh: `参考值 ${item.previous}` })}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function QualityTrend({ data, locale }: { data: readonly TrendDatum[]; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const gradientId = `quality-area-${useId().replaceAll(":", "")}`;
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== "function") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-chart-mask]",
          { xPercent: 0 },
          {
            xPercent: 101,
            duration: 0.64,
            ease: "power2.inOut",
            scrollTrigger: { trigger: root.current, start: "top 84%", once: true },
          },
        );
      });
      media.add("(prefers-reduced-motion: reduce)", () => gsap.set("[data-chart-mask]", { autoAlpha: 0 }));
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <figure data-chart="trend" className="mt-4 w-full min-w-0" ref={root}>
      <div className="relative h-[230px] w-full overflow-hidden sm:h-[270px]">
        <div aria-hidden="true" className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart accessibilityLayer={false} data={[...data]} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6b978" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#d6b978" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="label" tick={{ fill: "#858893", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "#858893", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(214,185,120,0.3)" }} />
              <Area isAnimationActive={false} name={text({ en: "Quality score", ja: "品質スコア", zh: "质量分数" })} type="monotone" dataKey="quality" stroke="#d6b978" strokeWidth={2} fill={`url(#${gradientId})`} activeDot={{ r: 4, fill: "#d6b978", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0d0f13]" data-chart-mask />
      </div>
      <details className="mt-2 border-t border-white/[0.065] pt-3 text-xs text-[var(--text-secondary)]">
        <summary className="interactive-control -mx-2 w-fit cursor-pointer rounded-[var(--radius-control)] px-2 py-2 text-[11px] text-[var(--accent)]">
          {text({ en: "View chart data", ja: "数値で確認", zh: "查看图表数据" })}
        </summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead className="text-[10px] text-[var(--text-tertiary)]"><tr><th className="pb-2 font-normal">{text({ en: "Date", ja: "日付", zh: "日期" })}</th><th className="pb-2 text-right font-normal">{text({ en: "Score", ja: "点数", zh: "分数" })}</th></tr></thead>
          <tbody className="divide-y divide-white/[0.06]">{data.map((item) => <tr key={item.label}><td className="py-2">{item.label}</td><td className="mono-number py-2 text-right">{item.quality.toFixed(1)}</td></tr>)}</tbody>
        </table>
      </details>
      <figcaption className="sr-only">
        {text({ en: "Quality scores for five separate sample targets.", ja: "5つの異なるサンプル対象の品質スコア。", zh: "五个不同示例对象的质量分数。" })}
      </figcaption>
    </figure>
  );
}
