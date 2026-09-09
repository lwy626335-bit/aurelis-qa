"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./border-glow.module.css";

type BorderGlowStyle = CSSProperties & Record<`--${string}`, number | string>;

function edgeProximity(width: number, height: number, x: number, y: number) {
  const dx = x - width / 2;
  const dy = y - height / 2;
  const horizontal = dx === 0 ? Number.POSITIVE_INFINITY : width / 2 / Math.abs(dx);
  const vertical = dy === 0 ? Number.POSITIVE_INFINITY : height / 2 / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(horizontal, vertical), 0), 1);
}

function cursorAngle(width: number, height: number, x: number, y: number) {
  const degrees = Math.atan2(y - height / 2, x - width / 2) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

export function BorderGlow({
  animated = false,
  backgroundColor = "#0b0d12",
  borderRadius = 14,
  children,
  className,
  colors = ["#f4f4f4", "#e8c46b", "#8a93a3"],
  edgeSensitivity = 42,
  fillOpacity = 0.12,
  glowColor = "42 52% 65%",
  glowIntensity = 0.55,
  glowRadius = 24,
}: {
  animated?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  children: ReactNode;
  className?: string;
  colors?: string[];
  edgeSensitivity?: number;
  fillOpacity?: number;
  glowColor?: string;
  glowIntensity?: number;
  glowRadius?: number;
}) {
  const card = useRef<HTMLDivElement>(null);
  const palette = colors.length > 0 ? colors : ["#f4f4f4"];
  const style: BorderGlowStyle = {
    "--border-radius": `${borderRadius}px`,
    "--card-bg": backgroundColor,
    "--edge-sensitivity": edgeSensitivity,
    "--fill-opacity": fillOpacity,
    "--glow-color": glowColor,
    "--glow-intensity": glowIntensity,
    "--glow-padding": `${glowRadius}px`,
    "--mesh-one": palette[0],
    "--mesh-two": palette[Math.min(1, palette.length - 1)],
    "--mesh-three": palette[Math.min(2, palette.length - 1)],
  };

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const element = card.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    element.style.setProperty("--edge-proximity", `${(edgeProximity(bounds.width, bounds.height, x, y) * 100).toFixed(3)}`);
    element.style.setProperty("--cursor-angle", `${cursorAngle(bounds.width, bounds.height, x, y).toFixed(3)}deg`);
  }

  return (
    <div
      className={cn(styles.card, className)}
      data-animated={animated}
      data-border-glow
      onPointerLeave={() => card.current?.style.setProperty("--edge-proximity", "0")}
      onPointerMove={handlePointerMove}
      ref={card}
      style={style}
    >
      <span aria-hidden="true" className={styles.edgeLight} />
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
