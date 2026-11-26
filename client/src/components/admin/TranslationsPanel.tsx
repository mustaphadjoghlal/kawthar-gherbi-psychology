/**
 * لوحة الترجمات: تعرض كل نص عربي في الموقع بجانب ترجمته الإنجليزية أو الفرنسية.
 * النصوص المطابقة للقاموس المدمج تأتي مترجمة جاهزة؛ وأي نص عُدّل أو أُضيف حديثاً يظهر هنا
 * بحقل فارغ لتكتبي ترجمته، وتُحفظ الترجمة وتظهر للزوار فوراً.
 */
import { useEffect, useMemo, useState } from "react";
import { Languages, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { builtinTranslation, collectTranslatable } from "@/i18n/translate";

type TargetLang = "en" | "fr";
const TARGETS: Array<{ code: TargetLang; label: string }> = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export function TranslationsPanel() {
  const { siteInfo, copy, navLinks, principles, services, articles, testimonials, translations, saveTranslations } = useSiteContent();
  const [lang, setLang] = useState<TargetLang>("en");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const entries = useMemo(
    () => collectTranslatable({ siteInfo: siteInfo as unknown as Record<string, unknown>, copy, navLinks, principles, services, articles, testimonials }),
    [siteInfo, copy, navLinks, principles, services, articles, testimonials],
  );

  /** القيمة الفعلية الآن: ترجمة يدوية، ثم المدمجة، وإلا فارغ. */
  const effective = useMemo(() => {
    const result: Record<string, string> = {};
    for (const entry of entries) result[entry.path] = translations[lang]?.[entry.path] ?? builtinTranslation(entry.source, lang) ?? "";
    return result;
  }, [entries, translations, lang]);

  const [draft, setDraft] = useState<Record<string, string>>(effective);
  useEffect(() => { setDraft(effective); }, [effective]);

  const missingCount = entries.filter((entry) => !draft[entry.path]?.trim()).length;
  const visible = entries.filter((entry) => {
    if (onlyMissing && draft[entry.path]?.trim()) return false;
    const term = query.trim().toLowerCase();
    return !term || entry.source.toLowerCase().includes(term) || (draft[entry.path] ?? "").toLowerCase().includes(term) || entry.label.toLowerCase().includes(term);
  });
  const groups = Array.from(new Set(visible.map((entry) => entry.group)));

  const save = async () => {
    setSaving(true);
    try {
      // نحفظ فقط ما يختلف عن القاموس المدمج، فتبقى ترجماته الأصلية تعمل دون تكرار.
      const manual: Record<string, string> = {};
      for (const entry of entries) {
        const value = draft[entry.path]?.trim() ?? "";
        if (value && value !== (builtinTranslation(entry.source, lang) ?? "")) manual[entry.path] = value;
      }
      await saveTranslations(lang, manual);
      toast.success("تم حفظ الترجمات وتطبيقها على الموقع.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="admin-kicker">اللغات</p>
          <h2>الترجمات</h2>
          <p>اكتبي ترجمة كل نص بالإنجليزية والفرنسية. إن عدّلتِ نصاً عربياً لاحقاً فراجعي ترجمته هنا، وما لم تُكتب له ترجمة يظهر للزائر بالعربية.</p>
        </div>
        <button className="button-primary button-sm" type="button" onClick={save} disabled={saving}><Save size={16} />{saving ? "جارٍ الحفظ..." : "حفظ الترجمات"}</button>
      </div>

      <div className="translation-toolbar">
        <div className="lang-switch" role="group" aria-label="لغة الترجمة">
          {TARGETS.map((item) => (
            <button key={item.code} type="button" className={lang === item.code ? "active" : ""} aria-pressed={lang === item.code} onClick={() => setLang(item.code)}>{item.label}</button>
          ))}
        </div>
        <label className="translation-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث في النصوص..." /></label>
        <button type="button" className={`visibility-toggle ${onlyMissing ? "on" : ""}`} onClick={() => setOnlyMissing((value) => !value)}>
          <Languages size={16} />الناقصة فقط ({missingCount})
        </button>
      </div>
      <p className="admin-footnote">{entries.length - missingCount} من {entries.length} نصاً مترجم.</p>

      {groups.length === 0 && <p className="admin-empty">لا توجد نصوص مطابقة.</p>}
      {groups.map((group) => (
        <div className="admin-block" key={group}>
          <div className="admin-block-heading"><h3>{group}</h3></div>
          <div className="translation-list">
            {visible.filter((entry) => entry.group === group).map((entry) => {
              const value = draft[entry.path] ?? "";
              return (
                <div className={`translation-row ${value.trim() ? "" : "missing"}`} key={entry.path}>
                  <p className="translation-label">{entry.label}</p>
                  <p className="translation-source" lang="ar" dir="rtl">{entry.source}</p>
                  <textarea
                    dir="ltr"
                    lang={lang}
                    rows={entry.long ? Math.min(10, Math.max(3, Math.ceil(entry.source.length / 70))) : 2}
                    value={value}
                    placeholder={lang === "en" ? "English translation..." : "Traduction en français..."}
                    onChange={(event) => setDraft((current) => ({ ...current, [entry.path]: event.target.value }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
