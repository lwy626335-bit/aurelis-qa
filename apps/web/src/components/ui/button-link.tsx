import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  tone?: "primary" | "secondary" | "quiet";
};

export function ButtonLink({ className, tone = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] px-5 text-sm font-medium",
        tone === "primary" &&
          "border border-[var(--accent)] bg-[var(--accent)] text-[#17140d] hover:border-[#e4cc98] hover:bg-[#e4cc98]",
        tone === "secondary" &&
          "border border-[var(--border-strong)] bg-white/[0.035] text-[var(--text)] hover:border-white/25 hover:bg-white/[0.065]",
        tone === "quiet" && "text-[var(--text-secondary)] hover:text-[var(--text)]",
        className,
      )}
      {...props}
    />
  );
}
