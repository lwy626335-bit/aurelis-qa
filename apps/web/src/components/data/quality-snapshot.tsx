import { demoReport, DEMO_DATASET_LABEL } from "@aurelis/database/demo";
import { ArrowUpRight, CheckCircle, Warning } from "@phosphor-icons/react/dist/ssr";

import { ScoreGauge } from "@/components/data/score-gauge";

const scoreItems = [
  { label: "Technical", value: demoReport.scores.technical },
  { label: "Brand voice", value: demoReport.scores.brand },
  { label: "Reliability", value: demoReport.scores.reliability, suffix: "%" },
];

export function QualitySnapshot({ compact = false }: { compact?: boolean }) {
  return (
    <article
      className="panel relative overflow-hidden"
      aria-label={`Quality report preview. ${DEMO_DATASET_LABEL}.`}
    >
      <div className="fine-grid pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />
      <header className="relative flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5 md:px-5">
        <div>
          <p className="text-[11px] font-medium text-[var(--text-secondary)]">{demoReport.project}</p>
          <p className="mt-0.5 font-mono text-[9px] text-[var(--text-tertiary)]">{demoReport.url}</p>
        </div>
        <span className="rounded-[6px] border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-2 py-1 font-mono text-[9px] text-[var(--accent)]">
          {DEMO_DATASET_LABEL}
        </span>
      </header>

      <div className={`relative grid gap-5 p-4 md:p-5 ${compact ? "md:grid-cols-[auto_1fr]" : "md:grid-cols-[auto_1fr]"}`}>
        <ScoreGauge score={demoReport.overallScore} size={compact ? "compact" : "large"} />

        <div className="flex min-w-0 flex-col justify-between gap-4">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-white/[0.07] bg-white/[0.07]">
            {scoreItems.map((item) => (
              <div className="bg-[var(--surface)] px-3 py-3" key={item.label}>
                <p className="mono-number text-xl font-medium text-[var(--text)]">
                  {item.value}
                  {item.suffix && <span className="text-xs text-[var(--text-tertiary)]">{item.suffix}</span>}
                </p>
                <p className="mt-1 text-[9px] text-[var(--text-tertiary)]">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--success)]" weight="fill" />
              <span>Deterministic checks remain the technical source of truth.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <Warning aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" weight="fill" />
              <span>{demoReport.issues.length} evidence-backed findings need review.</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-[var(--text-tertiary)]">
            <span>{demoReport.metadata.rubric}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
