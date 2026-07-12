type WriteMode = "suggest" | "format" | "off";

interface TitleBarProps {
  aiStatus: "idle" | "formatting" | "linking";
  mode: WriteMode;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
}

const modeLabel: Record<WriteMode, string> = {
  suggest: "● 续写",
  format: "● 整理",
  off: "○ 已关闭",
};

export function TitleBar({ aiStatus, mode, isDark, onToggleDark, onOpenSettings }: TitleBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #f0f0f0",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>📓</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>Notebook</span>
        <span
          style={{
            fontSize: 12,
            color: mode === "off" ? "#9ca3af" : "#6b7280",
            background: "#f3f4f6",
            padding: "2px 8px",
            borderRadius: 4,
            marginLeft: 8,
          }}
        >
          {modeLabel[mode]}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {aiStatus !== "idle" && (
          <span
            style={{
              fontSize: 12,
              color: "#3b82f6",
              background: "#eff6ff",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            ✨ 正在整理格式...
          </span>
        )}
        <button onClick={onOpenSettings} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 16 }}>
          ⚙️
        </button>
        <button onClick={onToggleDark} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 16 }}>
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
