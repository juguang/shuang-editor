type WriteMode = "suggest" | "format" | "off";
type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

interface StatusBarProps {
  createdAt: string;
  saveStatus: SaveStatus;
  mode: WriteMode;
  onModeChange: (mode: WriteMode) => void;
  onFormatAll: () => void;
  onSave: () => void;
}

const saveLabel: Record<SaveStatus, string> = {
  idle: "",
  saving: "保存中...",
  saved: "✓ 已保存",
  unsaved: "",
};

const saveColor: Record<SaveStatus, string> = {
  idle: "",
  saving: "var(--text-tertiary)",
  saved: "#059669",
  unsaved: "",
};

export function StatusBar({
  createdAt,
  saveStatus,
  mode,
  onModeChange,
  onFormatAll,
  onSave,
}: StatusBarProps) {
  const segBtn = (value: WriteMode, label: string) => (
    <button
      onClick={() => onModeChange(value)}
      style={{
        padding: "3px 10px",
        fontSize: 11,
        border: "none",
        cursor: "pointer",
        background: mode === value ? "var(--text-primary)" : "transparent",
        color: mode === value ? "var(--bg-primary)" : "var(--text-tertiary)",
        borderRadius: 5,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        borderTop: "1px solid var(--border-primary)",
        background: "var(--bg-secondary)",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{createdAt}</span>
        {saveStatus !== "idle" && (
          <span style={{ fontSize: 11, color: saveColor[saveStatus] }}>
            {saveLabel[saveStatus]}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            background: "var(--bg-tertiary)",
            borderRadius: 6,
            padding: 2,
            gap: 2,
          }}
        >
          {segBtn("suggest", "续写")}
          {segBtn("format", "整理")}
          {segBtn("off", "关闭")}
        </div>

        {mode === "format" && (
          <button
            onClick={onFormatAll}
            style={{
              padding: "4px 12px",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-secondary)",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ✨ 整理全文
          </button>
        )}

        <button
          onClick={onSave}
          style={{
            padding: "4px 16px",
            background: "var(--text-primary)",
            color: "var(--bg-primary)",
            borderRadius: 6,
            fontSize: 12,
            border: "none",
            cursor: "pointer",
          }}
        >
          💾 保存
        </button>
      </div>
    </div>
  );
}
