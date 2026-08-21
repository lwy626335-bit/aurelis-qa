"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-6">
      <div className="panel-flat max-w-lg p-7 text-center">
        <h1 className="text-2xl font-medium tracking-[-0.03em]">Dashboard unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">The demo interface could not be rendered. No evaluation data was changed.</p>
        <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]">Try again</button>
      </div>
    </main>
  );
}
