import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ButtonTone = "primary" | "secondary" | "quiet" | "danger";

export function buttonStyles({ className, tone = "primary" }: { className?: string; tone?: ButtonTone } = {}) {
  return cn(
    "interactive-control inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] px-5 text-sm font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    tone === "primary" &&
      "border border-[var(--accent)] bg-[var(--accent)] text-[#17140d] hover:border-[#e4cc98] hover:bg-[#e4cc98]",
    tone === "secondary" &&
      "border border-[var(--border-strong)] bg-white/[0.035] text-[var(--text)] hover:border-white/25 hover:bg-white/[0.065]",
    tone === "quiet" &&
      "border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.035] hover:text-[var(--text)]",
    tone === "danger" &&
      "border border-[rgba(237,116,116,0.24)] bg-[rgba(237,116,116,0.07)] text-[var(--critical)] hover:border-[rgba(237,116,116,0.42)] hover:bg-[rgba(237,116,116,0.11)]",
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  busy?: boolean;
  tone?: ButtonTone;
};

export function Button({ busy = false, children, className, disabled, tone, ...props }: ButtonProps) {
  return (
    <button
      aria-busy={busy || undefined}
      className={buttonStyles({ className, tone })}
      disabled={disabled || busy}
      {...props}
    >
      {busy && <span aria-hidden="true" className="status-pulse mr-2 size-1.5 rounded-full bg-current" />}
      {children}
    </button>
  );
}
