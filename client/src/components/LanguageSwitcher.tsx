/**
 * مبدّل اللغة: ثلاثة أزرار صغيرة (عربي / EN / FR) تعمل في الترويسة وقائمة الجوال.
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/i18n/languages";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t("language")}>
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          lang={item.code}
          title={item.name}
          aria-label={item.name}
          aria-pressed={lang === item.code}
          className={lang === item.code ? "active" : ""}
          onClick={() => setLang(item.code)}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
