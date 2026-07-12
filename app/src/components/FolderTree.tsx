import { useState } from "react";
import type { ReactNode } from "react";

interface Folder {
  id: string;
  name: string;
  expanded: boolean;
}

const defaultFolders: Folder[] = [
  { id: "diary", name: "日记", expanded: true },
  { id: "project", name: "项目", expanded: true },
  { id: "meeting", name: "会议", expanded: false },
  { id: "reading", name: "读书笔记", expanded: false },
  { id: "essay", name: "随笔", expanded: false },
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
  onSelectFolder: (id: string | null) => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onNewFolder: () => void;
}

/** 高亮搜索关键词 */
function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark
        key={i}
        style={{ background: "#fde68a", color: "#92400e", padding: "0 1px", borderRadius: 2 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function FolderTree({
  selectedFolder,
  notes,
  currentNoteId,
  searchQuery,
  onSelectFolder,
  onSelectNote,
  onDeleteNote,
  onNewFolder,
}: FolderTreeProps) {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);

  const toggleExpand = (id: string) => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, expanded: !f.expanded } : f)));
  };

  // 启发式分配
  const getFolderNotes = (folderId: string): NoteSummary[] => {
    return notes.filter((note) => {
      const title = note.title.toLowerCase();
      const content = note.preview.toLowerCase();
      switch (folderId) {
        case "diary":
          return title.includes("日记") || title.includes("今天") || title.includes("日常");
        case "project":
          return title.includes("项目") || title.includes("方案") || title.includes("技术") || content.includes("编辑器");
        case "meeting":
          return title.includes("会议") || title.includes("讨论") || title.includes("周会");
        case "reading":
          return title.includes("读书") || title.includes("笔记") || title.includes("书");
        case "essay":
          return true;
        default:
          return false;
      }
    });
  };

  const getFolderNoteCount = (folderId: string): number => {
    if (folderId === "essay") {
      const matchedIds = new Set(
        ["diary", "project", "meeting", "reading"].flatMap((fid) =>
          getFolderNotes(fid).map((n) => n.id),
        ),
      );
      return notes.filter((n) => !matchedIds.has(n.id)).length;
    }
    return getFolderNotes(folderId).length;
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div style={{ padding: "8px 12px", fontSize: 13, color: "#374151", flex: 1, overflowY: "auto" }}>
      {folders.map((folder) => {
        const folderNotes = getFolderNotes(folder.id);
        const noteCount = getFolderNoteCount(folder.id);
        const showExpanded = isSearching ? folderNotes.length > 0 : folder.expanded;

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
                gap: 6,
                padding: "4px 0",
                cursor: "pointer",
                background: selectedFolder === folder.id ? "#f3f4f6" : "transparent",
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {showExpanded ? "▾" : "▸"}
              </span>
              <span style={{ fontWeight: 500, color: "#111" }}>
                📁 {folder.name}
              </span>
              {noteCount > 0 && (
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {noteCount}
                </span>
              )}
            </div>

            {/* 展开后的笔记列表 */}
            {showExpanded && (
              <div style={{ paddingLeft: 24 }}>
                {folderNotes.map((note) => {
                  const selected = currentNoteId === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 0 3px 16px",
                        borderLeft: `1.5px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
                        background: selected ? "#eff6ff" : "transparent",
                        borderRadius: "0 4px 4px 0",
                        marginLeft: -16,
                        paddingLeft: 32,
                        color: selected ? "#1d4ed8" : "#374151",
                        fontWeight: selected ? 500 : 400,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <span>📄</span>
                      <span style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
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
                            color: "#9ca3af",
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
        );
      })}

      {/* 新建文件夹 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 0",
          marginTop: 8,
          borderTop: "1px solid #f0f0f0",
          paddingTop: 8,
        }}
      >
        <button
          onClick={onNewFolder}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          + 新建文件夹
        </button>
      </div>
    </div>
  );
}
