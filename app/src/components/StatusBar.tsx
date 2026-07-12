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
  idle: "#9ca3af",
  saving: "#6b7280",
  saved: "#059669",
  unsaved: "#9ca3af",
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
        background: mode === value ? "#111" : "transparent",
        color: mode === value ? "white" : "#6b7280",
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
        borderTop: "1px solid #f0f0f0",
        background: "#fafafa",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{createdAt}</span>
        {saveStatus !== "idle" && (
          <span style={{ fontSize: 11, color: saveColor[saveStatus] }}>
            {saveLabel[saveStatus]}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* 模式切换 */}
        <div
          style={{
            display: "flex",
            background: "#f3f4f6",
            borderRadius: 6,
            padding: 2,
            gap: 2,
          }}
        >
          {segBtn("suggest", "续写")}
          {segBtn("format", "整理")}
          {segBtn("off", "关闭")}
        </div>

        {/* 整理模式下显示整理全文按钮 */}
        {mode === "format" && (
          <button
            onClick={onFormatAll}
            style={{
              padding: "4px 12px",
              background: "white",
              color: "#111",
              border: "1px solid #e5e7eb",
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
            background: "#111",
            color: "white",
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
