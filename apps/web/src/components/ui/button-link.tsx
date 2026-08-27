import Link from "next/link";
import type { ComponentProps } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  tone?: "primary" | "secondary" | "quiet";
};

export function ButtonLink({ className, tone = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonStyles({ tone }),
        className,
      )}
      {...props}
    />
  );
}
