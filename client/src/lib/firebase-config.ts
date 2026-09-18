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
  apiKey: "AIzaSyAsD0Us9u7lzKYy7VaEyZs091foGjCRA70",
  authDomain: "kawther-gherbi.firebaseapp.com",
  projectId: "kawther-gherbi",
  storageBucket: "kawther-gherbi.firebasestorage.app",
  messagingSenderId: "683448368253",
  appId: "1:683448368253:web:93842e5841043496180514",
};
