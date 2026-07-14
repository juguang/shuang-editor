import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TurndownService from "turndown";
import { GhostFormat, setSuggestEnabled } from "./extensions/ghostFormat";
import { formatTextStream, loadLlmConfig } from "./ai";
import { remark } from "remark";
import remarkHtml from "remark-html";

const mdToHtml = remark().use(remarkHtml);
const htmlToMd = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

async function renderMd(md: string): Promise<string> {
  try {
    const result = await mdToHtml.process(md);
    return String(result).trim();
  } catch {
    return md;
  }
}

type WriteMode = "suggest" | "format" | "off";
type AiStatus = "idle" | "formatting" | "linking";

interface EditorProps {
  content: string;
  mode: WriteMode;
  focusSignal: number;
  formatAllSignal: number;
  onUpdate: (html: string) => void;
  onStatusChange: (status: AiStatus) => void;
  onOpenNote: (id: string) => void;
}

export function Editor({
  content,
  mode,
  focusSignal,
  formatAllSignal,
  onUpdate,
  onStatusChange,
  onOpenNote,
}: EditorProps) {
  const [showSource, setShowSource] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "wiki-link" } }),
      Placeholder.configure({ placeholder: "开始写作... 不用管格式，AI会帮你整理 ✨" }),
      GhostFormat,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (!showSource) onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "",
        style:
          "padding: 32px 48px; min-height: calc(100vh - 120px); box-sizing: border-box; outline: none; border: none;",
      },
      handleClickOn: (_view, _pos, _node, _nodePos, event) => {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");
        if (anchor) {
          const href = anchor.getAttribute("href") ?? "";
          if (href.startsWith("note://")) {
            onOpenNote(href.slice("note://".length));
            return true;
          }
        }
        return false;
      },
    },
  });

  // Ctrl+/: 切换源码/预览模式
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (!showSource && editor) {
          setSourceText(htmlToMd.turndown(editor.getHTML()));
          setShowSource(true);
        } else if (showSource) {
          (async () => {
            const html = await renderMd(sourceText);
            if (editor) {
              editor.commands.setContent(html);
            }
            onUpdate(html);
          })();
          setShowSource(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSource, sourceText, editor, onUpdate]);

  // 切到源码后自动聚焦 textarea
  useEffect(() => {
    if (showSource && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showSource]);

  // 模式切换
  useEffect(() => {
    setSuggestEnabled(mode === "suggest");
  }, [mode]);

  // 外部 content 变化时更新编辑器
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !showSource) {
      editor.commands.setContent(content);
    }
  }, [content, editor, showSource]);

  // 新建笔记后自动聚焦
  useEffect(() => {
    if (editor && focusSignal > 0) {
      editor.commands.focus("end");
    }
  }, [focusSignal, editor]);

  // 整理全文
  useEffect(() => {
    if (!editor || formatAllSignal === 0) return;
    (async () => {
      const config = loadLlmConfig();
      if (!config.apiKey && !config.baseUrl.includes("localhost")) return;
      onStatusChange("formatting");
      try {
        const text = editor.getText();
        let formatted = "";
        for await (const chunk of formatTextStream(text, config)) {
          formatted += chunk;
        }
        const html = await renderMd(formatted);
        editor.commands.setContent(html);
      } catch (e) {
        console.error("整理全文失败:", e);
      } finally {
        onStatusChange("idle");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatAllSignal]);

  // 源码模式
  if (showSource) {
    return (
      <textarea
        ref={textareaRef}
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "calc(100vh - 120px)",
          padding: "32px 48px",
          fontSize: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.8,
          border: "none",
          outline: "none",
          resize: "none",
          background: "#fafafa",
          color: "#374151",
          boxSizing: "border-box",
        }}
      />
    );
  }

  if (!editor) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <span style={{ color: "#9ca3af" }}>加载编辑器...</span>
      </div>
    );
  }

  return <EditorContent editor={editor} className="tiptap-editor" />;
}
