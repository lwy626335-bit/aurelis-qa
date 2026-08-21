import { cn, formatScore } from "@/lib/utils";

export function ScoreGauge({
  score,
  label = "Quality score",
  size = "large",
  className,
}: {
  score: number;
  label?: string;
  size?: "large" | "compact";
  className?: string;
}) {
  const degrees = Math.max(0, Math.min(100, score)) * 3.6;

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full",
        size === "large" ? "size-48 md:size-56" : "size-28",
        className,
      )}
      style={{
        background: `conic-gradient(var(--accent) ${degrees}deg, rgba(255,255,255,0.07) ${degrees}deg)`,
      }}
      role="img"
      aria-label={`${label}: ${score} out of 100`}
    >
      <div className="absolute inset-[7px] rounded-full border border-white/[0.045] bg-[var(--surface)]" />
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            "mono-number font-medium text-[var(--text)]",
            size === "large" ? "text-5xl md:text-6xl" : "text-3xl",
          )}
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
