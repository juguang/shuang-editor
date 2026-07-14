import { useState, useEffect } from "react";
import { useI18n } from "./i18n";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { loadLlmConfig, saveLlmConfig, type LlmConfig } from "./ai";

interface SettingsProps {
  onClose: () => void;
  onDirChange?: () => void;
}

interface EditorConfig {
  fontSize: number;
  fontFamily: string;
}

const FONT_SIZE_OPTIONS = [
  { value: 14, labelKey: "settings.fontSmall" },
  { value: 16, labelKey: "settings.fontMedium" },
  { value: 18, labelKey: "settings.fontLarge" },
];

const FONT_FAMILY_OPTIONS = [
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', labelKey: "settings.fontDefault" },
  { value: '"Georgia", "Noto Serif CJK SC", serif', labelKey: "settings.fontSerif" },
  { value: '"JetBrains Mono", "Fira Code", monospace', labelKey: "settings.fontMono" },
];

function loadEditorConfig(): EditorConfig {
  try {
    const stored = localStorage.getItem("editor_config");
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return { fontSize: 16, fontFamily: FONT_FAMILY_OPTIONS[0].value };
}

function saveEditorConfig(config: EditorConfig) {
  localStorage.setItem("editor_config", JSON.stringify(config));
  document.documentElement.style.setProperty("--editor-font-size", `${config.fontSize}px`);
  document.documentElement.style.setProperty("--editor-font-family", config.fontFamily);
}

const providers = [
  { value: "deepseek" as const, label: "DeepSeek", defaultUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  { value: "openai" as const, label: "OpenAI", defaultUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  { value: "ollama" as const, label: "Ollama (本地)", defaultUrl: "http://localhost:11434/v1", defaultModel: "qwen2.5:14b" },
];

export function Settings({ onClose, onDirChange }: SettingsProps) {
  const { t, lang, setLang } = useI18n();
  const [activeTab, setActiveTab] = useState<"llm" | "editor" | "storage">("llm");
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(loadLlmConfig());
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(loadEditorConfig());
  const [storageDir, setStorageDir] = useState("");
  const [dirChanged, setDirChanged] = useState(false);

  // 获取当前存储目录
  useEffect(() => {
    invoke<string>("get_notes_dir")
      .then(setStorageDir)
      .catch(() => setStorageDir(""));
  }, []);

  useEffect(() => {
    saveEditorConfig(editorConfig);
  }, [editorConfig]);

  const handleProviderChange = (provider: typeof llmConfig.provider) => {
    const p = providers.find((p) => p.value === provider)!;
    // 切换 Provider 时不覆盖用户已输入的自定义模型
    setLlmConfig((prev) => ({
      ...prev,
      provider,
      baseUrl: p.defaultUrl,
      model: prev.model || p.defaultModel,
    }));
  };

  const handleSave = async () => {
    saveLlmConfig(llmConfig);
    if (dirChanged && storageDir.trim()) {
      try {
        await invoke("set_notes_dir", { path: storageDir.trim() });
      } catch (e) {
        console.error("设置目录失败:", e);
      }
    }
    if (dirChanged) onDirChange?.();
    onClose();
  };

  const tabButton = (value: "llm" | "editor" | "storage", label: string) => (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 0 10px 0",
        fontSize: 13,
        fontWeight: 500,
        color: activeTab === value ? "#111" : "#9ca3af",
        borderBottom: activeTab === value ? "2px solid #111" : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 13,
    background: "white",
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  };

  const activeBtnStyle: React.CSSProperties = {
    background: "#111",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  };

  const inactiveBtnStyle: React.CSSProperties = {
    background: "#f3f4f6",
    color: "#6b7280",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: 448,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* 标题 + 关闭 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111" }}>{t("settings.title")}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 22,
              color: "#9ca3af",
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {tabButton("llm", t("settings.tabLlm"))}
          {tabButton("editor", t("settings.tabEditor"))}
          {tabButton("storage", t("settings.tabStorage"))}
        </div>

        {/* 内容 */}
        <div style={{ padding: "20px 24px", maxHeight: 320, overflowY: "auto" }}>
          {activeTab === "storage" ? (
            <div>
              <label style={labelStyle}>{t("settings.noteDir")}</label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    background: "#f9fafb",
                    color: "#374151",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {storageDir || "~/Notebook"}
                </span>
                <button
                  onClick={async () => {
                    const dir = await open({ directory: true, multiple: false, title: lang === "zh" ? "选择笔记目录" : "Select Notes Directory" });
                    if (dir) {
                      // open 返回路径字符串（不含 file:// 前缀）
                      const path = typeof dir === "string" ? dir : dir;
                      setStorageDir(path);
                      setDirChanged(true);
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    background: "#111",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("settings.selectDir")}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>
                {t("settings.dirHint")}
              </p>
            </div>
          ) : activeTab === "llm" ? (
            <>
              {/* Provider */}
              <div style={sectionStyle}>
                <label style={labelStyle}>{t("settings.provider")}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {providers.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handleProviderChange(p.value)}
                      style={llmConfig.provider === p.value ? activeBtnStyle : inactiveBtnStyle}
                    >
                      {t("settings." + p.value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              {llmConfig.provider !== "ollama" && (
                <div style={sectionStyle}>
                  <label style={labelStyle}>{t("settings.apiKey")}</label>
                  <input
                    type="password"
                    value={llmConfig.apiKey}
                    onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                    style={inputStyle}
                  />
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>
                    {t("settings.apiKeyHint")}
                  </p>
                </div>
              )}

              {/* Model */}
              <div style={sectionStyle}>
                <label style={labelStyle}>{t("settings.model")}</label>
                <input
                  type="text"
                  value={llmConfig.model}
                  onChange={(e) => setLlmConfig({ ...llmConfig, model: e.target.value })}
                  placeholder="deepseek-chat"
                  style={inputStyle}
                />
              </div>

              {/* Base URL */}
              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>{t("settings.baseUrl")}</label>
                <input
                  type="text"
                  value={llmConfig.baseUrl}
                  onChange={(e) => setLlmConfig({ ...llmConfig, baseUrl: e.target.value })}
                  placeholder="https://api.deepseek.com/v1"
                  style={inputStyle}
                />
              </div>
            </>
          ) : (
            <>
              {/* 字号 */}
              <div style={sectionStyle}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>{t("settings.fontSize")}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEditorConfig({ ...editorConfig, fontSize: opt.value })}
                      style={{
                        ...(editorConfig.fontSize === opt.value ? activeBtnStyle : inactiveBtnStyle),
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 字体 */}
              <div style={{ marginBottom: 0 }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>{t("settings.fontFamily")}</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {FONT_FAMILY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEditorConfig({ ...editorConfig, fontFamily: opt.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        background: editorConfig.fontFamily === opt.value ? "#f3f4f6" : "white",
                        border: editorConfig.fontFamily === opt.value
                          ? "1px solid #e5e7eb"
                          : "1px solid transparent",
                        color: "#111",
                        fontFamily: opt.value,
                      }}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 语言切换 */}
              <div style={{ ...sectionStyle, marginBottom: 0 }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>{t("settings.language")}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setLang("zh")} style={lang === "zh" ? activeBtnStyle : inactiveBtnStyle}>
                    {t("settings.zh")}
                  </button>
                  <button onClick={() => setLang("en")} style={lang === "en" ? activeBtnStyle : inactiveBtnStyle}>
                    {t("settings.en")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 保存按钮 */}
        <div style={{ padding: "8px 24px 24px" }}>
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "10px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// 暴露给 App.tsx 使用的加载函数
export function applyEditorConfig() {
  try {
    const stored = localStorage.getItem("editor_config");
    if (stored) {
      const config = JSON.parse(stored);
      document.documentElement.style.setProperty("--editor-font-size", `${config.fontSize}px`);
      document.documentElement.style.setProperty("--editor-font-family", config.fontFamily);
    }
  } catch {
    /* ignore */
  }
}
