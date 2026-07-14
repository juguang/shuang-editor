import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Typora 风格内联预览：
 * 光标进入标题/列表/引用块时，灰色显示对应的 md 标记（#、-、>）
 */
export const LivePreview = Extension.create({
  name: "livePreview",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, _oldSet) {
            const sel = tr.selection;
            if (!sel) return DecorationSet.empty;

            const doc = tr.doc;
            if (!doc) return DecorationSet.empty;

            const decorations: Decoration[] = [];
            const { $from } = sel;
            const depth = $from.depth;

            // 查找光标所在的块节点（heading / paragraph / bulletList / orderedList / blockquote）
            for (let d = 1; d <= depth; d++) {
              const node = $from.node(d);
              const type = node.type.name;
              let marker = "";

              if (type === "heading") {
                marker = "#".repeat(node.attrs.level);
              } else if (type === "bulletList") {
                // 对列表项加 marker
                for (let d2 = d; d2 <= depth; d2++) {
                  const n2 = $from.node(d2);
                  if (n2.type.name === "listItem") {
                    const pos = $from.before(d2);
                    decorations.push(
                      Decoration.node(pos, pos + n2.nodeSize, {
                        class: "live-preview-marker",
                        "data-md": "- ",
                      }),
                    );
                  }
                }
              } else if (type === "orderedList") {
                // ordered list marker shown as bullet for simplicity
              } else if (type === "blockquote") {
                const pos = $from.before(d);
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "live-preview-marker",
                    "data-md": "> ",
                  }),
                );
              }

              if (marker) {
                const pos = $from.before(d);
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "live-preview-marker",
                    "data-md": marker + " ",
                  }),
                );
              }
              break; // 只处理最近的块节点
            }

            return DecorationSet.create(doc, decorations);
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
