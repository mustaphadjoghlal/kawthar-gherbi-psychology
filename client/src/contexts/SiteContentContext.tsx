/**
 * Design system: «ملاذ هادئ» — طبقة محتوى مرنة تجعل كل نص وصورة ولون قابلين للإدارة من مكان واحد.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { firestoreDb, firebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import { COLLECTION_PREFIX, STORAGE_FOLDER } from "@/lib/firebase-config";
import {
  defaultArticles,
  defaultNavLinks,
  defaultPrinciples,
  defaultServices,
  defaultSiteCopy,
  defaultSiteInfo,
} from "../lib/default-content";
import type {
  Article,
  BookingRequest,
  NavLink,
  Principle,
  Service,
  SiteCopy,
  SiteInfo,
  Testimonial,
} from "@/types/site";

type SiteContentContextValue = {
  siteInfo: SiteInfo;
  copy: SiteCopy;
  navLinks: NavLink[];
  principles: Principle[];
  services: Service[];
  articles: Article[];
  testimonials: Testimonial[];
  bookings: BookingRequest[];
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  saveSiteInfo: (data: SiteInfo) => Promise<void>;
  saveCopy: (data: SiteCopy) => Promise<void>;
  saveNavLink: (data: Omit<NavLink, "id"> & { id?: string }) => Promise<void>;
  deleteNavLink: (id: string) => Promise<void>;
  savePrinciple: (data: Omit<Principle, "id"> & { id?: string }) => Promise<void>;
  deletePrinciple: (id: string) => Promise<void>;
  saveService: (data: Omit<Service, "id"> & { id?: string }) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveArticle: (data: Omit<Article, "id"> & { id?: string }) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  saveTestimonial: (data: Omit<Testimonial, "id"> & { id?: string }) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  createBooking: (data: Omit<BookingRequest, "id" | "createdAt">) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  uploadImage: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  seedContent: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

const CACHE_KEY = "kawthar_site_content";
const CACHE_TTL = 1000 * 60 * 60 * 12;

type CachedShape = {
  siteInfo: SiteInfo;
  copy: SiteCopy;
  navLinks: NavLink[];
  principles: Principle[];
  services: Service[];
  articles: Article[];
  testimonials: Testimonial[];
};

/**
 * اسم المجموعة داخل المشروع المشترك. السابقة تفصل بيانات هذا الموقع عن
 * بيانات موقع مصطفى، إذ يتشارك الموقعان اسمَي articles وsiteInfo.
 */
const col = (name: string) => `${COLLECTION_PREFIX}${name}`;

const sortByPosition = <T extends { position: number }>(items: T[]) =>
  [...items].sort((a, b) => a.position - b.position);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** يدمج القيم المحفوظة فوق القيم الافتراضية، فيبقى كل حقل جديد يعمل مع المستندات القديمة. */
function mergeDeep<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  if (!isPlainObject(base)) return (override as T) ?? base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const baseValue = (base as Record<string, unknown>)[key];
    result[key] = isPlainObject(baseValue) ? mergeDeep(baseValue, value) : value;
  });
  return result as T;
}

const resolveSiteInfo = (data: Partial<SiteInfo>): SiteInfo => mergeDeep(defaultSiteInfo, data);
const resolveCopy = (data: Partial<SiteCopy>): SiteCopy => mergeDeep(defaultSiteCopy, data);

/**
 * رفع الملفات يحتاج Cloud Storage، وهو يتطلب خطة Blaze في المشاريع الحديثة.
 * الموقع يعمل كاملاً بدونه لأن كل حقل صورة يقبل رابطاً مباشراً.
 */
export const STORAGE_DISABLED_MESSAGE =
  "رفع الملفات يتطلب تفعيل Cloud Storage في مشروع Firebase. يمكنك لصق رابط صورة في الحقل بدلاً من ذلك.";

/** يترجم أخطاء Storage إلى رسالة تقول للمستخدمة ما العمل. */
function describeStorageError(error: unknown): Error {
  const code = String((error as { code?: string })?.code ?? "");
  if (code.includes("bucket-not-found") || code.includes("project-not-found") || code.includes("unknown")) {
    return new Error(STORAGE_DISABLED_MESSAGE);
  }
  if (code.includes("unauthorized") || code.includes("unauthenticated")) {
    return new Error("رفع الصور غير مصرّح به. تأكدي من تسجيل الدخول ومن نشر قواعد Storage المرفقة.");
  }
  if (code.includes("quota-exceeded")) return new Error("امتلأت مساحة التخزين المتاحة في مشروع Firebase.");
  if (code.includes("canceled")) return new Error("أُلغي رفع الملف.");
  return error instanceof Error ? error : new Error("تعذر رفع الملف.");
}

const toRgba = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((item) => item + item).join("") : value;
  const numeric = Number.parseInt(normalized, 16);
  if (Number.isNaN(numeric)) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
};

