import { localize } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";

export default async function PrivacyPage() {
  const { locale } = await getDictionary();
  const sections = localize(locale, {
    en: [["What is analyzed", "Submitted URLs or HTML, CSS, JavaScript, brand profiles, and reference corpora. Pasted JavaScript is not executed."], ["What is stored", "Inputs, hashes, raw tool results, scores, evidence, recommendations, and version metadata are retained until you delete them."], ["Which AI model is used", "The configured OpenAI model ID. Without an API key, AI evaluation is unavailable."], ["Deletion", "Delete an evaluation from its report to cascade-delete its technical and brand results, evidence, recommendations, job, and version metadata."]],
    ja: [["分析対象", "入力URLまたはHTML、CSS、JavaScript、Brand Profile、Reference Corpus。貼り付けたJavaScriptは実行しません。"], ["保存データ", "入力、Hash、Raw tool result、Score、Evidence、Recommendation、Version metadata。ユーザーが削除するまで保存します。"], ["使用モデル", "環境設定されたOpenAI model ID。API Keyがない場合、AI評価はUnavailableです。"], ["削除", "各評価Reportの「評価を削除」から関連する技術・ブランド結果、Evidence、Recommendation、Job、VersionをCascade削除します。"]],
    zh: [["分析内容", "提交的 URL 或 HTML、CSS、JavaScript、品牌资料与参考语料。系统不会执行粘贴的 JavaScript。"], ["保存内容", "输入、哈希、原始工具结果、分数、证据、建议与版本元数据会保留到用户主动删除。"], ["使用的 AI 模型", "使用环境中配置的 OpenAI 模型 ID。没有 API Key 时，AI 评估不可用。"], ["删除", "从评估报告中删除记录时，会一并删除相关技术与品牌结果、证据、建议、任务和版本元数据。"]],
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-7 md:py-10">
      <h1 className="text-4xl font-medium">{localize(locale, { en: "Privacy and data", ja: "プライバシーとデータ", zh: "隐私与数据" })}</h1>
      <div className="mt-7 space-y-4">
        {sections.map(([title, body]) => (
          <section className="panel-flat p-5" key={title}>
            <h2 className="font-medium">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
