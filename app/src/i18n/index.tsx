import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import zh from "./zh";
import en from "./en";

type Lang = "zh" | "en";

interface I18nContextType {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
}

const messages: Record<Lang, Record<string, string>> = { zh, en };
const STORAGE_KEY = "shuang_lang";

const I18nContext = createContext<I18nContextType>({
  lang: "zh",
  t: (k: string) => k,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
    // 自动检测系统语言
    if (typeof navigator !== "undefined") {
      const navLang = navigator.language?.toLowerCase() || "";
      return navLang.startsWith("zh") ? "zh" : "en";
    }
    return "zh";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return messages[lang]?.[key] ?? key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
