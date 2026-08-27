import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AsyncStatus({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "error" }) {
  return (
    <p
      className={cn(
        "border-l-2 py-1 pl-3 text-xs leading-5",
        tone === "neutral" && "border-white/15 text-[var(--text-secondary)]",
        tone === "success" && "border-[var(--success)] text-[var(--success)]",
        tone === "warning" && "border-[var(--warning)] text-[var(--warning)]",
        tone === "error" && "border-[var(--critical)] text-[var(--critical)]",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
