/**
 * ترجمة تلقائية لنصوص الموقع من العربية إلى الإنجليزية أو الفرنسية، لزر «ترجمة تلقائية» في لوحة الإدارة.
 *
 * الطلب: POST { lang: "en" | "fr", items: [{ id, text }] } مع ترويسة Authorization: Bearer <Firebase ID token>.
 * الرد: { translations: { [id]: "..." } }.
 *
 * محمية: لا تُنفَّذ إلا لمستخدمة مسجّلة الدخول في مشروع Firebase الخاص بالموقع (الإدارة)، كي لا
 * يستنزف أحد رصيد الترجمة. الترجمة الآلية مسودة تُراجَع في لوحة الإدارة قبل الحفظ.
 *
 * متغيرات البيئة:
 *   ANTHROPIC_API_KEY        (مطلوب) مفتاح خدمة الترجمة.
 *   TRANSLATE_MODEL          (اختياري) اسم النموذج، الافتراضي claude-sonnet-5-5.
 *   TRANSLATE_ADMIN_EMAILS   (اختياري) بريد/بريدات مفصولة بفاصلة تُقيَّد بها الصلاحية؛ وإلا فأي حساب إدارة مسجّل.
 *   FIREBASE_API_KEY         (اختياري) يسبق مفتاح Firebase العام المحفوظ في الكود.
 */
import { firebaseConfigFallback } from "../client/src/lib/firebase-config";

type Item = { id: string; text: string };

const LANG_NAMES: Record<string, string> = { en: "English", fr: "French" };
const MAX_ITEMS = 30;
const MAX_ITEM_CHARS = 8000;
const MAX_TOTAL_CHARS = 30000;

/** يتأكد أن رمز الدخول صالح، ويعيد بريد صاحبه أو null. */
async function verifyAdmin(idToken: string): Promise<string | null> {
  const apiKey = process.env.FIREBASE_API_KEY || firebaseConfigFallback.apiKey;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { users?: Array<{ email?: string }> };
  const email = data.users?.[0]?.email;
  if (!email) return null;
  const allowed = (process.env.TRANSLATE_ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes(email.toLowerCase())) return null;
  return email;
}

function readItems(body: unknown): { lang: string; items: Item[] } | null {
  if (!body || typeof body !== "object") return null;
  const { lang, items } = body as { lang?: unknown; items?: unknown };
  if (typeof lang !== "string" || !LANG_NAMES[lang] || !Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return null;
  const clean: Item[] = [];
  let total = 0;
  for (const item of items) {
    const { id, text } = (item ?? {}) as { id?: unknown; text?: unknown };
    if (typeof id !== "string" || typeof text !== "string" || !text.trim() || text.length > MAX_ITEM_CHARS) return null;
    total += text.length;
    clean.push({ id, text });
  }
  return total > MAX_TOTAL_CHARS ? null : { lang, items: clean };
}

function buildPrompt(lang: string) {
  const name = LANG_NAMES[lang];
  return [
    `You are a professional translator for the website of a clinical psychologist and art therapist (brand: BLUE PSYART; specialist: Kawthar Gherbi, Algeria).`,
    `Translate each Arabic text into ${name}.`,
    `Rules:`,
    `- Warm, calm, professional register suited to mental-health care. Address the reader neutrally${lang === "fr" ? ' (use "vous")' : ""}; do not assume the reader's gender.`,
    `- Keep brand names such as BLUE PSYART unchanged. Keep numbers, years, emails and URLs as they are.`,
    `- Preserve structure exactly: lines starting with "## " stay headings, keep blank lines, HTML tags and list markers. Do not add, remove or explain anything.`,
    `- Use correct clinical terminology (e.g. art therapy, clinical psychologist, early intervention).`,
    `Input is a JSON object mapping ids to Arabic texts. Reply with ONLY a JSON object mapping the same ids to the translated texts, no markdown fences, no commentary.`,
  ].join("\n");
}

async function translate(lang: string, items: Item[], apiKey: string): Promise<Record<string, string>> {
  const input = Object.fromEntries(items.map((item) => [item.id, item.text]));
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.TRANSLATE_MODEL || "claude-sonnet-5-5",
      max_tokens: 16000,
      system: buildPrompt(lang),
      messages: [{ role: "user", content: JSON.stringify(input) }],
    }),
  });
  if (!response.ok) throw new Error(`anthropic ${response.status}`);
  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content?.filter((part) => part.type === "text").map((part) => part.text ?? "").join("") ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("unparseable");
  const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const item of items) {
    const value = parsed[item.id];
    if (typeof value === "string" && value.trim()) result[item.id] = value.trim();
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "unauthenticated" });
  let email: string | null = null;
  try {
    email = await verifyAdmin(token);
  } catch (error) {
    console.error("[translate] auth", error);
    return res.status(502).json({ error: "auth_unavailable" });
  }
  if (!email) return res.status(403).json({ error: "forbidden" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "not_configured" });

  const input = readItems(req.body);
  if (!input) return res.status(400).json({ error: "invalid_payload" });
  try {
    const translations = await translate(input.lang, input.items, apiKey);
    return res.status(200).json({ translations });
  } catch (error) {
    console.error("[translate] failed", error);
    return res.status(502).json({ error: "translation_failed" });
  }
}
