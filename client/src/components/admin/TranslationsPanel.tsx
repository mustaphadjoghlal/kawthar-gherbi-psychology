/**
 * لوحة الترجمات: تعرض كل نص عربي في الموقع بجانب ترجمته الإنجليزية أو الفرنسية.
 * النصوص المطابقة للقاموس المدمج تأتي مترجمة جاهزة؛ وأي نص عُدّل أو أُضيف حديثاً يظهر هنا
 * بحقل فارغ لتكتبي ترجمته، وتُحفظ الترجمة وتظهر للزوار فوراً.
 */
import { useEffect, useMemo, useState } from "react";
import { Languages, Save, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { firebaseAuth } from "@/lib/firebase";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { builtinTranslation, collectTranslatable } from "@/i18n/translate";

type TargetLang = "en" | "fr";
const TARGETS: Array<{ code: TargetLang; label: string }> = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

type Entry = ReturnType<typeof collectTranslatable>[number];
type TokenProvider = () => Promise<string | undefined>;
const defaultTokenProvider: TokenProvider = async () => firebaseAuth?.currentUser?.getIdToken();

/** يرسل دفعة نصوص للترجمة الآلية ويعيد «المسار ← الترجمة». */
async function requestMachineTranslation(lang: TargetLang, batch: Entry[], getToken: TokenProvider): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) throw new Error("انتهت جلسة الدخول. سجّلي الدخول من جديد ثم أعيدي المحاولة.");
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lang, items: batch.map((entry, index) => ({ id: String(index), text: entry.source })) }),
  });
  const data = (await response.json().catch(() => ({}))) as { translations?: Record<string, string>; error?: string };
  if (!response.ok) {
    if (data.error === "not_configured") throw new Error("لم يُضبط مفتاح الترجمة بعد. أضيفي المتغير ANTHROPIC_API_KEY في إعدادات Vercel ثم أعيدي النشر.");
    if (data.error === "forbidden" || data.error === "unauthenticated") throw new Error("هذا الحساب غير مخوّل بالترجمة الآلية.");
    throw new Error("تعذرت الترجمة الآلية الآن. حاولي مرة أخرى بعد قليل.");
  }
  const result: Record<string, string> = {};
  batch.forEach((entry, index) => {
    const value = data.translations?.[String(index)];
    if (value) result[entry.path] = value;
  });
  return result;
}

/** حجم الدفعة: صغير كي لا تتجاوز مهلة الدالة، ومتتابع كي لا نرهق الحساب. */
const BATCH_ITEMS = 8;
const BATCH_CHARS = 5000;
const toBatches = (entries: Entry[]) => {
  const batches: Entry[][] = [];
  let current: Entry[] = [];
  let chars = 0;
  for (const entry of entries) {
    if (current.length && (current.length >= BATCH_ITEMS || chars + entry.source.length > BATCH_CHARS)) {
      batches.push(current);
      current = [];
      chars = 0;
    }
    current.push(entry);
    chars += entry.source.length;
  }
  if (current.length) batches.push(current);
  return batches;
};

export function TranslationsPanel({ getToken = defaultTokenProvider }: { getToken?: TokenProvider } = {}) {
  const { siteInfo, copy, navLinks, principles, services, articles, testimonials, translations, saveTranslations } = useSiteContent();
  const [lang, setLang] = useState<TargetLang>("en");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  /** مسارات مُلئت آلياً ولم تُراجَع بعد (تزول بمجرد تعديل النص يدوياً). */
  const [autoPaths, setAutoPaths] = useState<Set<string>>(new Set());
  const [translating, setTranslating] = useState(false);

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
  useEffect(() => { setDraft(effective); setAutoPaths(new Set()); }, [effective]);

  const missingCount = entries.filter((entry) => !draft[entry.path]?.trim()).length;
  const visible = entries.filter((entry) => {
    if (onlyMissing && draft[entry.path]?.trim()) return false;
    const term = query.trim().toLowerCase();
    return !term || entry.source.toLowerCase().includes(term) || (draft[entry.path] ?? "").toLowerCase().includes(term) || entry.label.toLowerCase().includes(term);
  });
  const groups = Array.from(new Set(visible.map((entry) => entry.group)));

  /** يترجم النصوص المحددة آلياً ويضعها في الحقول كمسودة للمراجعة، دون حفظ. */
  const autoTranslate = async (targets: Entry[]) => {
    if (!targets.length) { toast.info("لا توجد نصوص ناقصة لترجمتها."); return; }
    setTranslating(true);
    let done = 0;
    try {
      for (const batch of toBatches(targets)) {
        const result = await requestMachineTranslation(lang, batch, getToken);
        setDraft((current) => ({ ...current, ...result }));
        setAutoPaths((current) => new Set([...Array.from(current), ...Object.keys(result)]));
        done += Object.keys(result).length;
      }
      toast.success(`تمت ترجمة ${done} نصاً آلياً. راجعيها وصححي ما يلزم ثم اضغطي «حفظ الترجمات».`);
    } catch (error) {
      if (done) toast.warning(`تمت ترجمة ${done} نصاً قبل أن تتوقف العملية.`);
      toast.error(error instanceof Error ? error.message : "تعذرت الترجمة الآلية.");
    } finally {
      setTranslating(false);
    }
  };
  const translateMissing = () => autoTranslate(entries.filter((entry) => !draft[entry.path]?.trim()));

  const save = async () => {
    if (autoPaths.size > 0 && !window.confirm(`فيها ${autoPaths.size} ترجمة آلية لم تُعدَّل بعد. هل راجعتِها وتريدين حفظها؟`)) return;
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
        <button type="button" className="button-quiet-dark button-sm" onClick={translateMissing} disabled={translating || missingCount === 0}>
          <Wand2 size={16} />{translating ? "جارٍ الترجمة..." : `ترجمة تلقائية للناقص (${missingCount})`}
        </button>
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
                  <p className="translation-label">
                    {entry.label}
                    {autoPaths.has(entry.path) && <span className="translation-auto">ترجمة آلية — راجعيها</span>}
                    <button type="button" className="translation-retry" disabled={translating} onClick={() => autoTranslate([entry])}><Wand2 size={13} />ترجم آلياً</button>
                  </p>
                  <p className="translation-source" lang="ar" dir="rtl">{entry.source}</p>
                  <textarea
                    dir="ltr"
                    lang={lang}
                    rows={entry.long ? Math.min(10, Math.max(3, Math.ceil(entry.source.length / 70))) : 2}
                    value={value}
                    placeholder={lang === "en" ? "English translation..." : "Traduction en français..."}
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, [entry.path]: event.target.value }));
                      setAutoPaths((current) => { const next = new Set(current); next.delete(entry.path); return next; });
                    }}
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
