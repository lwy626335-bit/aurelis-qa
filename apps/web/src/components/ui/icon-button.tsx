import type { ComponentProps } from "react";

import { Button, type ButtonTone } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconButtonProps = ComponentProps<"button"> & {
  tone?: ButtonTone;
};

export function IconButton({ className, tone = "quiet", ...props }: IconButtonProps) {
  return (
    <Button
      className={cn("size-10 min-h-10 shrink-0 p-0", className)}
      tone={tone}
      {...props}
    />
  );
}
