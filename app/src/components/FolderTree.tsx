import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n";

export interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  children: Folder[];
}

export const defaultFolders: Folder[] = [
  { id: "diary", name: "日记", expanded: true, children: [] },
  { id: "project", name: "项目", expanded: true, children: [] },
  { id: "meeting", name: "会议", expanded: false, children: [] },
  { id: "reading", name: "读书笔记", expanded: false, children: [] },
  { id: "essay", name: "随笔", expanded: false, children: [] },
];

interface NoteSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

interface FolderTreeProps {
  selectedFolder: string | null;
  notes: NoteSummary[];
  currentNoteId: string | null;
  searchQuery: string;
  folders: Folder[];
  onFoldersChange: (folders: Folder[]) => void;
  onSelectFolder: (id: string | null) => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} style={{ background: "#fde68a", color: "#92400e", padding: "0 1px", borderRadius: 2 }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/// 在指定父文件夹下创建子文件夹（递归查找）
function addChildFolder(list: Folder[], parentId: string | null, child: Folder): boolean {
  if (parentId === null) {
    list.push(child);
    return true;
  }
  for (const f of list) {
    if (f.id === parentId) {
      f.children.push(child);
      return true;
    }
    if (f.children.length && addChildFolder(f.children, parentId, child)) return true;
  }
  return false;
}

export function FolderTree({
  selectedFolder,
  notes,
  currentNoteId,
  searchQuery,
  folders,
  onFoldersChange,
  onSelectFolder,
  onSelectNote,
  onDeleteNote,
}: FolderTreeProps) {
  const { t } = useI18n();
  // 翻译文件夹名（只有预设文件夹有翻译，用户创建的不翻译）
  const folderName = (id: string, fallback: string) => {
    const r = t("folder." + id);
    return r !== "folder." + id ? r : fallback;
  };
  const [isCreating, setIsCreating] = useState<string | null>(null); // parent folder id, null = root
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating !== null && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  const toggleExpand = (id: string) => {
    const update = (list: Folder[]): Folder[] =>
      list.map((f) => (f.id === id ? { ...f, expanded: !f.expanded } : { ...f, children: update(f.children) }));
    onFoldersChange(update(folders));
  };

  const isSearching = searchQuery.trim().length > 0;

  const getFolderNotes = (folderId: string): NoteSummary[] => {
    return notes.filter((note) => {
      const t = note.title.toLowerCase();
      const c = note.preview.toLowerCase();
      switch (folderId) {
        case "diary": return t.includes("日记") || t.includes("今天") || t.includes("日常");
        case "project": return t.includes("项目") || t.includes("方案") || t.includes("技术") || c.includes("编辑器");
        case "meeting": return t.includes("会议") || t.includes("讨论") || t.includes("周会");
        case "reading": return t.includes("读书") || t.includes("笔记") || t.includes("书");
        case "essay": {
          const matched = new Set(
            ["diary", "project", "meeting", "reading"].flatMap((fid) =>
              getFolderNotes(fid).map((n) => n.id),
            ),
          );
          return !matched.has(note.id);
        }
        default: return false;
      }
    });
  };

  const renderFolderRow = (folder: Folder, depth: number) => {
    const noteCount = getFolderNotes(folder.id).length;
    const creatingHere = isCreating === folder.id;
    const expanded = isSearching ? noteCount > 0 : folder.expanded;

    return (
      <div key={folder.id}>
        {/* 文件夹行 */}
        <div
          onClick={() => {
            toggleExpand(folder.id);
            onSelectFolder(folder.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 4px",
            cursor: "pointer",
            borderRadius: 4,
            marginLeft: depth * 16,
            background: selectedFolder === folder.id ? "var(--bg-tertiary)" : "transparent",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--text-muted)", width: 12 }}>
            {folder.children.length > 0 || noteCount > 0 ? (expanded ? "▾" : "▸") : ""}
          </span>
          <span style={{ fontSize: 13 }}>📁</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
            {folderName(folder.id, folder.name)}
          </span>
          {noteCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>{noteCount}</span>
          )}
          {/* 新建子文件夹按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNewName("");
              setIsCreating(folder.id);
            }}
            style={{
              opacity: 0.4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
            title="新建子文件夹"
          >
            +
          </button>
        </div>

        {/* 展开的子文件夹和笔记 */}
        {(expanded || isSearching) && (
          <div>
            {/* 子文件夹 */}
            {folder.children.map((child) => renderFolderRow(child, depth + 1))}

            {/* 笔记列表 */}
            {getFolderNotes(folder.id).length > 0 && (
              <div style={{ marginLeft: (depth + 1) * 16 + 12 }}>
                {getFolderNotes(folder.id).map((note) => {
                  const selected = currentNoteId === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 0 2px 16px",
                        borderLeft: `1.5px solid ${selected ? "var(--accent)" : "var(--border-secondary)"}`,
                        background: selected ? "var(--accent-bg)" : "transparent",
                        borderRadius: "0 4px 4px 0",
                        marginLeft: -16,
                        paddingLeft: 30,
                        color: selected ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: selected ? 500 : 400,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <span>📄</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {highlight(note.title, searchQuery)}
                      </span>
                      {selected && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: 11,
                            color: "var(--text-muted)",
                            opacity: 0.6,
                          }}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 内联新建输入框 */}
        {creatingHere && (
          <div style={{ marginLeft: (depth + 1) * 16 + 16 }}>
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  const child: Folder = { id: `${folder.id}/${newName.trim().toLowerCase().replace(/\s+/g, "-")}`, name: newName.trim(), expanded: true, children: [] };
                  const updated = [...folders];
                  addChildFolder(updated, folder.id, child);
                  onFoldersChange(updated);
                  setNewName("");
                  setIsCreating(null);
                }
                if (e.key === "Escape") { setNewName(""); setIsCreating(null); }
              }}
              onBlur={() => { setNewName(""); setIsCreating(null); }}
              placeholder={t("sidebar.subFolder")}
              style={{
                width: "100%",
                padding: "3px 6px",
                fontSize: 12,
                border: "1px solid var(--accent)",
                borderRadius: 4,
                outline: "none",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)", flex: 1, overflowY: "auto" }}>
      {folders.map((folder) => renderFolderRow(folder, 0))}

      {/* 底部新建根文件夹 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 0",
        marginTop: 8,
        borderTop: "1px solid var(--border-primary)",
        paddingTop: 8,
      }}>
        {isCreating === null ? (
          <button
            onClick={() => setIsCreating("_root")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            {t("sidebar.newFolder")}
          </button>
        ) : isCreating === "_root" ? (
          <input
            ref={isCreating === "_root" ? inputRef : undefined}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                const child: Folder = { id: newName.trim().toLowerCase().replace(/\s+/g, "-"), name: newName.trim(), expanded: true, children: [] };
                onFoldersChange([...folders, child]);
                setNewName("");
                setIsCreating(null);
              }
              if (e.key === "Escape") { setNewName(""); setIsCreating(null); }
            }}
            onBlur={() => { setNewName(""); setIsCreating(null); }}
            placeholder={t("editor.folderName")}
            style={{
              flex: 1,
              padding: "3px 6px",
              fontSize: 12,
              border: "1px solid var(--accent)",
              borderRadius: 4,
              outline: "none",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
