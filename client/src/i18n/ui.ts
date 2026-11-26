/**
 * نصوص الواجهة الثابتة المكتوبة في الكود (أزرار، تسميات، رسائل). أما نصوص الصفحات
 * القابلة للتعديل من لوحة الإدارة فتُترجم عبر content.ts وترجمات لوحة الإدارة.
 */
import type { Lang } from "./languages";

type Entry = Record<Lang, string>;

export const UI = {
  readArticle: { ar: "اقرئي المقال", en: "Read the article", fr: "Lire l'article" },
  continueReading: { ar: "تابعي القراءة", en: "Continue reading", fr: "Poursuivre la lecture" },
  articleNotFound: { ar: "لم نعثر على هذا المقال.", en: "We couldn't find this article.", fr: "Nous n'avons pas trouvé cet article." },
  bookService: { ar: "حجز {service}", en: "Book: {service}", fr: "Réserver : {service}" },
  contactAbout: { ar: "التواصل بخصوص {service}", en: "Get in touch about {service}", fr: "Nous contacter à propos de {service}" },
  qualifications: { ar: "المؤهلات", en: "Qualifications", fr: "Qualifications" },
  experience: { ar: "الخبرة", en: "Experience", fr: "Expérience" },
  email: { ar: "البريد الإلكتروني", en: "Email", fr: "E-mail" },
  phone: { ar: "الهاتف", en: "Phone", fr: "Téléphone" },
  whatsapp: { ar: "واتساب", en: "WhatsApp", fr: "WhatsApp" },
  location: { ar: "المكان", en: "Location", fr: "Lieu" },
  namePlaceholder: { ar: "اكتبي اسمك", en: "Write your name", fr: "Saisissez votre nom" },
  chooseService: { ar: "اختاري خدمة", en: "Choose a service", fr: "Choisissez un service" },
  timePlaceholder: { ar: "مثال: صباحاً خلال أيام الأسبوع", en: "e.g. mornings on weekdays", fr: "ex. : le matin en semaine" },
  messagePlaceholder: {
    ar: "اكتبي باختصار ما ترغبين في مناقشته...",
    en: "Briefly write what you'd like to discuss...",
    fr: "Écrivez brièvement ce dont vous souhaitez parler...",
  },
  sending: { ar: "جارٍ إرسال الطلب...", en: "Sending your request...", fr: "Envoi de la demande..." },
  errorNotConnected: {
    ar: "لم يكتمل ربط نموذج الحجز بقاعدة البيانات بعد. يُرجى التواصل عبر البريد أو الهاتف الظاهرين أدناه.",
    en: "The booking form isn't connected to the database yet. Please get in touch by email or phone using the details below.",
    fr: "Le formulaire de réservation n'est pas encore relié à la base de données. Merci de nous contacter par e-mail ou par téléphone avec les coordonnées ci-dessous.",
  },
  errorSend: { ar: "تعذر إرسال الطلب حالياً.", en: "We couldn't send your request right now.", fr: "Impossible d'envoyer la demande pour le moment." },
  visitorLanguage: { ar: "لغة الزائر: {language}", en: "Visitor language: {language}", fr: "Langue du visiteur : {language}" },
  homeAria: { ar: "العودة إلى الرئيسية", en: "Back to the home page", fr: "Retour à l'accueil" },
  mainNav: { ar: "التنقل الرئيسي", en: "Main navigation", fr: "Navigation principale" },
  openMenu: { ar: "فتح قائمة التنقل", en: "Open the navigation menu", fr: "Ouvrir le menu de navigation" },
  mobileNav: { ar: "التنقل على الهاتف", en: "Mobile navigation", fr: "Navigation mobile" },
  logoAlt: { ar: "رمز {name}", en: "{name} logo", fr: "Logo {name}" },
  heroServicesButton: { ar: "الخدمات", en: "Services", fr: "Services" },
  language: { ar: "اللغة", en: "Language", fr: "Langue" },
} satisfies Record<string, Entry>;

export type UiKey = keyof typeof UI;

export function translateUi(key: UiKey, lang: Lang, vars?: Record<string, string>) {
  let text: string = UI[key][lang] ?? UI[key].ar;
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, value);
  return text;
}
