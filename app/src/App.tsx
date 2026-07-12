import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Editor } from "./Editor";
import { Settings, applyEditorConfig } from "./Settings";
import { TitleBar } from "./components/TitleBar";
import { FolderTree } from "./components/FolderTree";
import { StatusBar } from "./components/StatusBar";
import { formatTextStream, autoLink, generateTitle, loadLlmConfig } from "./ai";

interface NoteData {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface NoteSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

function App() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "formatting" | "linking">("idle");
  const [isDark, setIsDark] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // 加载编辑器字体设置
  // selectedFolder 保留供后续文件夹过滤使用
  useEffect(() => {
    applyEditorConfig();
  }, []);

  // 加载笔记列表
  const refreshNotes = useCallback(async () => {
    try {
      const result = await invoke<NoteSummary[]>("list_notes");
      setNotes(result);
    } catch (e) {
      console.error("加载笔记失败:", e);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  // 搜索
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      refreshNotes();
      return;
    }
    try {
      const result = await invoke<NoteSummary[]>("search_notes", { query: searchQuery });
      setNotes(result);
    } catch (e) {
      console.error("搜索失败:", e);
    }
  }, [searchQuery, refreshNotes]);

  // 新建笔记
  const handleNewNote = useCallback(async () => {
    try {
      const note = await invoke<NoteData>("create_note", { title: null });
      setCurrentNote(note);
      await refreshNotes();
    } catch (e) {
      console.error("创建笔记失败:", e);
    }
  }, [refreshNotes]);

  // 打开笔记
  const handleOpenNote = useCallback(async (id: string) => {
    try {
      const note = await invoke<NoteData>("read_note", { id });
      setCurrentNote(note);
    } catch (e) {
      console.error("读取笔记失败:", e);
    }
  }, []);

  // 删除笔记
  const handleDeleteNote = useCallback(async (id: string) => {
    if (!confirm("确定删除？")) return;
    try {
      await invoke("delete_note", { id });
      if (currentNote?.id === id) setCurrentNote(null);
      await refreshNotes();
    } catch (e) {
      console.error("删除失败:", e);
    }
  }, [currentNote, refreshNotes]);

  // 保存笔记
  const handleSave = useCallback(async (html: string) => {
    if (!currentNote) return;
    try {
      await invoke("save_note", {
        id: currentNote.id,
        title: currentNote.title,
        content: html,
        createdAt: currentNote.created_at,
      });
    } catch (e) {
      console.error("保存失败:", e);
    }
  }, [currentNote]);

  // AI格式化
  const handleFormatTrigger = useCallback(
    async (text: string, callback: (formatted: string) => void) => {
      const config = loadLlmConfig();
      if (!config.apiKey && config.provider !== "ollama") {
        callback(text);
        return;
      }

      setAiStatus("formatting");
      try {
        let formatted = "";
        for await (const chunk of formatTextStream(text, config)) {
          formatted += chunk;
        }
        callback(formatted.trim());
      } catch (e) {
        console.error("格式化失败:", e);
        callback(text);
      } finally {
        setAiStatus("idle");
      }
    },
    [],
  );

  // 保存时自动链接 + 生成标题
  const handleSaveWithAI = useCallback(async () => {
    if (!currentNote) return;
    const config = loadLlmConfig();

    let content = currentNote.content;

    if (config.apiKey || config.provider === "ollama") {
      setAiStatus("linking");
      try {
        const titles = await invoke<[string, string][]>("get_all_titles");
        const otherTitles = titles.filter(([_, id]) => id !== currentNote.id);
        if (otherTitles.length > 0) {
          const links = await autoLink(content, otherTitles, config);
          for (const link of links) {
            const escaped = link.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            content = content.replace(new RegExp(escaped, "g"), `[[${link.text}]]`);
          }
        }
      } catch (e) {
        console.error("自动链接失败:", e);
      }

      if (currentNote.title === "新笔记") {
        try {
          const title = await generateTitle(content, config);
          if (title) currentNote.title = title;
        } catch (e) {
          console.error("生成标题失败:", e);
        }
      }

      setAiStatus("idle");
    }

    setCurrentNote({ ...currentNote, content });
    await handleSave(content);
    await refreshNotes();
  }, [currentNote, handleSave, refreshNotes]);

  // 切换暗色模式
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 顶栏 */}
      <TitleBar
        aiStatus={aiStatus}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 侧边栏 */}
        <aside
          style={{
            width: 280,
            minWidth: 280,
            borderRight: "1px solid #f0f0f0",
            background: "#fafafa",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 新建按钮 */}
          <div style={{ padding: 12 }}>
            <button
              onClick={handleNewNote}
              style={{
                width: "100%",
                padding: 8,
                background: "#111",
                color: "white",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>+</span> 新建笔记
            </button>

            {/* 搜索 */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="搜索笔记..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                background: "white",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 文件夹树 + 笔记列表（集成） */}
          <FolderTree
            selectedFolder={selectedFolder}
            notes={notes}
            currentNoteId={currentNote?.id ?? null}
            onSelectFolder={setSelectedFolder}
            onSelectNote={handleOpenNote}
            onDeleteNote={handleDeleteNote}
            onNewFolder={() => alert("新建文件夹（MVP 占位）")}
          />
        </aside>

        {/* 编辑区 */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}>
          {currentNote ? (
            <>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <Editor
                  content={currentNote.content}
                  onUpdate={(html) => {
                    setCurrentNote({ ...currentNote, content: html });
                  }}
                  onFormatTrigger={handleFormatTrigger}
                />
              </div>
              <StatusBar createdAt={currentNote.created_at} onSave={handleSaveWithAI} />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ fontSize: 60, marginBottom: 16 }}>📓</span>
              <p style={{ fontSize: 18, color: "#6b7280", margin: 0 }}>
                选择一个笔记或创建新笔记开始
              </p>
              <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
                写的时候不用管格式，AI会自动帮你整理 ✨
              </p>
            </div>
          )}
        </main>
      </div>

      {/* 设置弹窗 */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
