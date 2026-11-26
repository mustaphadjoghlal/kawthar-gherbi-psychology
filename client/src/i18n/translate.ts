/**
 * محرك ترجمة محتوى الموقع.
 *
 * المحتوى المحفوظ بالعربية (Firestore) يمرّ على هذا المحرك فيُستبدل كل نص بترجمته:
 *   1) ترجمة يدوية محفوظة من لوحة الإدارة لنفس المسار، ثم
 *   2) القاموس المدمج (content.ts) إن كان النص العربي مطابقاً لما فيه، ثم
 *   3) النص العربي كما هو إن لم توجد ترجمة.
 * مسارات عناصر القوائم تُبنى بمعرّف العنصر (id) لا بترتيبه، فلا تضيع الترجمة عند إعادة الترتيب.
 */
import { CONTENT } from "./content";
import type { Lang } from "./languages";

/** ترجمات يدوية: لكل لغة خريطة «مسار النص ← النص المترجم». */
export type Overrides = Partial<Record<Exclude<Lang, "ar">, Record<string, string>>>;

const ARABIC = /[؀-ۿ]/;
export const hasArabic = (value: string) => ARABIC.test(value);

/** الترجمة المدمجة لنص عربي، أو undefined إن لم توجد. */
export function builtinTranslation(source: string, lang: Lang): string | undefined {
  if (lang === "ar") return undefined;
  return CONTENT[source.trim()]?.[lang];
}

function localizeString(value: string, lang: Exclude<Lang, "ar">, overrides: Overrides, path: string) {
  const manual = overrides[lang]?.[path];
  if (manual) return manual;
  if (!hasArabic(value)) return value;
  return builtinTranslation(value, lang) ?? value;
}

export function localizeTree<T>(data: T, lang: Lang, overrides: Overrides, path: string): T {
  if (lang === "ar") return data;
  const target = lang;
  const walk = (node: unknown, nodePath: string): unknown => {
    if (typeof node === "string") return localizeString(node, target, overrides, nodePath);
    if (Array.isArray(node)) {
      return node.map((item, index) => {
        const id = item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id : String(index);
        return walk(item, `${nodePath}.${id}`);
      });
    }
    if (node && typeof node === "object") {
      return Object.fromEntries(Object.entries(node as Record<string, unknown>).map(([key, child]) => [key, walk(child, `${nodePath}.${key}`)]));
    }
    return node;
  };
  return walk(data, path) as T;
}

/** حقول siteInfo النصية التي يمكن ترجمتها يدوياً. */
export const SITE_INFO_TEXT_FIELDS = [
  "role", "heroEyebrow", "heroTitle", "heroDescription", "welcomeTitle", "welcomeText", "aboutTitle", "aboutText",
  "philosophyTitle", "philosophyText", "credentials", "yearsExperience", "location", "availability", "metaTitle", "metaDescription",
] as const;

export type TranslatableEntry = {
  path: string;
  group: string;
  label: string;
  source: string;
  /** نص طويل (فقرات) يحتاج حقلاً أكبر. */
  long: boolean;
};

type RawContent = {
  siteInfo: Record<string, unknown>;
  copy: unknown;
  navLinks: Array<{ id: string; label: string }>;
  principles: Array<{ id: string; title: string; text: string }>;
  services: Array<{ id: string; title: string; shortDescription: string; description: string }>;
  articles: Array<{ id: string; title: string; excerpt: string; category: string; content: string }>;
  testimonials: Array<{ id: string; name: string; text: string }>;
};

/** يجمع كل نصوص الموقع القابلة للترجمة في قائمة مسطّحة تعرضها لوحة الإدارة. */
export function collectTranslatable(raw: RawContent): TranslatableEntry[] {
  const entries: TranslatableEntry[] = [];
  const add = (path: string, group: string, label: string, source: unknown) => {
    if (typeof source !== "string" || !source.trim()) return;
    entries.push({ path, group, label, source, long: source.length > 90 || source.includes("\n") });
  };
  for (const field of SITE_INFO_TEXT_FIELDS) add(`siteInfo.${field}`, "بيانات الموقع", field, raw.siteInfo[field]);
  const walkCopy = (node: unknown, path: string) => {
    if (typeof node === "string") {
      if (!/href$/i.test(path)) add(path, "نصوص الصفحات", path.replace(/^copy\./, ""), node);
    } else if (Array.isArray(node)) node.forEach((item, index) => walkCopy(item, `${path}.${index}`));
    else if (node && typeof node === "object") Object.entries(node).forEach(([key, child]) => walkCopy(child, `${path}.${key}`));
  };
  walkCopy(raw.copy, "copy");
  raw.navLinks.forEach((item) => add(`navLinks.${item.id}.label`, "روابط التنقل", "الاسم", item.label));
  raw.principles.forEach((item) => {
    add(`principles.${item.id}.title`, "مبادئ العمل", `${item.title} — العنوان`, item.title);
    add(`principles.${item.id}.text`, "مبادئ العمل", `${item.title} — النص`, item.text);
  });
  raw.services.forEach((item) => {
    add(`services.${item.id}.title`, "الخدمات", `${item.title} — الاسم`, item.title);
    add(`services.${item.id}.shortDescription`, "الخدمات", `${item.title} — وصف قصير`, item.shortDescription);
    add(`services.${item.id}.description`, "الخدمات", `${item.title} — الوصف`, item.description);
  });
  raw.articles.forEach((item) => {
    add(`articles.${item.id}.title`, "المقالات", `${item.title} — العنوان`, item.title);
    add(`articles.${item.id}.category`, "المقالات", `${item.title} — التصنيف`, item.category);
    add(`articles.${item.id}.excerpt`, "المقالات", `${item.title} — المقتطف`, item.excerpt);
    add(`articles.${item.id}.content`, "المقالات", `${item.title} — النص الكامل`, item.content);
  });
  raw.testimonials.forEach((item) => {
    add(`testimonials.${item.id}.name`, "آراء العملاء", "الاسم", item.name);
    add(`testimonials.${item.id}.text`, "آراء العملاء", `${item.name} — الرأي`, item.text);
  });
  return entries;
}
