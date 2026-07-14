import { useI18n } from "../i18n";

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
  const { t } = useI18n();

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

  const statusText =
    saveStatus === "saving" ? t("statusbar.saving") :
    saveStatus === "saved" ? t("statusbar.saved") :
    "";

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
        {statusText && (
          <span style={{ fontSize: 11, color: saveColor[saveStatus] }}>
            {statusText}
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
          {segBtn("suggest", t("statusbar.suggest"))}
          {segBtn("format", t("statusbar.format"))}
          {segBtn("off", t("statusbar.off"))}
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
            {t("statusbar.formatAll")}
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
          {t("statusbar.save")}
        </button>
      </div>
    </div>
  );
}
