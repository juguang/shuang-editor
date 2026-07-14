import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Typora 风格内联预览：
 * - 光标在标题上时显示灰色 # 标记
 * - 快捷键 Cmd+1/2/3 切换标题级别，Cmd+0 转段落
 * - 快捷键 Shift+Tab / Tab 切换上下级标题
 */
export const LivePreview = Extension.create({
  name: "livePreview",

  addKeyboardShortcuts() {
    return {
      "Mod-1": () => this.editor.commands.toggleHeading({ level: 1 }),
      "Mod-2": () => this.editor.commands.toggleHeading({ level: 2 }),
      "Mod-3": () => this.editor.commands.toggleHeading({ level: 3 }),
      "Mod-0": () => this.editor.commands.setParagraph(),
      "Shift-Tab": () => {
        const { $from } = this.editor.state.selection;
        const headingLevel = this.editor.isActive("heading") ? ($from.parent.attrs.level as number) : 0;
        if (headingLevel > 1) {
          return this.editor.commands.toggleHeading({ level: (headingLevel - 1) as 1 | 2 | 3 });
        }
        return this.editor.commands.setParagraph();
      },
      Tab: () => {
        const rawLevel = this.editor.isActive("heading")
          ? (this.editor.state.selection.$from.parent.attrs.level as number)
          : 0;
        if (rawLevel && rawLevel < 3) {
          return this.editor.commands.toggleHeading({ level: (rawLevel + 1) as 1 | 2 | 3 });
        }
        // 有 ghost 建议时让 Tab 被 ghost 处理
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr) {
            const sel = tr.selection;
            if (!sel || !tr.doc) return DecorationSet.empty;

            const decorations: Decoration[] = [];
            const { $from } = sel;
            const depth = $from.depth;

            for (let d = 1; d <= depth; d++) {
              const node = $from.node(d);
              const type = node.type.name;

              if (type === "heading") {
                const pos = $from.before(d);
                const marker = "#".repeat(node.attrs.level);
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "live-preview-heading",
                    "data-md": marker + " ",
                  }),
                );
              } else if (type === "bulletList") {
                for (let d2 = d; d2 <= depth; d2++) {
                  const n2 = $from.node(d2);
                  if (n2.type.name === "listItem") {
                    const liPos = $from.before(d2);
                    decorations.push(
                      Decoration.node(liPos, liPos + n2.nodeSize, {
                        class: "live-preview-marker",
                        "data-md": "- ",
                      }),
                    );
                  }
                }
              } else if (type === "blockquote") {
                const pos = $from.before(d);
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "live-preview-marker",
                    "data-md": "> ",
                  }),
                );
              }

              break;
            }

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
