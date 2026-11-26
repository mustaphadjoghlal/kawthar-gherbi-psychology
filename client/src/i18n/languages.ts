/**
 * اللغات المدعومة في الموقع العام. العربية هي الأصل ولغة المحتوى المحفوظ في لوحة الإدارة.
 */
export type Lang = "ar" | "en" | "fr";

export const LANGUAGES: ReadonlyArray<{
  code: Lang;
  /** الاسم الكامل بلغته. */
  name: string;
  /** الاختصار الظاهر في المبدّل. */
  short: string;
  dir: "rtl" | "ltr";
  /** لغة تنسيق التواريخ. */
  locale: string;
}> = [
  { code: "ar", name: "العربية", short: "عربي", dir: "rtl", locale: "ar-DZ" },
  { code: "en", name: "English", short: "EN", dir: "ltr", locale: "en-GB" },
  { code: "fr", name: "Français", short: "FR", dir: "ltr", locale: "fr-FR" },
];

export const DEFAULT_LANG: Lang = "ar";

export const isLang = (value: unknown): value is Lang => value === "ar" || value === "en" || value === "fr";

export const langMeta = (lang: Lang) => LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];
