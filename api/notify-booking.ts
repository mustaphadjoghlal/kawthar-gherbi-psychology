/**
 * إشعار فوري عند وصول طلب حجز جديد: Telegram والبريد الإلكتروني.
 *
 * دالة Vercel تُستدعى من الموقع بعد حفظ الطلب في Firestore. فشل الإشعار لا يؤثر
 * على حفظ الطلب، فالطلب محفوظ في لوحة الإدارة في كل الأحوال.
 *
 * متغيرات البيئة (كلها اختيارية، وتُفعَّل كل قناة بمتغيراتها):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *   RESEND_API_KEY, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM
 */

type Payload = {
  name: string;
  email: string;
  phone: string;
  preferredService: string;
  preferredTime: string;
  message: string;
};

const LIMITS: Record<keyof Payload, number> = {
  name: 120,
  email: 200,
  phone: 40,
  preferredService: 200,
  preferredTime: 200,
  message: 3000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readPayload(body: unknown): Payload | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  const result = {} as Payload;
  for (const key of Object.keys(LIMITS) as Array<keyof Payload>) {
    const value = source[key];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > LIMITS[key]) return null;
    result[key] = trimmed;
  }
  return EMAIL_PATTERN.test(result.email) ? result : null;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** يمنع استدعاء الدالة من موقع آخر: يجب أن يطابق مصدر الطلب مضيف الموقع نفسه. */
function isSameOrigin(headers: Record<string, string | string[] | undefined>) {
  const origin = headers.origin;
  const host = headers.host;
  if (typeof origin !== "string" || typeof host !== "string") return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function sendTelegram(data: Payload, adminUrl: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return "skipped";
  const text = [
    "<b>طلب حجز جديد</b>",
    "",
    `<b>الاسم:</b> ${escapeHtml(data.name)}`,
    `<b>الخدمة:</b> ${escapeHtml(data.preferredService)}`,
    `<b>الوقت المفضل:</b> ${escapeHtml(data.preferredTime)}`,
    `<b>الهاتف:</b> ${escapeHtml(data.phone)}`,
    `<b>البريد:</b> ${escapeHtml(data.email)}`,
    "",
    escapeHtml(data.message),
    "",
    `<a href="${escapeHtml(adminUrl)}">فتح لوحة الإدارة</a>`,
  ].join("\n");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!response.ok) throw new Error(`telegram ${response.status}`);
  return "sent";
}

async function sendEmail(data: Payload, adminUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!apiKey || !to || !from) return "skipped";
  const text = [
    `اسم الزائرة: ${data.name}`,
    `الخدمة: ${data.preferredService}`,
    `الوقت المفضل: ${data.preferredTime}`,
    `الهاتف: ${data.phone}`,
    `البريد: ${data.email}`,
    "",
    data.message,
    "",
    `لوحة الإدارة: ${adminUrl}`,
  ].join("\n");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((item) => item.trim()).filter(Boolean),
      reply_to: data.email,
      subject: `طلب حجز جديد من ${data.name}`,
      text,
    }),
  });
  if (!response.ok) throw new Error(`resend ${response.status}`);
  return "sent";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!isSameOrigin(req.headers)) return res.status(403).json({ error: "forbidden" });

  const data = readPayload(req.body);
  if (!data) return res.status(400).json({ error: "invalid_payload" });

  const adminUrl = `https://${req.headers.host}/admin`;
  const [telegram, email] = await Promise.allSettled([sendTelegram(data, adminUrl), sendEmail(data, adminUrl)]);
  const report = (item: PromiseSettledResult<string>) => (item.status === "fulfilled" ? item.value : "failed");
  const result = { telegram: report(telegram), email: report(email) };
  if (telegram.status === "rejected") console.error("[notify-booking] telegram", telegram.reason);
  if (email.status === "rejected") console.error("[notify-booking] email", email.reason);
  return res.status(200).json(result);
}
