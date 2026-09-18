/**
 * Design system: «ملاذ هادئ» — إعدادات Firebase العامة في مكان واحد واضح.
 *
 * هذه القيم ليست أسراراً: مفاتيح Firebase للويب مصممة لتكون ظاهرة في المتصفح،
 * والحماية الفعلية تأتي من قواعد Firestore وStorage المرفقة في المستودع.
 *
 * الموقع يستخدم مشروع Firebase الخاص به وحده، فلا حاجة لسابقة على أسماء
 * المجموعات ولا لمشاركة بيانات مع أي موقع آخر.
 *
 * إن ضُبطت متغيرات البيئة `VITE_FIREBASE_*` فهي تسبق هذه القيم.
 */
export const firebaseConfigFallback = {
  apiKey: "AIzaSyAsD0Us9u7lzKYy7VaEyZs091foGjCRA70",
  authDomain: "kawther-gherbi.firebaseapp.com",
  projectId: "kawther-gherbi",
  storageBucket: "kawther-gherbi.firebasestorage.app",
  messagingSenderId: "683448368253",
  appId: "1:683448368253:web:93842e5841043496180514",
};

/**
 * سابقة أسماء مجموعات Firestore. تبقى فارغة ما دام الموقع يملك مشروعه
 * الخاص؛ وتُملأ فقط لو شارك مشروعاً مع موقع آخر يستخدم أسماء مشابهة.
 */
export const COLLECTION_PREFIX = "";

/** مجلد ملفات الموقع داخل Cloud Storage. */
export const STORAGE_FOLDER = "site-assets";
