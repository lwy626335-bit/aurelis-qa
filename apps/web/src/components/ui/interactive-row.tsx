import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function InteractiveRow({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "interactive-row block rounded-[var(--radius-control)] focus-visible:outline-offset-[-2px]",
        className,
      )}
      {...props}
    />
  );
}
