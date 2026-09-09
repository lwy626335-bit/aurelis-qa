"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./spotlight-card.module.css";

type SpotlightStyle = CSSProperties & {
  "--spotlight-color": string;
};

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.1)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const card = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const element = card.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    element.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <div
      className={cn(styles.card, className)}
      data-spotlight-card
      onPointerMove={handlePointerMove}
      ref={card}
      style={{ "--spotlight-color": spotlightColor } as SpotlightStyle}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}
