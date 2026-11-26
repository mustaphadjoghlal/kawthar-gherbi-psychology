/**
 * لغة الواجهة العامة (عربي / English / Français): تُحفظ في المتصفح، وتُضبط من الرابط
 * `?lang=en`، وتغيّر اتجاه الصفحة (RTL ↔ LTR). لوحة الإدارة تبقى عربية دائماً.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { DEFAULT_LANG, isLang, langMeta, type Lang } from "@/i18n/languages";
import { translateUi, type UiKey } from "@/i18n/ui";

const STORAGE_KEY = "kawthar_lang";

type LanguageContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  locale: string;
  setLang: (lang: Lang) => void;
  /** نص واجهة ثابت بلغة الزائر، مع متغيرات اختيارية مثل {name}. */
  t: (key: UiKey, vars?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* التخزين المحلي أو الرابط غير متاحين: نبقى على العربية. */
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [chosen, setChosen] = useState<Lang>(readInitialLang);
  const [location] = useLocation();
  // لوحة الإدارة عربية دائماً مهما كانت لغة الزائر.
  const lang: Lang = location.startsWith("/admin") ? DEFAULT_LANG : chosen;
  const meta = langMeta(lang);

  useEffect(() => {
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }, [meta.code, meta.dir]);

  const setLang = useCallback((next: Lang) => {
    setChosen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      // نزيل ?lang= من الرابط كي لا يتعارض مع الاختيار اللاحق.
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.delete("lang");
        window.history.replaceState(null, "", url.toString());
      }
    } catch {
      /* لا يؤثر على عمل الموقع. */
    }
  }, []);

  const t = useCallback((key: UiKey, vars?: Record<string, string>) => translateUi(key, lang, vars), [lang]);
  const value = useMemo(() => ({ lang, dir: meta.dir, locale: meta.locale, setLang, t }), [lang, meta.dir, meta.locale, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
