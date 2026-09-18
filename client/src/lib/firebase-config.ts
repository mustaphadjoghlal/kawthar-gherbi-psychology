/**
 * Design system: «ملاذ هادئ» — إعدادات Firebase العامة في مكان واحد واضح.
 *
 * هذه القيم ليست أسراراً: مفاتيح Firebase للويب مصممة لتكون ظاهرة في المتصفح،
 * والحماية الفعلية تأتي من قواعد Firestore وStorage المرفقة في المستودع.
 *
 * لربط الموقع: الصقي القيم الستة من Firebase Console
 * (Project settings ← Your apps ← SDK setup and configuration ← Config).
 *
 * إن ضُبطت متغيرات البيئة `VITE_FIREBASE_*` فهي تسبق هذه القيم،
 * ما يتيح استخدام مشروع Firebase مختلف للتجارب من دون تعديل الكود.
 */
export const firebaseConfigFallback = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
