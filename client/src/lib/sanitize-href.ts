/**
 * يحمي أزرار الموقع من روابط مكتوبة خطأً في لوحة الإدارة.
 * - الفارغ يبقى فارغاً (يعني إخفاء الزر).
 * - الروابط الصحيحة (مسار داخلي أو http أو mailto أو tel أو #) تبقى كما هي.
 * - بريد إلكتروني مكتوب مكان رابط صفحة يُحوَّل إلى صفحة التواصل بدل صفحة غير موجودة.
 * - مسار داخلي بلا شرطة أولى (مثل contact) تُضاف له.
 */
const VALID_START = /^(\/|#|https?:\/\/|mailto:|tel:)/i;

export function sanitizeHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const href = value.trim();
  if (!href) return "";
  if (VALID_START.test(href)) return href;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return "/contact";
  return `/${href}`;
}

/** يمرّ على كل مفتاح ينتهي بـ href/Href داخل كائن متداخل ويصلح قيمته. */
export function sanitizeHrefs<T>(input: T): T {
  if (Array.isArray(input)) return input.map((item) => sanitizeHrefs(item)) as unknown as T;
  if (input && typeof input === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      output[key] = /href$/i.test(key) ? sanitizeHref(val) : sanitizeHrefs(val);
    }
    return output as T;
  }
  return input;
}
