export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-[1560px] animate-pulse px-4 py-8 md:px-7" aria-label="Loading dashboard / ダッシュボードを読み込み中">
      <div className="h-10 w-64 rounded-[var(--radius-control)] bg-white/[0.055]" />
      <div className="mt-7 grid gap-4 xl:grid-cols-3">
        <div className="h-80 rounded-[var(--radius-card)] bg-white/[0.035]" />
        <div className="h-80 rounded-[var(--radius-card)] bg-white/[0.035]" />
        <div className="h-80 rounded-[var(--radius-card)] bg-white/[0.035]" />
      </div>
    </main>
  );
}
