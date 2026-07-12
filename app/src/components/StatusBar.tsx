interface StatusBarProps {
  createdAt: string;
  onSave: () => void;
}

export function StatusBar({ createdAt, onSave }: StatusBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        borderTop: "1px solid #f0f0f0",
        background: "#fafafa",
      }}
    >
      <span style={{ fontSize: 11, color: "#9ca3af" }}>{createdAt}</span>
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
  );
}
