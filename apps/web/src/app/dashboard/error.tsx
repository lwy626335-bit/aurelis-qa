"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center p-6">
      <div className="panel-flat max-w-lg p-7 text-center">
        <h1 className="text-2xl font-medium tracking-[-0.03em]"><span className="locale-en">Dashboard unavailable</span><span className="locale-ja">ダッシュボードを表示できません</span></h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"><span className="locale-en">The interface could not be rendered. No evaluation data was changed.</span><span className="locale-ja">画面を表示できませんでした。評価データは変更されていません。</span></p>
        <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-5 text-sm font-medium text-[#17140d]"><span className="locale-en">Try again</span><span className="locale-ja">再試行</span></button>
      </div>
    </main>
  );
}
