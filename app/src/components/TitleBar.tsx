type WriteMode = "suggest" | "format" | "off";

interface TitleBarProps {
  aiStatus: "idle" | "formatting" | "linking";
  mode: WriteMode;
  isDark: boolean;
  apiConfigured: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
}

const modeLabel: Record<WriteMode, string> = {
  suggest: "AI 续写",
  format: "AI 整理",
  off: "AI 关闭",
};

export function TitleBar({ aiStatus, mode, isDark, apiConfigured, onToggleDark, onOpenSettings }: TitleBarProps) {
  const isWorking = aiStatus !== "idle";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border-primary)",
        background: "rgba(var(--bg-primary-rgb, 255,255,255), 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          background: "#8b1a1a",
          borderRadius: 5,
          color: "white",
          fontSize: 13,
          fontFamily: "'STLiti','LiSu','KaiTi',serif",
        }}>爽</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>Shuang</span>
        <span
          style={{
            fontSize: 12,
            color: isWorking ? "var(--accent)" : "var(--text-muted)",
            background: isWorking ? "var(--accent-bg)" : "var(--bg-tertiary)",
            padding: "2px 8px",
            borderRadius: 4,
            marginLeft: 8,
          }}
        >
          {modeLabel[mode]}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!apiConfigured && mode !== "off" && (
          <span
            style={{
              fontSize: 11,
              color: "#dc2626",
              background: "#fef2f2",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            ⚠️ 未配置 API Key
          </span>
        )}
        {isWorking && (
          <span
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "var(--accent-bg)",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            ✨ 正在整理格式...
          </span>
        )}
        <button
          onClick={onOpenSettings}
          style={{
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 16,
          }}
        >
          ⚙️
        </button>
        <button
          onClick={onToggleDark}
          style={{
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: 16,
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
