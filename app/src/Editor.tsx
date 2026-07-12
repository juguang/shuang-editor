import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useCallback } from "react";
import { remark } from "remark";
import remarkHtml from "remark-html";

const mdToHtml = remark().use(remarkHtml);

/** 将 markdown 字符串转为 HTML */
async function renderMd(md: string): Promise<string> {
  try {
    const result = await mdToHtml.process(md);
    return String(result).trim();
  } catch {
    return md;
  }
}

interface EditorProps {
  content: string;
  onUpdate: (html: string) => void;
  onFormatTrigger: (text: string, callback: (formatted: string) => void) => void;
}

export function Editor({ content, onUpdate, onFormatTrigger }: EditorProps) {
  const formatQueueRef = useRef<string>("");
  const formattingRef = useRef<boolean>(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "wiki-link",
        },
      }),
      Placeholder.configure({
        placeholder: "开始写作... 不用管格式，AI会帮你整理 ✨",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "",
        style:
          "padding: 32px 48px; min-height: calc(100vh - 120px); box-sizing: border-box; outline: none; border: none;",
      },
    },
  });

  // 当外部 content 变化时更新编辑器
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 格式化处理：只格式化新增的段落，保留已有内容
  const handleFormat = useCallback(
    (text: string) => {
      if (!text.trim() || text.length < 20) return;

      formatQueueRef.current = text;
      if (formattingRef.current) return;

      // debounce 2 秒后触发
      setTimeout(async () => {
        const toFormat = formatQueueRef.current;
        if (!toFormat.trim() || formattingRef.current) return;

        formattingRef.current = true;
        try {
          await new Promise<void>((resolve) => {
            onFormatTrigger(toFormat, async (formatted) => {
              if (editor && formatted && formatted !== toFormat) {
                // AI 返回的是 markdown，转成 HTML 再渲染
                const html = await renderMd(formatted);
                editor.commands.setContent(html);
              }
              resolve();
            });
          });
        } finally {
          formattingRef.current = false;
        }
      }, 2000);
    },
    [editor, onFormatTrigger],
  );

  // 监听段落完成（回车键）
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(() => {
          const text = editor.getText();
          handleFormat(text);
        }, 100);
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);
    return () => dom.removeEventListener("keydown", handleKeyDown);
  }, [editor, handleFormat]);

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
