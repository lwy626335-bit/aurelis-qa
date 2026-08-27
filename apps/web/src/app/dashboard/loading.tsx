export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-[1500px] animate-pulse px-4 py-6 md:px-7 md:py-8" aria-label="Loading dashboard / ダッシュボードを読み込み中 / 正在加载仪表盘">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div><div className="h-3 w-44 rounded bg-white/[0.035]" /><div className="mt-4 h-10 w-64 rounded bg-white/[0.055]" /><div className="mt-3 h-3 w-48 rounded bg-white/[0.03]" /></div>
        <div className="h-11 w-40 rounded-[var(--radius-control)] bg-white/[0.05]" />
      </div>
      <div className="mt-7 h-14 border-y border-white/[0.06] bg-white/[0.02]" />
      <div className="mt-7 grid gap-5 xl:grid-cols-12">
        <div className="h-[540px] rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.035] xl:col-span-5" />
        <div className="h-[540px] border-y border-white/[0.06] xl:col-span-7">
          {Array.from({ length: 4 }).map((_, index) => <div className="h-[135px] border-b border-white/[0.05] last:border-0" key={index} />)}
        </div>
      </div>
      <div className="mt-5 grid border-y border-white/[0.06] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div className="h-24 border-b border-white/[0.05] sm:odd:border-r xl:border-b-0 xl:border-r" key={index} />)}
      </div>
      <div className="mt-12 h-7 w-52 rounded bg-white/[0.045]" />
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <div className="h-[430px] rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.025] xl:col-span-5" />
        <div className="h-[430px] rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.025] xl:col-span-7" />
      </div>
    </main>
  );
}
