import { cn } from "@/lib/utils";

export function AurelisMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="AURELIS QA">
      <svg
        aria-hidden="true"
        className="size-6 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 19L10.8 5H13.2L20 19" stroke="currentColor" strokeWidth="1.55" />
        <path d="M7.3 14H16.7" stroke="currentColor" strokeWidth="1.55" />
        <circle cx="12" cy="18.75" r="1.15" fill="var(--accent)" />
      </svg>
      {!compact && (
        <span className="flex items-baseline gap-1.5 whitespace-nowrap text-[13px] font-semibold tracking-[0.18em]">
          AURELIS <span className="font-mono text-[9px] font-medium tracking-[0.14em] text-[var(--accent)]">QA</span>
        </span>
      )}
    </span>
  );
}
