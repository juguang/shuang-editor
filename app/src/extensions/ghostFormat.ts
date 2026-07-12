import { Extension } from "@tiptap/core";
import { PluginKey } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { completion } from "prosemirror-completion";
import { DOMParser } from "prosemirror-model";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { loadLlmConfig } from "../ai";

const mdToHtml = remark().use(remarkHtml);
async function renderMd(md: string): Promise<string> {
  try {
    const result = await mdToHtml.process(md);
    return String(result).trim();
  } catch {
    return md;
  }
}

const FORMAT_PROMPT = `你是 markdown 格式化助手。

给定"上文"和"当前段落"，只格式化"当前段落"，不要改写原文。

规则：
- 根据上文语义推断合适的标题级别（## / ###）
- 如果当前段明显是新主题，加合适的 ## 或 ### 标题
- 列表自动编号（1. 2. 3.）
- 关键人名/术语加粗（**文本**）
- 不要改变原意，不要新增用户没说的内容
- 只输出格式化后的当前段落，不要包含上文
- 输出纯 markdown，不要加代码块标记`;

async function callFormatApi(
  context: string,
  paragraph: string,
  signal?: AbortSignal,
): Promise<string> {
  const config = getLlmConfig();
  if (!config) return paragraph;
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: FORMAT_PROMPT },
        { role: "user", content: `上文:\n${context}\n\n当前段落:\n${paragraph}` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
    signal,
  });

  if (!response.ok) throw new Error(`API错误: ${response.status}`);
  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? paragraph;
}

function getLlmConfig() {
  const config = loadLlmConfig();
  if (!config.apiKey && !config.baseUrl.includes("localhost")) return null;
  return config;
}

export const formatPluginKey = new PluginKey("ai-ghost-format");

// 保存最后一次格式建议（插件的 activeSuggestion 会被清空，我们自己存）
let _lastSuggestion = "";
// 记录最近一次接受格式化的时间，避免接受后由 dispatch 触发的 completion 循环
let _lastAcceptTime = 0;
// 续写模式开关（整理模式下关闭）
let _suggestEnabled = true;
export function setSuggestEnabled(v: boolean) {
  _suggestEnabled = v;
  if (!v) _lastSuggestion = "";
}

function acceptFormat(view: EditorView, html: string) {
  try {
    const { $from } = view.state.selection;
    const start = $from.before(1);
    const end = $from.after(1);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const parsed = DOMParser.fromSchema(view.state.schema).parse(tempDiv);

    const tr = view.state.tr
      .replaceWith(start, end, parsed.content)
      .setMeta("prosemirror-completion", { type: "cancel" });
    view.dispatch(tr);
    view.focus();
    _lastSuggestion = "";
    _lastAcceptTime = Date.now();
  } catch (e) {
    console.error("格式化接受失败:", e);
  }
}

export const GhostFormat = Extension.create({
  name: "ghostFormat",

  onCreate() {
    this.editor.view.dom.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        if (_lastSuggestion) {
          acceptFormat(this.editor.view, _lastSuggestion);
        }
      }
      if (event.key === "Escape") {
        if (_lastSuggestion) {
          _lastSuggestion = "";
          this.editor.view.dispatch(
            this.editor.view.state.tr.setMeta("prosemirror-completion", { type: "cancel" }),
          );
        }
      }
    }, true);
  },

  addProseMirrorPlugins() {
    const completionPlugin = completion({
      debounceMs: 800,
      minTriggerLength: 3,
      ghostClassName: "prosemirror-ghost-text",
      showGhost: true,
      callCompletion: async (ctx) => {
        if (!_suggestEnabled) return "";
        const llmConfig = getLlmConfig();
        if (!llmConfig) return "";
        // 接受格式化后 2.5 秒内跳过，避免 dispatch 触发的循环
        if (Date.now() - _lastAcceptTime < 2500) return "";
        const paragraph = ctx.parent.textContent ?? "";
        if (paragraph.length < 20) return "";

        const beforeText = ctx.beforeText;
        const lines = beforeText.split("\n");
        lines.pop();
        const context = lines.join("\n").trim();

        try {
          const md = await callFormatApi(
            context || "(新笔记)",
            paragraph,
            ctx.abortController.signal,
          );
          const html = await renderMd(md);
          _lastSuggestion = html || paragraph;
          return html || paragraph;
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") return "";
          console.error("格式化失败:", err);
          return "";
        }
      },
      onError: () => {},
    });

    return [completionPlugin];
  },
});
