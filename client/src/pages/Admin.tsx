/**
 * Design system: «ملاذ هادئ» — إدارة عملية، هادئة، واضحة الهرمية ومغايرة لواجهة الزائر العامة.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { BarChart3, BookOpenText, ChevronLeft, ClipboardList, ImagePlus, LayoutDashboard, LogOut, MailCheck, MessageSquareQuote, Palette, PenLine, Plus, Save, Settings2, ShieldCheck, Sparkles, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useSiteContent } from "@/contexts/SiteContentContext";
import type { Article, Service, SiteInfo, SiteTheme, Testimonial } from "@/types/site";

type Tab = "overview" | "profile" | "theme" | "services" | "articles" | "testimonials" | "bookings";
const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "profile", label: "بيانات الموقع", icon: Settings2 },
  { id: "theme", label: "الهوية البصرية", icon: Palette },
  { id: "services", label: "الخدمات", icon: Sparkles },
  { id: "articles", label: "المقالات", icon: BookOpenText },
  { id: "testimonials", label: "آراء العملاء", icon: MessageSquareQuote },
  { id: "bookings", label: "طلبات الحجز", icon: ClipboardList },
];

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`admin-field ${className}`}><span>{label}</span>{children}</label>;
}

function ImageField({ label, value, onChange, uploadImage }: { label: string; value: string; onChange: (url: string) => void; uploadImage: (file: File) => Promise<string> }) {
  const [isUploading, setIsUploading] = useState(false);
  const handleFile = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try { onChange(await uploadImage(file)); toast.success("تم رفع الصورة."); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر رفع الصورة."); } finally { setIsUploading(false); }
  };
  return <div className="admin-image-field"><Field label={label}><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="رابط الصورة" dir="ltr" /></Field><label className="upload-button"><ImagePlus size={16} />{isUploading ? "جارٍ الرفع..." : "رفع صورة"}<input type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} disabled={isUploading} /></label>{value && <img src={value} alt="معاينة" />}</div>;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setIsSubmitting(true);
    try { await signInWithEmailAndPassword(firebaseAuth, email, password); } catch { toast.error("تعذّر تسجيل الدخول. تحققي من البريد وكلمة المرور."); } finally { setIsSubmitting(false); }
  };
  return <main className="admin-login-page"><div className="admin-login-card"><div className="admin-lock-icon"><ShieldCheck /></div><p className="eyebrow"><span />مساحة الإدارة</p><h1>مرحباً بعودتك.</h1><p>سجّلي الدخول لإدارة محتوى الموقع وطلبات الحجز.</p><form onSubmit={handleLogin}><Field label="البريد الإلكتروني"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" placeholder="admin@example.com" /></Field><Field label="كلمة المرور"><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" placeholder="••••••••" /></Field><button className="button-primary justify-center" disabled={isSubmitting}>{isSubmitting ? "جارٍ التحقق..." : "تسجيل الدخول"}</button></form><Link href="/" className="admin-return-link"><ChevronLeft size={16} />العودة إلى الموقع</Link></div></main>;
}

function SetupScreen() {
  return <main className="admin-login-page"><div className="admin-setup-card"><div className="admin-lock-icon"><Settings2 /></div><p className="eyebrow"><span />خطوة إعداد واحدة</p><h1>اربطي مساحة الإدارة بـ Firebase.</h1><p>الواجهة ولوحة التحكم جاهزتان. أضيفي بيانات مشروع Firebase في متغيرات البيئة الموضحة في ملف <code>.env.example</code>، ثم أنشئي مستخدماً إدارياً عبر Firebase Authentication.</p><div className="setup-checklist"><span><b>1</b> أضيفي مفاتيح Firebase العامة.</span><span><b>2</b> فعّلي Email/Password في المصادقة.</span><span><b>3</b> طبّقي قواعد Firestore وStorage المرفقة.</span><span><b>4</b> ادخلي ثم اختاري «تهيئة المحتوى الابتدائي».</span></div><Link href="/" className="button-primary">العودة إلى الموقع <ChevronLeft size={17} /></Link></div></main>;
}

function ProfilePanel() {
  const { siteInfo, saveSiteInfo, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<SiteInfo>(siteInfo);
  useEffect(() => setDraft(siteInfo), [siteInfo]);
  const update = (key: keyof SiteInfo, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => { event.preventDefault(); try { await saveSiteInfo(draft); toast.success("تم حفظ بيانات الموقع."); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); } };
  return <form className="admin-panel" onSubmit={handleSave}><div className="admin-panel-heading"><div><p className="admin-kicker">الواجهة العامة</p><h2>بيانات الموقع الأساسية</h2><p>هذه البيانات تظهر فوراً في صفحات الموقع العامة.</p></div><button className="button-primary button-sm"><Save size={16} />حفظ التغييرات</button></div><div className="admin-form-grid"><Field label="الاسم"><input value={draft.name} onChange={(event) => update("name", event.target.value)} /></Field><Field label="المسمى المهني"><input value={draft.role} onChange={(event) => update("role", event.target.value)} /></Field><Field label="سطر البطل الصغير" className="full"><input value={draft.heroEyebrow} onChange={(event) => update("heroEyebrow", event.target.value)} /></Field><Field label="العنوان الرئيسي" className="full"><textarea rows={2} value={draft.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} /></Field><Field label="وصف البطل" className="full"><textarea rows={3} value={draft.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} /></Field><Field label="عنوان الترحيب" className="full"><input value={draft.welcomeTitle} onChange={(event) => update("welcomeTitle", event.target.value)} /></Field><Field label="نص الترحيب" className="full"><textarea rows={3} value={draft.welcomeText} onChange={(event) => update("welcomeText", event.target.value)} /></Field><Field label="عنوان قسم «عن كوثر»"><input value={draft.aboutTitle} onChange={(event) => update("aboutTitle", event.target.value)} /></Field><Field label="السيرة المهنية"><textarea rows={4} value={draft.aboutText} onChange={(event) => update("aboutText", event.target.value)} /></Field><Field label="عنوان فلسفة العمل"><input value={draft.philosophyTitle} onChange={(event) => update("philosophyTitle", event.target.value)} /></Field><Field label="نص فلسفة العمل"><textarea rows={4} value={draft.philosophyText} onChange={(event) => update("philosophyText", event.target.value)} /></Field><Field label="المؤهلات" className="full"><input value={draft.credentials} onChange={(event) => update("credentials", event.target.value)} /></Field><Field label="سنوات الخبرة" className="full"><input value={draft.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} /></Field><Field label="البريد الإلكتروني"><input type="email" dir="ltr" value={draft.email} onChange={(event) => update("email", event.target.value)} /></Field><Field label="الهاتف"><input dir="ltr" value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></Field><Field label="الموقع أو نمط الجلسات"><input value={draft.location} onChange={(event) => update("location", event.target.value)} /></Field><Field label="حالة الحجز"><input value={draft.availability} onChange={(event) => update("availability", event.target.value)} /></Field><ImageField label="صورة الواجهة الرئيسية" value={draft.heroImage} onChange={(url) => update("heroImage", url)} uploadImage={uploadImage} /><ImageField label="صورة «عن كوثر»" value={draft.aboutImage} onChange={(url) => update("aboutImage", url)} uploadImage={uploadImage} /></div></form>;
}

function ColorField({ label, note, value, onChange }: { label: string; note: string; value: string; onChange: (value: string) => void }) {
  return <label className="theme-color-field"><span><strong>{label}</strong><small>{note}</small></span><span className="theme-color-control"><input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code>{value.toUpperCase()}</code></span></label>;
}

function ThemePanel() {
  const { siteInfo, saveSiteInfo } = useSiteContent();
  const [draft, setDraft] = useState<SiteTheme>(siteInfo.theme);
  useEffect(() => setDraft(siteInfo.theme), [siteInfo.theme]);
  const update = (key: keyof SiteTheme, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => { event.preventDefault(); try { await saveSiteInfo({ ...siteInfo, theme: draft }); toast.success("تم حفظ الهوية البصرية وتطبيقها على الموقع."); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ الهوية البصرية."); } };
  return <form className="admin-panel" onSubmit={handleSave}><div className="admin-panel-heading"><div><p className="admin-kicker">الواجهة العامة</p><h2>الهوية البصرية</h2><p>اختاري الألوان الأساسية للموقع. تظهر المعاينة مباشرة، ولا تُنشر التغييرات للزوار إلا بعد الحفظ.</p></div><button className="button-primary button-sm"><Save size={16} />حفظ الهوية</button></div><div className="theme-settings-grid"><div className="theme-color-list"><ColorField label="اللون الأساسي" note="الأزرار والروابط والعناصر التفاعلية" value={draft.primary} onChange={(value) => update("primary", value)} /><ColorField label="اللون الأساسي الداكن" note="العناوين والأقسام ذات التأكيد" value={draft.primaryDeep} onChange={(value) => update("primaryDeep", value)} /><ColorField label="اللون المساند" note="التفاصيل وخطوط الإشارة" value={draft.accent} onChange={(value) => update("accent", value)} /><ColorField label="الخلفية العامة" note="مساحات الصفحة الهادئة" value={draft.background} onChange={(value) => update("background", value)} /><ColorField label="سطح البطاقات" note="البطاقات والنماذج ومناطق القراءة" value={draft.surface} onChange={(value) => update("surface", value)} /><ColorField label="اللون الناعم" note="الخلفيات الهادئة والأيقونات" value={draft.soft} onChange={(value) => update("soft", value)} /><ColorField label="لون النص" note="النصوص الأساسية ومحتوى القراءة" value={draft.ink} onChange={(value) => update("ink", value)} /><ColorField label="لون التذييل" note="تذييل الموقع وشريط لوحة الإدارة" value={draft.footer} onChange={(value) => update("footer", value)} /></div><aside className="theme-live-preview" style={{ background: draft.background, color: draft.ink }}><div className="theme-preview-bar" style={{ background: draft.footer }}><span>كوثر غربي</span><i style={{ background: draft.accent }} /></div><div className="theme-preview-body"><small style={{ color: draft.primary }}>معاينة مباشرة</small><h3 style={{ color: draft.primaryDeep }}>هوية هادئة، قابلة لأن تكون لكِ.</h3><p>تظهر الألوان الجديدة هنا قبل حفظها، ثم تنتقل إلى كامل الموقع.</p><button type="button" style={{ background: draft.primary, borderColor: draft.primary, color: draft.surface }}>زر الحجز</button><span className="theme-preview-chip" style={{ background: draft.soft, color: draft.primaryDeep }}>مساحة مريحة للحوار</span></div></aside></div></form>;
}

function ServiceEditor({ current, onCancel }: { current?: Service; onCancel: () => void }) {
  const { saveService, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Service, "id"> & { id?: string }>(current ?? { title: "", shortDescription: "", description: "", icon: "Sparkles", image: "", position: 1 });
  const update = (key: keyof typeof draft, value: string | number) => setDraft((item) => ({ ...item, [key]: value }));
  const handleSave = async (event: React.FormEvent) => { event.preventDefault(); try { await saveService(draft); toast.success("تم حفظ الخدمة."); onCancel(); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); } };
  return <form className="inline-editor" onSubmit={handleSave}><div className="inline-editor-heading"><h3>{current ? "تعديل الخدمة" : "إضافة خدمة"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div><div className="admin-form-grid"><Field label="العنوان"><input required value={draft.title} onChange={(event) => update("title", event.target.value)} /></Field><Field label="الأيقونة"><select value={draft.icon} onChange={(event) => update("icon", event.target.value)}><option value="Sparkles">لمعة هادئة</option><option value="HeartHandshake">تواصل</option><option value="Sprout">نمو</option><option value="MessageCircleHeart">حوار</option></select></Field><Field label="الوصف القصير" className="full"><input required value={draft.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} /></Field><Field label="التفاصيل" className="full"><textarea required rows={4} value={draft.description} onChange={(event) => update("description", event.target.value)} /></Field><Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => update("position", Number(event.target.value))} /></Field><ImageField label="صورة اختيارية" value={draft.image ?? ""} onChange={(url) => update("image", url)} uploadImage={uploadImage} /></div><button className="button-primary button-sm"><Save size={16} />حفظ الخدمة</button></form>;
}

function ServicesPanel() {
  const { services, deleteService } = useSiteContent();
  const [editing, setEditing] = useState<Service | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => { if (!window.confirm("هل تريدين حذف هذه الخدمة؟")) return; try { await deleteService(id); toast.success("تم حذف الخدمة."); } catch { toast.error("تعذر حذف الخدمة."); } };
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">المحتوى</p><h2>الخدمات</h2><p>أضيفي الخدمات أو عدّليها، وسيظهر الترتيب نفسه في الواجهة.</p></div><button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة خدمة</button></div>{(adding || editing) && <ServiceEditor current={editing} onCancel={() => { setAdding(false); setEditing(undefined); }} />}<div className="content-list">{services.map((service) => <article className="content-row" key={service.id}><span className="content-order">{service.position}</span><div><h3>{service.title}</h3><p>{service.shortDescription}</p></div><div className="content-actions"><button onClick={() => { setEditing(service); setAdding(false); }} aria-label="تعديل الخدمة"><PenLine size={17} /></button><button onClick={() => remove(service.id)} aria-label="حذف الخدمة"><Trash2 size={17} /></button></div></article>)}</div></section>;
}

function ArticleEditor({ current, onCancel }: { current?: Article; onCancel: () => void }) {
  const { saveArticle, siteInfo, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Article, "id"> & { id?: string }>(current ?? { title: "", excerpt: "", content: "", coverImage: siteInfo.articleImage, category: "", publishedAt: new Date().toISOString().slice(0, 10), position: 1 });
  const update = (key: keyof typeof draft, value: string | number) => setDraft((item) => ({ ...item, [key]: value }));
  const handleSave = async (event: React.FormEvent) => { event.preventDefault(); try { await saveArticle(draft); toast.success("تم حفظ المقال."); onCancel(); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); } };
  return <form className="inline-editor" onSubmit={handleSave}><div className="inline-editor-heading"><h3>{current ? "تعديل المقال" : "مقال جديد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div><div className="admin-form-grid"><Field label="العنوان" className="full"><input required value={draft.title} onChange={(event) => update("title", event.target.value)} /></Field><Field label="الفئة"><input required value={draft.category} onChange={(event) => update("category", event.target.value)} /></Field><Field label="تاريخ النشر"><input required type="date" dir="ltr" value={draft.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} /></Field><Field label="مقدمة المقال" className="full"><textarea required rows={3} value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} /></Field><Field label="المحتوى" className="full"><textarea required rows={12} value={draft.content} onChange={(event) => update("content", event.target.value)} placeholder="استخدمي ## لعنوان فرعي، واتركي سطراً فارغاً بين الفقرات." /></Field><Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => update("position", Number(event.target.value))} /></Field><ImageField label="صورة الغلاف" value={draft.coverImage} onChange={(url) => update("coverImage", url)} uploadImage={uploadImage} /></div><button className="button-primary button-sm"><Save size={16} />حفظ المقال</button></form>;
}

function ArticlesPanel() {
  const { articles, deleteArticle } = useSiteContent();
  const [editing, setEditing] = useState<Article | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => { if (!window.confirm("هل تريدين حذف هذا المقال؟")) return; try { await deleteArticle(id); toast.success("تم حذف المقال."); } catch { toast.error("تعذر حذف المقال."); } };
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">المحتوى</p><h2>المقالات</h2><p>انشري قراءة جديدة أو عدّلي المقالات المنشورة.</p></div><button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />مقال جديد</button></div>{(adding || editing) && <ArticleEditor current={editing} onCancel={() => { setAdding(false); setEditing(undefined); }} />}<div className="content-list">{articles.map((article) => <article className="content-row" key={article.id}><img src={article.coverImage} alt="" className="content-thumb" /><div><p className="content-meta">{article.category} · {article.publishedAt}</p><h3>{article.title}</h3><p>{article.excerpt}</p></div><div className="content-actions"><button onClick={() => { setEditing(article); setAdding(false); }} aria-label="تعديل المقال"><PenLine size={17} /></button><button onClick={() => remove(article.id)} aria-label="حذف المقال"><Trash2 size={17} /></button></div></article>)}</div></section>;
}

function TestimonialEditor({ current, onCancel }: { current?: Testimonial; onCancel: () => void }) {
  const { saveTestimonial } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Testimonial, "id"> & { id?: string }>(current ?? { name: "", text: "", rating: 5, position: 1 });
  const handleSave = async (event: React.FormEvent) => { event.preventDefault(); try { await saveTestimonial(draft); toast.success("تم حفظ الرأي."); onCancel(); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); } };
  return <form className="inline-editor" onSubmit={handleSave}><div className="inline-editor-heading"><h3>{current ? "تعديل الرأي" : "إضافة رأي معتمد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div><div className="admin-form-grid"><Field label="الاسم أو الوصف المعتمد"><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field><Field label="نص الرأي" className="full"><textarea required rows={4} value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} /></Field></div><button className="button-primary button-sm"><Save size={16} />حفظ الرأي</button></form>;
}

function TestimonialsPanel() {
  const { testimonials, deleteTestimonial } = useSiteContent();
  const [editing, setEditing] = useState<Testimonial | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => { if (!window.confirm("هل تريدين حذف هذا الرأي؟")) return; try { await deleteTestimonial(id); toast.success("تم حذف الرأي."); } catch { toast.error("تعذر حذف الرأي."); } };
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">محتوى اختياري</p><h2>آراء العملاء</h2><p>لن يظهر هذا القسم للعامة ما لم تضيفي رأياً. أضيفي فقط نصوصاً موثقة وموافقاً على استخدامها.</p></div><button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة رأي معتمد</button></div>{(adding || editing) && <TestimonialEditor current={editing} onCancel={() => { setAdding(false); setEditing(undefined); }} />}<div className="content-list">{testimonials.length === 0 ? <div className="admin-empty"><MessageSquareQuote size={25} /><p>لا توجد آراء منشورة حالياً، ولذلك لن يظهر قسم آراء العملاء في الموقع.</p></div> : testimonials.map((item) => <article className="content-row" key={item.id}><span className="content-order">{item.position}</span><div><h3>{item.name}</h3><p>{item.text}</p></div><div className="content-actions"><button onClick={() => { setEditing(item); setAdding(false); }} aria-label="تعديل الرأي"><PenLine size={17} /></button><button onClick={() => remove(item.id)} aria-label="حذف الرأي"><Trash2 size={17} /></button></div></article>)}</div></section>;
}

function BookingsPanel() {
  const { bookings } = useSiteContent();
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">المتابعة</p><h2>طلبات الحجز</h2><p>تصل الطلبات هنا فور إرسال النموذج.</p></div></div><div className="booking-list">{bookings.length === 0 ? <div className="admin-empty"><MailCheck size={25} /><p>لا توجد طلبات جديدة حالياً.</p></div> : bookings.map((booking) => <article key={booking.id} className="booking-row"><div><p className="content-meta">{new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.createdAt))}</p><h3>{booking.name}</h3><p>{booking.preferredService} · {booking.preferredTime}</p></div><div className="booking-contact"><a href={`mailto:${booking.email}`}>{booking.email}</a><a href={`tel:${booking.phone}`}>{booking.phone}</a></div><p className="booking-message">{booking.message}</p></article>)}</div></section>;
}

function OverviewPanel({ onTab }: { onTab: (tab: Tab) => void }) {
  const { articles, bookings, seedContent, services, testimonials } = useSiteContent();
  const [isSeeding, setIsSeeding] = useState(false);
  const cards = [{ label: "الخدمات", value: services.length, icon: Sparkles, tab: "services" as Tab }, { label: "المقالات", value: articles.length, icon: BookOpenText, tab: "articles" as Tab }, { label: "الطلبات", value: bookings.length, icon: MailCheck, tab: "bookings" as Tab }, { label: "آراء معتمدة", value: testimonials.length, icon: UsersRound, tab: "testimonials" as Tab }];
  const seed = async () => { setIsSeeding(true); try { await seedContent(); toast.success("تمت تهيئة بيانات البداية بنجاح."); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذرت التهيئة."); } finally { setIsSeeding(false); } };
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">نظرة عامة</p><h2>مرحباً بك في مساحة الإدارة.</h2><p>راقبي المحتوى والطلبات، ثم انتقلي مباشرة إلى القسم الذي تريدين تحديثه.</p></div><Link className="button-quiet button-sm" href="/">معاينة الموقع <ChevronLeft size={16} /></Link></div><div className="admin-stat-grid">{cards.map(({ icon: Icon, label, tab, value }) => <button key={label} className="admin-stat" onClick={() => onTab(tab)}><span><Icon size={19} /></span><strong>{value}</strong><small>{label}</small></button>)}</div><div className="admin-seed"><div><h3>تهيئة المحتوى الابتدائي</h3><p>يضيف النصوص والخدمات والمقالات الأولية القابلة للتحرير. لا يضيف أي آراء عملاء.</p></div><button className="button-primary button-sm" onClick={seed} disabled={isSeeding}>{isSeeding ? "جارٍ التهيئة..." : "تهيئة المحتوى"}</button></div></section>;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  useEffect(() => { if (!firebaseAuth) { setLoadingAuth(false); return; } return onAuthStateChanged(firebaseAuth, (nextUser) => { setUser(nextUser); setLoadingAuth(false); }); }, []);
  const activeLabel = useMemo(() => tabs.find((item) => item.id === activeTab)?.label, [activeTab]);
  if (!isFirebaseConfigured) return <SetupScreen />;
  if (loadingAuth) return <main className="admin-loading"><div className="loading-leaf" /><p>جارٍ فتح مساحة الإدارة...</p></main>;
  if (!user) return <LoginScreen />;
  return <main className="admin-page"><aside className="admin-sidebar"><Link href="/" className="admin-sidebar-brand"><span className="admin-brand-symbol">ك</span><span><strong>كوثر غربي</strong><small>إدارة الموقع</small></span></Link><nav>{tabs.map(({ icon: Icon, id, label }) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}><Icon size={18} />{label}</button>)}</nav><div className="admin-sidebar-bottom"><p>{user.email}</p><button onClick={() => firebaseAuth && signOut(firebaseAuth)}><LogOut size={17} />تسجيل الخروج</button></div></aside><div className="admin-workspace"><header className="admin-topbar"><div><p>لوحة التحكم</p><h1>{activeLabel}</h1></div><Link href="/" className="admin-view-link">عرض الموقع <ChevronLeft size={17} /></Link></header><div className="admin-content">{activeTab === "overview" && <OverviewPanel onTab={setActiveTab} />}{activeTab === "profile" && <ProfilePanel />}{activeTab === "theme" && <ThemePanel />}{activeTab === "services" && <ServicesPanel />}{activeTab === "articles" && <ArticlesPanel />}{activeTab === "testimonials" && <TestimonialsPanel />}{activeTab === "bookings" && <BookingsPanel />}</div></div></main>;
}
