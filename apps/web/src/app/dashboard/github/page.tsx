import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function GitHubPage() {
  const { locale } = await getDictionary();
  const text = <T,>(values: { en: T; ja: T; zh: T }) => localize(locale, values);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">GitHub Action</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {text({ en: "Submit checked-out HTML from a public web project to the AURELIS API. The workflow is non-blocking by default.", ja: "Checkout済みの公開WebプロジェクトからHTMLをAURELIS APIへ送信します。既定ではPRをBlockingしません。", zh: "将已检出的公开网页项目 HTML 提交到 AURELIS API。默认情况下，该流程不会阻止 PR。" })}
      </p>
      <section className="panel-flat mt-7 p-5">
        <h2 className="font-medium">{text({ en: "Required configuration", ja: "必要な設定", zh: "所需配置" })}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          <li><code>AURELIS_API_URL</code> {text({ en: "repository secret", ja: "Repository Secretを設定", zh: "仓库 Secret" })}</li>
          <li>{text({ en: "Set the HTML path (default: index.html)", ja: "評価対象HTMLのPathを指定（既定 index.html）", zh: "设置 HTML 路径（默认为 index.html）" })}</li>
          <li>{text({ en: "Change continue-on-error to false only when you intend to gate PRs", ja: "必要な場合のみ continue-on-error を false に変更", zh: "仅在需要将评估设为 PR 门禁时，把 continue-on-error 改为 false" })}</li>
        </ol>
      </section>
      <p className="mt-4 text-xs text-[var(--warning)]">{text({ en: "Private-repository GitHub App and status-check writeback are deferred.", ja: "Private repository GitHub AppとStatus Check書き込みは延期されています。", zh: "私有仓库 GitHub App 与状态检查回写功能尚未提供。" })}</p>
    </main>
  );
}
