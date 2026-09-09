import Link from "next/link";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label="AURELIS QA" className="grid size-14 place-items-center rounded-full bg-white text-black"><AurelisMark compact /></Link>
      <p aria-hidden="true" className="mt-12 font-[family-name:var(--font-display)] text-8xl text-white">404</p>
      <h1 className="mt-6 text-3xl font-medium tracking-tight"><span className="locale-en">Page not found</span><span className="locale-ja">ページが見つかりません</span><span className="locale-zh">页面不存在</span></h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]"><span className="locale-en">This page is unavailable. Return to your workspace to continue.</span><span className="locale-ja">このページは利用できません。ワークスペースに戻って続行してください。</span><span className="locale-zh">当前页面不可用，请返回工作区继续操作。</span></p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/"><span className="locale-en">Home</span><span className="locale-ja">ホーム</span><span className="locale-zh">首页</span></ButtonLink>
        <ButtonLink href="/dashboard" tone="secondary"><span className="locale-en">Open workspace</span><span className="locale-ja">ワークスペース</span><span className="locale-zh">打开工作区</span></ButtonLink>
      </div>
    </main>
  );
}