function readCache(): Partial<CachedShape> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: Partial<CachedShape>; timestamp: number };
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: Partial<CachedShape>) {
  try {
    const previous = readCache() ?? {};
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: { ...previous, ...data }, timestamp: Date.now() }));
  } catch {
    /* التخزين المحلي قد يكون معطلاً — لا يؤثر على عمل الموقع. */
  }
}

/** يحمّل خطوط Google المختارة مرة واحدة لكل عائلة خط. */
function useGoogleFonts(families: string[]) {
  useEffect(() => {
    const unique = Array.from(new Set(families.filter(Boolean)));
    unique.forEach((family) => {
      const id = `font-${family.replace(/\s+/g, "-").toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [families.join("|")]);
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const cached = useMemo(() => readCache(), []);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(
    cached?.siteInfo ? resolveSiteInfo(cached.siteInfo) : defaultSiteInfo,
  );
  const [copy, setCopy] = useState<SiteCopy>(cached?.copy ? resolveCopy(cached.copy) : defaultSiteCopy);
  const [navLinks, setNavLinks] = useState<NavLink[]>(cached?.navLinks ?? defaultNavLinks);
  const [principles, setPrinciples] = useState<Principle[]>(cached?.principles ?? defaultPrinciples);
  const [services, setServices] = useState<Service[]>(cached?.services ?? defaultServices);
  const [articles, setArticles] = useState<Article[]>(cached?.articles ?? defaultArticles);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(cached?.testimonials ?? []);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured && !cached);

  useEffect(() => {
    if (!firestoreDb) return;
    const db = firestoreDb;
    const unsubscribers = [
      onSnapshot(doc(db, col("siteInfo"), "profile"), (snapshot) => {
        if (snapshot.exists()) {
          const next = resolveSiteInfo(snapshot.data() as Partial<SiteInfo>);
          setSiteInfo(next);
          writeCache({ siteInfo: next });
        }
        setIsLoading(false);
      }),
      onSnapshot(doc(db, col("siteContent"), "copy"), (snapshot) => {
        if (!snapshot.exists()) return;
        const next = resolveCopy(snapshot.data() as Partial<SiteCopy>);
        setCopy(next);
        writeCache({ copy: next });
      }),
      onSnapshot(query(collection(db, col("navLinks")), orderBy("position")), (snapshot) => {
        if (snapshot.empty) return;
        const next = sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as NavLink));
        setNavLinks(next);
        writeCache({ navLinks: next });
      }),
      onSnapshot(query(collection(db, col("principles")), orderBy("position")), (snapshot) => {
        if (snapshot.empty) return;
        const next = sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Principle));
        setPrinciples(next);
        writeCache({ principles: next });
      }),
      onSnapshot(query(collection(db, col("services")), orderBy("position")), (snapshot) => {
        if (snapshot.empty) return;
        const next = sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Service));
        setServices(next);
        writeCache({ services: next });
      }),
      onSnapshot(query(collection(db, col("articles")), orderBy("position")), (snapshot) => {
        if (snapshot.empty) return;
        const next = sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Article));
        setArticles(next);
        writeCache({ articles: next });
      }),
      onSnapshot(query(collection(db, col("testimonials")), orderBy("position")), (snapshot) => {
        const next = sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Testimonial));
        setTestimonials(next);
        writeCache({ testimonials: next });
      }),
      onSnapshot(query(collection(db, col("bookingRequests")), orderBy("createdAt", "desc")), (snapshot) => {
        setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as BookingRequest));
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const theme = useMemo(() => ({ ...defaultSiteInfo.theme, ...siteInfo.theme }), [siteInfo.theme]);
  useGoogleFonts([theme.displayFont, theme.bodyFont]);

  useEffect(() => {
    const root = document.documentElement;
    const values: Record<string, string> = {
      "--ink": theme.ink,
      "--sage": theme.primary,
      "--sage-deep": theme.primaryDeep,
      "--sage-soft": theme.soft,
      "--clay": theme.accent,
      "--clay-soft": `color-mix(in srgb, ${theme.accent} 28%, ${theme.surface})`,
      "--ivory": theme.background,
      "--paper": theme.surface,
      "--sand": `color-mix(in srgb, ${theme.accent} 20%, ${theme.background})`,
      "--mist": `color-mix(in srgb, ${theme.soft} 58%, ${theme.surface})`,
      "--line": toRgba(theme.primaryDeep, 0.15),
      "--footer": theme.footer,
      "--background": theme.background,
      "--foreground": theme.ink,
      "--card": theme.surface,
      "--card-foreground": theme.ink,
      "--popover": theme.surface,
      "--popover-foreground": theme.ink,
      "--primary": theme.primary,
      "--secondary": theme.soft,
      "--secondary-foreground": theme.primaryDeep,
      "--accent": `color-mix(in srgb, ${theme.accent} 28%, ${theme.surface})`,
      "--accent-foreground": theme.primaryDeep,
      "--border": toRgba(theme.primaryDeep, 0.15),
      "--input": toRgba(theme.primaryDeep, 0.2),
      "--ring": theme.primary,
      "--font-display": `"${theme.displayFont}"`,
      "--font-body": `"${theme.bodyFont}"`,
      "--radius": `${theme.radius}rem`,
      "--base-font-size": `${theme.baseFontSize}px`,
    };
    Object.entries(values).forEach(([property, value]) => root.style.setProperty(property, value));
  }, [theme]);

  useEffect(() => {
    document.title = siteInfo.metaTitle || `${siteInfo.name} | ${siteInfo.role}`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", siteInfo.metaDescription);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme.primary);
  }, [siteInfo.metaTitle, siteInfo.metaDescription, siteInfo.name, siteInfo.role, theme.primary]);

  const ensureDb = () => {
    if (!firestoreDb) throw new Error("لم تُضف إعدادات Firebase بعد.");
    return firestoreDb;
  };

  /** يحفظ مستنداً في مجموعة، وينشئه إن لم يكن له معرّف. */
  const saveIn = async <T extends { id?: string }>(collectionName: string, data: T) => {
    const db = ensureDb();
    const { id, ...payload } = data;
    if (id) await setDoc(doc(db, col(collectionName), id), payload, { merge: true });
    else await addDoc(collection(db, col(collectionName)), payload);
  };

  const saveSiteInfo = async (data: SiteInfo) => {
    await setDoc(doc(ensureDb(), col("siteInfo"), "profile"), data, { merge: true });
  };
  const saveCopy = async (data: SiteCopy) => {
    await setDoc(doc(ensureDb(), col("siteContent"), "copy"), data, { merge: true });
  };
  const saveNavLink = (data: Omit<NavLink, "id"> & { id?: string }) => saveIn("navLinks", data);
  const deleteNavLink = async (id: string) => deleteDoc(doc(ensureDb(), col("navLinks"), id));
  const savePrinciple = (data: Omit<Principle, "id"> & { id?: string }) => saveIn("principles", data);
  const deletePrinciple = async (id: string) => deleteDoc(doc(ensureDb(), col("principles"), id));
  const saveService = (data: Omit<Service, "id"> & { id?: string }) => saveIn("services", data);
  const deleteService = async (id: string) => deleteDoc(doc(ensureDb(), col("services"), id));
  const saveArticle = (data: Omit<Article, "id"> & { id?: string }) => saveIn("articles", data);
  const deleteArticle = async (id: string) => deleteDoc(doc(ensureDb(), col("articles"), id));
  const saveTestimonial = (data: Omit<Testimonial, "id"> & { id?: string }) => saveIn("testimonials", data);
  const deleteTestimonial = async (id: string) => deleteDoc(doc(ensureDb(), col("testimonials"), id));
  const createBooking = async (data: Omit<BookingRequest, "id" | "createdAt">) => {
    await addDoc(collection(ensureDb(), col("bookingRequests")), { ...data, createdAt: new Date().toISOString() });
  };
  const deleteBooking = async (id: string) => deleteDoc(doc(ensureDb(), col("bookingRequests"), id));

  const uploadImage = async (file: File, onProgress?: (percent: number) => void) => {
    if (!firebaseStorage) throw new Error(STORAGE_DISABLED_MESSAGE);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageRef = ref(firebaseStorage, `${STORAGE_FOLDER}/${Date.now()}-${safeName}`);
    const task = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        (error) => reject(describeStorageError(error)),
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
      );
    });
  };

  const seedContent = async () => {
    const db = ensureDb();
    await setDoc(doc(db, col("siteInfo"), "profile"), defaultSiteInfo);
    await setDoc(doc(db, col("siteContent"), "copy"), defaultSiteCopy);
    await Promise.all([
      ...defaultNavLinks.map(({ id, ...item }) => setDoc(doc(db, col("navLinks"), id), item)),
      ...defaultPrinciples.map(({ id, ...item }) => setDoc(doc(db, col("principles"), id), item)),
      ...defaultServices.map(({ id, ...item }) => setDoc(doc(db, col("services"), id), item)),
      ...defaultArticles.map(({ id, ...item }) => setDoc(doc(db, col("articles"), id), item)),
    ]);
  };

  const value = useMemo(
    () => ({
      siteInfo,
      copy,
      navLinks,
      principles,
      services,
      articles,
      testimonials,
      bookings,
      isLoading,
      isFirebaseConfigured,
      saveSiteInfo,
      saveCopy,
      saveNavLink,
      deleteNavLink,
      savePrinciple,
      deletePrinciple,
      saveService,
      deleteService,
      saveArticle,
      deleteArticle,
      saveTestimonial,
      deleteTestimonial,
      createBooking,
      deleteBooking,
      uploadImage,
      seedContent,
    }),
    [siteInfo, copy, navLinks, principles, services, articles, testimonials, bookings, isLoading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error("useSiteContent يجب أن يستخدم داخل SiteContentProvider");
  return context;
}
