"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type CSSProperties } from "react";

import { cn, formatScore } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export function ScoreGauge({
  score,
  label = "Quality score",
  outOf = "out of 100",
  size = "large",
  className,
}: {
  score: number;
  label?: string;
  outOf?: string;
  size?: "large" | "compact";
  className?: string;
}) {
  const degrees = Math.max(0, Math.min(100, score)) * 3.6;
  const root = useRef<HTMLDivElement>(null);
  const value = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (typeof window.matchMedia !== "function") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { value: 0 };
        const timeline = gsap.timeline({ defaults: { duration: 0.64, ease: "power3.out" } });
        timeline
          .fromTo(root.current, { "--score-angle": "0deg", scale: 0.96 }, { "--score-angle": `${degrees}deg`, scale: 1 })
          .to(counter, {
            value: score,
            onUpdate: () => {
              if (value.current) value.current.textContent = formatScore(counter.value, score % 1 === 0 ? 0 : 1);
            },
          }, "<");
      });
      return () => media.revert();
    },
    { dependencies: [degrees, score], revertOnUpdate: true, scope: root },
  );

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full",
        size === "large" ? "size-48 md:size-56" : "size-28",
        className,
      )}
      ref={root}
      style={{
        "--score-angle": `${degrees}deg`,
        background: "conic-gradient(var(--accent) var(--score-angle), rgba(255,255,255,0.07) var(--score-angle))",
      } as CSSProperties}
      role="img"
      aria-label={`${label}: ${score} ${outOf}`}
    >
      <div className="absolute inset-[7px] rounded-full border border-white/[0.045] bg-[var(--surface)]" />
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            "mono-number font-medium text-[var(--text)]",
            size === "large" ? "text-5xl md:text-6xl" : "text-3xl",
          )}
          ref={value}
        >
          {formatScore(score, score % 1 === 0 ? 0 : 1)}
        </span>
        <span className="mt-2 text-[9px] font-semibold tracking-[0.16em] text-[var(--text-tertiary)] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
