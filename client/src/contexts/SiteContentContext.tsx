/**
 * Design system: «ملاذ هادئ» — طبقة محتوى مرنة تجعل كل نص وصورة قابلين للإدارة من مكان واحد.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firestoreDb, firebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import { defaultArticles, defaultServices, defaultSiteInfo } from "../lib/default-content";
import type { Article, BookingRequest, Service, SiteInfo, Testimonial } from "@/types/site";

type SiteContentContextValue = {
  siteInfo: SiteInfo;
  services: Service[];
  articles: Article[];
  testimonials: Testimonial[];
  bookings: BookingRequest[];
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  saveSiteInfo: (data: SiteInfo) => Promise<void>;
  saveService: (data: Omit<Service, "id"> & { id?: string }) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveArticle: (data: Omit<Article, "id"> & { id?: string }) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  saveTestimonial: (data: Omit<Testimonial, "id"> & { id?: string }) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  createBooking: (data: Omit<BookingRequest, "id" | "createdAt">) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  seedContent: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

const sortByPosition = <T extends { position: number }>(items: T[]) => [...items].sort((a, b) => a.position - b.position);
const resolveSiteInfo = (data: Partial<SiteInfo>): SiteInfo => ({ ...defaultSiteInfo, ...data, theme: { ...defaultSiteInfo.theme, ...data.theme } });
const toRgba = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((item) => item + item).join("") : value;
  const numeric = Number.parseInt(normalized, 16);
  return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
};

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [articles, setArticles] = useState<Article[]>(defaultArticles);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!firestoreDb) return;
    const unsubscribers = [
      onSnapshot(doc(firestoreDb, "siteInfo", "profile"), (snapshot) => {
        if (snapshot.exists()) setSiteInfo(resolveSiteInfo(snapshot.data() as Partial<SiteInfo>));
        setIsLoading(false);
      }),
      onSnapshot(query(collection(firestoreDb, "services"), orderBy("position")), (snapshot) => {
        if (!snapshot.empty) setServices(sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Service)));
      }),
      onSnapshot(query(collection(firestoreDb, "articles"), orderBy("position")), (snapshot) => {
        if (!snapshot.empty) setArticles(sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Article)));
      }),
      onSnapshot(query(collection(firestoreDb, "testimonials"), orderBy("position")), (snapshot) => {
        setTestimonials(sortByPosition(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Testimonial)));
      }),
      onSnapshot(query(collection(firestoreDb, "bookingRequests"), orderBy("createdAt", "desc")), (snapshot) => {
        setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as BookingRequest));
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    const theme = { ...defaultSiteInfo.theme, ...siteInfo.theme };
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
    };
    Object.entries(values).forEach(([property, value]) => root.style.setProperty(property, value));
  }, [siteInfo.theme]);

  const ensureDb = () => {
    if (!firestoreDb) throw new Error("لم تُضف إعدادات Firebase بعد.");
    return firestoreDb;
  };

  const saveSiteInfo = async (data: SiteInfo) => {
    const db = ensureDb();
    await setDoc(doc(db, "siteInfo", "profile"), data, { merge: true });
  };
  const saveService = async (data: Omit<Service, "id"> & { id?: string }) => {
    const db = ensureDb();
    const { id, ...payload } = data;
    if (id) await setDoc(doc(db, "services", id), payload, { merge: true });
    else await addDoc(collection(db, "services"), payload);
  };
  const deleteService = async (id: string) => deleteDoc(doc(ensureDb(), "services", id));
  const saveArticle = async (data: Omit<Article, "id"> & { id?: string }) => {
    const db = ensureDb();
    const { id, ...payload } = data;
    if (id) await setDoc(doc(db, "articles", id), payload, { merge: true });
    else await addDoc(collection(db, "articles"), payload);
  };
  const deleteArticle = async (id: string) => deleteDoc(doc(ensureDb(), "articles", id));
  const saveTestimonial = async (data: Omit<Testimonial, "id"> & { id?: string }) => {
    const db = ensureDb();
    const { id, ...payload } = data;
    if (id) await setDoc(doc(db, "testimonials", id), payload, { merge: true });
    else await addDoc(collection(db, "testimonials"), payload);
  };
  const deleteTestimonial = async (id: string) => deleteDoc(doc(ensureDb(), "testimonials", id));
  const createBooking = async (data: Omit<BookingRequest, "id" | "createdAt">) => {
    await addDoc(collection(ensureDb(), "bookingRequests"), { ...data, createdAt: new Date().toISOString() });
  };
  const uploadImage = async (file: File) => {
    if (!firebaseStorage) throw new Error("لم تُضف إعدادات Firebase Storage بعد.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageRef = ref(firebaseStorage, `site-assets/${Date.now()}-${safeName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  const seedContent = async () => {
    const db = ensureDb();
    await setDoc(doc(db, "siteInfo", "profile"), defaultSiteInfo);
    await Promise.all(defaultServices.map(({ id, ...item }) => setDoc(doc(db, "services", id), item)));
    await Promise.all(defaultArticles.map(({ id, ...item }) => setDoc(doc(db, "articles", id), item)));
  };

  const value = useMemo(
    () => ({
      siteInfo,
      services,
      articles,
      testimonials,
      bookings,
      isLoading,
      isFirebaseConfigured,
      saveSiteInfo,
      saveService,
      deleteService,
      saveArticle,
      deleteArticle,
      saveTestimonial,
      deleteTestimonial,
      createBooking,
      uploadImage,
      seedContent,
    }),
    [siteInfo, services, articles, testimonials, bookings, isLoading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error("useSiteContent يجب أن يستخدم داخل SiteContentProvider");
  return context;
}
