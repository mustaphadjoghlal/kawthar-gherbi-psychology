/**
 * Design system: «ملاذ هادئ» — إعدادات Firebase العامة في مكان واحد واضح.
 *
 * هذه القيم ليست أسراراً: مفاتيح Firebase للويب مصممة لتكون ظاهرة في المتصفح،
 * والحماية الفعلية تأتي من قواعد Firestore وStorage.
 *
 * الموقع يشارك حالياً مشروع Firebase الخاص بموقع مصطفى جغلال، لأن ذلك المشروع
 * يملك Cloud Storage مفعّلاً بلا خطة مدفوعة. ولأن الموقعين يتشاركان المشروع،
 * تُسبَق كل مجموعات هذا الموقع بـ COLLECTION_PREFIX حتى لا تختلط ببيانات موقع
 * مصطفى — وبخاصة مجموعتا articles وsiteInfo المشتركتان بالاسم بين الموقعين.
 *
 * إن ضُبطت متغيرات البيئة `VITE_FIREBASE_*` فهي تسبق هذه القيم.
 */
export const firebaseConfigFallback = {
  apiKey: "AIzaSyBvljyA9z5O6zQHRtLIDxKnwyCxCF2vqL8",
  authDomain: "mustapha-portfolio.firebaseapp.com",
  projectId: "mustapha-portfolio",
  storageBucket: "mustapha-portfolio.firebasestorage.app",
  messagingSenderId: "597476763368",
  appId: "1:597476763368:web:48cdeccdc1bc21b22e0b5d",
};

/**
 * إعدادات مشروع كوثر المستقل، محفوظة هنا للعودة إليها متى فُعِّل فيه Storage
 * أو استُغني عن رفع الملفات. للتبديل: اجعلي firebaseConfigFallback تساوي هذا
 * الكائن، وفرّغي COLLECTION_PREFIX.
 */
export const kawtharOwnProjectConfig = {
  apiKey: "AIzaSyAsD0Us9u7lzKYy7VaEyZs091foGjCRA70",
  authDomain: "kawther-gherbi.firebaseapp.com",
  projectId: "kawther-gherbi",
  storageBucket: "kawther-gherbi.firebasestorage.app",
  messagingSenderId: "683448368253",
  appId: "1:683448368253:web:93842e5841043496180514",
};

/**
 * سابقة مجموعات Firestore الخاصة بهذا الموقع داخل المشروع المشترك.
 * تفريغها يجعل الموقع يستخدم الأسماء المجردة، وهو المناسب عند نقله
 * إلى مشروع Firebase مستقل.
 */
export const COLLECTION_PREFIX = "kawthar_";

/** مجلد ملفات هذا الموقع داخل Cloud Storage المشترك. */
export const STORAGE_FOLDER = "kawthar-assets";
