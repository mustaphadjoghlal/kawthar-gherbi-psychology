/**
 * Design system: «ملاذ هادئ» — إدارة عملية، هادئة، واضحة الهرمية ومغايرة لواجهة الزائر العامة.
 * كل نص وصورة ولون في الواجهة العامة له هنا حقل يقابله.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import {
  BookOpenText,
  ChevronLeft,
  ClipboardList,
  Compass,
  FileQuestion,
  Home as HomeIcon,
  LayoutDashboard,
  ListTree,
  LogOut,
  MailCheck,
  MessageSquareQuote,
  Palette,
  PanelBottom,
  PenLine,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { IMAGE_POSITIONS } from "@/lib/default-content";
import {
  ColorField,
  Field,
  FontField,
  IconField,
  ImageField,
  RangeField,
  RichTextEditor,
  SectionFields,
  SelectField,
  TextArea,
  TextField,
  VisibilityToggle,
} from "@/components/admin/AdminControls";
import type {
  Article,
  NavLink,
  Principle,
  SectionCopy,
  Service,
  SiteCopy,
  SiteInfo,
  SiteTheme,
  Testimonial,
} from "@/types/site";

type Tab =
  | "overview"
  | "theme"
  | "profile"
  | "navigation"
  | "home"
  | "pages"
  | "services"
  | "articles"
  | "principles"
  | "testimonials"
  | "footer"
  | "bookings";

const tabGroups: Array<{ group: string; items: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> }> = [
  {
    group: "البداية",
    items: [
      { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
      { id: "theme", label: "الهوية البصرية", icon: Palette },
      { id: "profile", label: "بيانات الموقع", icon: Settings2 },
    ],
  },
  {
    group: "هيكل الموقع",
    items: [
      { id: "navigation", label: "التنقل والترويسة", icon: Compass },
      { id: "home", label: "الصفحة الرئيسية", icon: HomeIcon },
      { id: "pages", label: "نصوص الصفحات", icon: FileQuestion },
      { id: "footer", label: "التذييل", icon: PanelBottom },
    ],
  },
  {
    group: "المحتوى",
    items: [
      { id: "services", label: "الخدمات", icon: Sparkles },
      { id: "articles", label: "المقالات", icon: BookOpenText },
      { id: "principles", label: "مبادئ العمل", icon: ListTree },
      { id: "testimonials", label: "آراء العملاء", icon: MessageSquareQuote },
      { id: "bookings", label: "طلبات الحجز", icon: ClipboardList },
    ],
  },
];

const allTabs = tabGroups.flatMap((group) => group.items);

/** مسودة محلية لشريحة من نصوص الصفحات، تُحفظ دفعة واحدة. */
function useCopyDraft<K extends keyof SiteCopy>(key: K) {
  const { copy, saveCopy } = useSiteContent();
  const [draft, setDraft] = useState<SiteCopy[K]>(copy[key]);
  useEffect(() => setDraft(copy[key]), [copy, key]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await saveCopy({ ...copy, [key]: draft });
      toast.success("تم حفظ النصوص وتطبيقها على الموقع.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر الحفظ.");
    }
  };
  const update = <F extends keyof SiteCopy[K]>(field: F, value: SiteCopy[K][F]) =>
    setDraft((current) => ({ ...current, [field]: value }));
  return { draft, setDraft, save, update };
}

function PanelHeading({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="admin-panel-heading">
      <div><p className="admin-kicker">{kicker}</p><h2>{title}</h2><p>{description}</p></div>
      {action}
    </div>
  );
}

function SaveButton({ label = "حفظ التغييرات" }: { label?: string }) {
  return <button className="button-primary button-sm" type="submit"><Save size={16} />{label}</button>;
}

function SectionBlock({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-block">
      <div className="admin-block-heading"><h3>{title}</h3>{description && <p>{description}</p>}</div>
      {children}
    </section>
  );
}

/** أزرار ترتيب عنصر داخل قائمة. */
function OrderControls({ onUp, onDown, disableUp, disableDown }: { onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean }) {
  return (
    <div className="order-controls">
      <button type="button" onClick={onUp} disabled={disableUp} aria-label="تحريك لأعلى">↑</button>
      <button type="button" onClick={onDown} disabled={disableDown} aria-label="تحريك لأسفل">↓</button>
    </div>
  );
}

/** يبدّل ترتيب عنصرين ويحفظ الاثنين. */
async function swapPositions<T extends { id: string; position: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
  save: (item: Omit<T, "id"> & { id?: string }) => Promise<void>,
) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  const current = items[index];
  const neighbour = items[target];
  await Promise.all([
    save({ ...current, position: neighbour.position }),
    save({ ...neighbour, position: current.position }),
  ]);
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
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-lock-icon"><ShieldCheck /></div>
        <p className="eyebrow"><span />مساحة الإدارة</p>
        <h1>مرحباً بعودتك.</h1>
        <p>سجّلي الدخول لإدارة محتوى الموقع وطلبات الحجز.</p>
        <form onSubmit={handleLogin}>
          <Field label="البريد الإلكتروني"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" placeholder="admin@example.com" /></Field>
          <Field label="كلمة المرور"><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr" placeholder="••••••••" /></Field>
          <button className="button-primary justify-center" disabled={isSubmitting}>{isSubmitting ? "جارٍ التحقق..." : "تسجيل الدخول"}</button>
        </form>
        <Link href="/" className="admin-return-link"><ChevronLeft size={16} />العودة إلى الموقع</Link>
      </div>
    </main>
  );
}

function SetupScreen() {
  return (
    <main className="admin-login-page">
      <div className="admin-setup-card">
        <div className="admin-lock-icon"><Settings2 /></div>
        <p className="eyebrow"><span />خطوة إعداد واحدة</p>
        <h1>اربطي مساحة الإدارة بـ Firebase.</h1>
        <p>الواجهة ولوحة التحكم جاهزتان. أضيفي بيانات مشروع Firebase في متغيرات البيئة الموضحة في ملف <code>.env.example</code>، ثم أنشئي مستخدماً إدارياً عبر Firebase Authentication.</p>
        <div className="setup-checklist">
          <span><b>1</b> أضيفي مفاتيح Firebase العامة.</span>
          <span><b>2</b> فعّلي Email/Password في المصادقة.</span>
          <span><b>3</b> طبّقي قواعد Firestore وStorage المرفقة.</span>
          <span><b>4</b> ادخلي ثم اختاري «تهيئة المحتوى الابتدائي».</span>
        </div>
        <Link href="/" className="button-primary">العودة إلى الموقع <ChevronLeft size={17} /></Link>
      </div>
    </main>
  );
}

function ThemePanel() {
  const { siteInfo, saveSiteInfo } = useSiteContent();
  const [draft, setDraft] = useState<SiteTheme>(siteInfo.theme);
  useEffect(() => setDraft(siteInfo.theme), [siteInfo.theme]);
  const update = (key: keyof SiteTheme, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveSiteInfo({ ...siteInfo, theme: draft }); toast.success("تم حفظ الهوية البصرية وتطبيقها على الموقع."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ الهوية البصرية."); }
  };
  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <PanelHeading
        kicker="الواجهة العامة"
        title="الهوية البصرية"
        description="اختاري الألوان والخطوط وشكل الحواف. تظهر المعاينة مباشرة، ولا تُنشر التغييرات للزوار إلا بعد الحفظ."
        action={<SaveButton label="حفظ الهوية" />}
      />
      <div className="theme-settings-grid">
        <div className="theme-color-list">
          <ColorField label="اللون الأساسي" note="الأزرار والروابط والعناصر التفاعلية" value={draft.primary} onChange={(value) => update("primary", value)} />
          <ColorField label="اللون الأساسي الداكن" note="العناوين والأقسام ذات التأكيد" value={draft.primaryDeep} onChange={(value) => update("primaryDeep", value)} />
          <ColorField label="اللون المساند" note="التفاصيل وخطوط الإشارة" value={draft.accent} onChange={(value) => update("accent", value)} />
          <ColorField label="الخلفية العامة" note="مساحات الصفحة الهادئة" value={draft.background} onChange={(value) => update("background", value)} />
          <ColorField label="سطح البطاقات" note="البطاقات والنماذج ومناطق القراءة" value={draft.surface} onChange={(value) => update("surface", value)} />
          <ColorField label="اللون الناعم" note="الخلفيات الهادئة والأيقونات" value={draft.soft} onChange={(value) => update("soft", value)} />
          <ColorField label="لون النص" note="النصوص الأساسية ومحتوى القراءة" value={draft.ink} onChange={(value) => update("ink", value)} />
          <ColorField label="لون التذييل" note="تذييل الموقع وشريط لوحة الإدارة" value={draft.footer} onChange={(value) => update("footer", value)} />
          <div className="admin-form-grid">
            <FontField label="خط العناوين" value={draft.displayFont} onChange={(value) => update("displayFont", value)} hint="يُحمّل تلقائياً من Google Fonts" />
            <FontField label="خط النصوص" value={draft.bodyFont} onChange={(value) => update("bodyFont", value)} />
          </div>
          <RangeField label="استدارة الحواف" hint="0 حواف حادة، 1.5 حواف دائرية" value={draft.radius} onChange={(value) => update("radius", value)} min={0} max={1.5} step={0.05} unit="rem" />
          <RangeField label="حجم النص الأساسي" hint="يؤثر على قراءة الموقع كاملاً" value={draft.baseFontSize} onChange={(value) => update("baseFontSize", value)} min={14} max={20} step={1} unit="px" />
        </div>
        <aside
          className="theme-live-preview"
          style={{ background: draft.background, color: draft.ink, fontFamily: `"${draft.bodyFont}", sans-serif`, fontSize: `${draft.baseFontSize}px` }}
        >
          <div className="theme-preview-bar" style={{ background: draft.footer }}><span>{siteInfo.name}</span><i style={{ background: draft.accent }} /></div>
          <div className="theme-preview-body">
            <small style={{ color: draft.primary }}>معاينة مباشرة</small>
            <h3 style={{ color: draft.primaryDeep, fontFamily: `"${draft.displayFont}", serif` }}>هوية هادئة، قابلة لأن تكون لكِ.</h3>
            <p>تظهر الألوان والخطوط الجديدة هنا قبل حفظها، ثم تنتقل إلى كامل الموقع.</p>
            <button type="button" style={{ background: draft.primary, borderColor: draft.primary, color: draft.surface, borderRadius: `${draft.radius}rem` }}>زر الحجز</button>
            <span className="theme-preview-chip" style={{ background: draft.soft, color: draft.primaryDeep, borderRadius: `${draft.radius}rem` }}>مساحة مريحة للحوار</span>
          </div>
        </aside>
      </div>
    </form>
  );
}

function ProfilePanel() {
  const { siteInfo, saveSiteInfo, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<SiteInfo>(siteInfo);
  useEffect(() => setDraft(siteInfo), [siteInfo]);
  const update = (key: keyof SiteInfo, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveSiteInfo(draft); toast.success("تم حفظ بيانات الموقع."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="admin-panel" onSubmit={handleSave}>
      <PanelHeading kicker="الواجهة العامة" title="بيانات الموقع الأساسية" description="هذه البيانات تظهر فوراً في صفحات الموقع العامة." action={<SaveButton />} />

      <SectionBlock title="الهوية والتعريف">
        <div className="admin-form-grid">
          <TextField label="الاسم" value={draft.name} onChange={(value) => update("name", value)} />
          <TextField label="المسمى المهني" value={draft.role} onChange={(value) => update("role", value)} />
          <ImageField label="شعار الموقع" value={draft.logo} onChange={(url) => update("logo", url)} uploadImage={uploadImage} />
        </div>
      </SectionBlock>

      <SectionBlock title="واجهة البداية" description="النصوص التي يراها الزائر أول ما يفتح الموقع.">
        <div className="admin-form-grid">
          <TextField label="سطر البطل الصغير" className="full" value={draft.heroEyebrow} onChange={(value) => update("heroEyebrow", value)} />
          <TextArea label="العنوان الرئيسي" rows={2} value={draft.heroTitle} onChange={(value) => update("heroTitle", value)} />
          <TextArea label="وصف البطل" value={draft.heroDescription} onChange={(value) => update("heroDescription", value)} />
          <TextField label="عنوان الترحيب" className="full" value={draft.welcomeTitle} onChange={(value) => update("welcomeTitle", value)} />
          <TextArea label="نص الترحيب" value={draft.welcomeText} onChange={(value) => update("welcomeText", value)} />
        </div>
      </SectionBlock>

      <SectionBlock title="السيرة وفلسفة العمل">
        <div className="admin-form-grid">
          <TextField label="عنوان قسم «عن كوثر»" value={draft.aboutTitle} onChange={(value) => update("aboutTitle", value)} />
          <TextField label="المؤهلات" value={draft.credentials} onChange={(value) => update("credentials", value)} />
          <TextArea label="السيرة المهنية" rows={4} value={draft.aboutText} onChange={(value) => update("aboutText", value)} />
          <TextField label="عنوان فلسفة العمل" value={draft.philosophyTitle} onChange={(value) => update("philosophyTitle", value)} />
          <TextField label="سنوات الخبرة" value={draft.yearsExperience} onChange={(value) => update("yearsExperience", value)} />
          <TextArea label="نص فلسفة العمل" rows={4} value={draft.philosophyText} onChange={(value) => update("philosophyText", value)} />
        </div>
      </SectionBlock>

      <SectionBlock title="وسائل التواصل">
        <div className="admin-form-grid">
          <TextField label="البريد الإلكتروني" type="email" dir="ltr" value={draft.email} onChange={(value) => update("email", value)} />
          <TextField label="الهاتف" dir="ltr" value={draft.phone} onChange={(value) => update("phone", value)} />
          <TextField label="رقم واتساب" dir="ltr" hint="بالصيغة الدولية، مثل ‎+21612345678" value={draft.whatsapp} onChange={(value) => update("whatsapp", value)} />
          <TextField label="الموقع أو نمط الجلسات" value={draft.location} onChange={(value) => update("location", value)} />
          <TextField label="حالة الحجز" value={draft.availability} onChange={(value) => update("availability", value)} />
        </div>
      </SectionBlock>

      <SectionBlock title="الصور" description="ارفعي صورة أو الصقي رابطها. عند استخدام صورة شخص، اضبطي «بؤرة القصّ» كي يبقى الوجه ظاهراً داخل الإطار.">
        <div className="admin-form-grid">
          <ImageField label="صورة الواجهة الرئيسية" value={draft.heroImage} onChange={(url) => update("heroImage", url)} uploadImage={uploadImage} />
          <SelectField label="بؤرة قصّ صورة الواجهة" value={draft.heroImagePosition} onChange={(value) => update("heroImagePosition", value)} options={IMAGE_POSITIONS as ReadonlyArray<{ value: string; label: string }>} />
          <RangeField label="تعتيم صورة الواجهة" hint="0 بلا تعتيم. خفّضيه عند استخدام صورة شخصية." value={draft.heroImageOverlay} onChange={(value) => update("heroImageOverlay", value)} min={0} max={45} step={1} unit="%" />
          <ImageField label="صورة «عن كوثر»" value={draft.aboutImage} onChange={(url) => update("aboutImage", url)} uploadImage={uploadImage} />
          <SelectField label="بؤرة قصّ صورة «عن كوثر»" value={draft.aboutImagePosition} onChange={(value) => update("aboutImagePosition", value)} options={IMAGE_POSITIONS as ReadonlyArray<{ value: string; label: string }>} />
          <ImageField label="صورة المقالات الافتراضية" value={draft.articleImage} onChange={(url) => update("articleImage", url)} uploadImage={uploadImage} />
        </div>
      </SectionBlock>

      <SectionBlock title="بيانات محركات البحث" description="عنوان التبويب ووصف الموقع في نتائج البحث والمشاركة.">
        <div className="admin-form-grid">
          <TextField label="عنوان الصفحة" className="full" value={draft.metaTitle} onChange={(value) => update("metaTitle", value)} />
          <TextArea label="وصف الموقع" value={draft.metaDescription} onChange={(value) => update("metaDescription", value)} />
        </div>
      </SectionBlock>
    </form>
  );
}

function NavigationPanel() {
  const { copy, navLinks, saveNavLink, deleteNavLink } = useSiteContent();
  const { draft, save, update } = useCopyDraft("header");
  const [editing, setEditing] = useState<NavLink | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذا الرابط من القائمة؟")) return;
    try { await deleteNavLink(id); toast.success("تم حذف الرابط."); } catch { toast.error("تعذر حذف الرابط."); }
  };
  const move = async (index: number, direction: -1 | 1) => {
    try { await swapPositions(navLinks, index, direction, saveNavLink); } catch { toast.error("تعذر تغيير الترتيب."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="هيكل الموقع"
        title="التنقل والترويسة"
        description="تحكّمي في روابط القائمة وترتيبها وظهورها، وفي زر الحجز أعلى الصفحة."
        action={<button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة رابط</button>}
      />
      {(adding || editing) && (
        <NavLinkEditor current={editing} nextPosition={navLinks.length + 1} onCancel={() => { setAdding(false); setEditing(undefined); }} />
      )}
      <div className="content-list">
        {navLinks.map((link, index) => (
          <article className="content-row" key={link.id}>
            <OrderControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0} disableDown={index === navLinks.length - 1} />
            <div>
              <h3>{link.label}{link.visible === false && <span className="hidden-flag">مخفي</span>}</h3>
              <p dir="ltr">{link.href}</p>
            </div>
            <div className="content-actions">
              <button onClick={() => { setEditing(link); setAdding(false); }} aria-label="تعديل الرابط"><PenLine size={17} /></button>
              <button onClick={() => remove(link.id)} aria-label="حذف الرابط"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
      <form className="admin-block" onSubmit={save}>
        <div className="admin-block-heading"><h3>زر الحجز في الترويسة</h3><p>يظهر في أعلى الموقع وفي قائمة الهاتف.</p></div>
        <div className="admin-form-grid">
          <TextField label="نص الزر" value={draft.ctaLabel} onChange={(value) => update("ctaLabel", value)} />
          <TextField label="وجهة الزر" dir="ltr" value={draft.ctaHref} onChange={(value) => update("ctaHref", value)} />
        </div>
        <VisibilityToggle value={draft.showCta} onChange={(value) => update("showCta", value)} label="إظهار زر الحجز في الترويسة" />
        <SaveButton label="حفظ إعدادات الترويسة" />
      </form>
      <p className="admin-footnote">القائمة الحالية تُستخدم أيضاً في روابط التذييل. عدد الروابط المعروضة: {navLinks.filter((link) => link.visible !== false).length} من {navLinks.length}. {copy.header.showCta ? "" : "زر الحجز مخفي حالياً."}</p>
    </section>
  );
}

function NavLinkEditor({ current, nextPosition, onCancel }: { current?: NavLink; nextPosition: number; onCancel: () => void }) {
  const { saveNavLink } = useSiteContent();
  const [draft, setDraft] = useState<Omit<NavLink, "id"> & { id?: string }>(
    current ?? { label: "", href: "/", visible: true, position: nextPosition },
  );
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveNavLink(draft); toast.success("تم حفظ الرابط."); onCancel(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="inline-editor" onSubmit={handleSave}>
      <div className="inline-editor-heading"><h3>{current ? "تعديل الرابط" : "رابط جديد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div>
      <div className="admin-form-grid">
        <TextField label="نص الرابط" value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} />
        <TextField label="الوجهة" dir="ltr" value={draft.href} onChange={(value) => setDraft({ ...draft, href: value })} hint="مسار داخلي مثل /services" />
        <Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field>
      </div>
      <VisibilityToggle value={draft.visible} onChange={(value) => setDraft({ ...draft, visible: value })} label="إظهار هذا الرابط" />
      <SaveButton label="حفظ الرابط" />
    </form>
  );
}

/** صور الواجهة تُحفظ في بيانات الموقع، لكنها تُحرَّر هنا حيث يبحث عنها المستخدم. */
function HeroVisualsForm() {
  const { siteInfo, saveSiteInfo, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<SiteInfo>(siteInfo);
  useEffect(() => setDraft(siteInfo), [siteInfo]);
  const update = (key: keyof SiteInfo, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveSiteInfo(draft); toast.success("تم حفظ صور الواجهة."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="admin-block" onSubmit={handleSave}>
      <div className="admin-block-heading">
        <h3>صور الواجهة</h3>
        <p>استبدلي الشكل الافتراضي بصورة حقيقية. عند استخدام صورة شخص، اضبطي بؤرة القصّ على «الأعلى» كي يبقى الوجه ظاهراً داخل القوس.</p>
      </div>
      <div className="admin-form-grid">
        <ImageField label="صورة الواجهة الرئيسية" value={draft.heroImage} onChange={(url) => update("heroImage", url)} uploadImage={uploadImage} />
        <SelectField label="بؤرة القصّ" value={draft.heroImagePosition} onChange={(value) => update("heroImagePosition", value)} options={IMAGE_POSITIONS as ReadonlyArray<{ value: string; label: string }>} />
        <RangeField label="تعتيم الصورة" hint="0 بلا تعتيم. خفّضيه مع الصور الشخصية." value={draft.heroImageOverlay} onChange={(value) => update("heroImageOverlay", value)} min={0} max={45} step={1} unit="%" />
        <ImageField label="صورة الشريط التعريفي" value={draft.aboutImage} onChange={(url) => update("aboutImage", url)} uploadImage={uploadImage} />
        <SelectField label="بؤرة قصّ الشريط التعريفي" value={draft.aboutImagePosition} onChange={(value) => update("aboutImagePosition", value)} options={IMAGE_POSITIONS as ReadonlyArray<{ value: string; label: string }>} />
      </div>
      <SaveButton label="حفظ الصور" />
    </form>
  );
}

function HomePanel() {
  const { draft, save, update } = useCopyDraft("home");
  const setSection = (key: "welcome" | "services" | "about" | "articles" | "testimonials" | "cta") =>
    (value: SectionCopy) => update(key, value);
  const updateNote = (index: number, value: string) => {
    const notes = [...draft.heroNotes];
    notes[index] = value;
    update("heroNotes", notes);
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="هيكل الموقع"
        title="الصفحة الرئيسية"
        description="صور الواجهة ونصوص كل مقطع، ولكل منها زر حفظ خاص."
      />
      <HeroVisualsForm />
      <form onSubmit={save}>
      <SectionBlock title="نصوص واجهة البداية" description="النصوص المحيطة بالعنوان الرئيسي. عناوين البطل نفسها في «بيانات الموقع».">
        <div className="admin-form-grid">
          <TextField label="نص الزر الأساسي" value={draft.heroPrimaryCta} onChange={(value) => update("heroPrimaryCta", value)} hint="اتركيه فارغاً لإخفاء الزر" />
          <TextField label="وجهة الزر الأساسي" dir="ltr" value={draft.heroPrimaryHref} onChange={(value) => update("heroPrimaryHref", value)} />
          <TextField label="نص الرابط الثانوي" value={draft.heroSecondaryCta} onChange={(value) => update("heroSecondaryCta", value)} />
          <TextField label="وجهة الرابط الثانوي" dir="ltr" value={draft.heroSecondaryHref} onChange={(value) => update("heroSecondaryHref", value)} />
          <TextField label="ملاحظة أولى" value={draft.heroNotes[0] ?? ""} onChange={(value) => updateNote(0, value)} />
          <TextField label="ملاحظة ثانية" value={draft.heroNotes[1] ?? ""} onChange={(value) => updateNote(1, value)} />
          <TextArea label="نص البطاقة فوق الصورة" rows={2} value={draft.heroCardText} onChange={(value) => update("heroCardText", value)} />
        </div>
      </SectionBlock>

      <SectionBlock title="مقطع الترحيب" description="اتركي العنوان أو الوصف فارغاً ليُستخدم نص الترحيب من «بيانات الموقع».">
        <SectionFields value={draft.welcome} onChange={setSection("welcome")} options={{ hideCta: true, titleHint: "فارغ = عنوان الترحيب العام" }} />
      </SectionBlock>

      <SectionBlock title="مقطع الخدمات">
        <SectionFields value={draft.services} onChange={setSection("services")} options={{ hideDescription: true }} />
      </SectionBlock>

      <SectionBlock title="الشريط التعريفي" description="المقطع الداكن الذي يحمل صورة «عن كوثر» وفلسفة العمل.">
        <SectionFields value={draft.about} onChange={setSection("about")} options={{ titleHint: "فارغ = عنوان فلسفة العمل", descriptionHint: "فارغ = نص فلسفة العمل" }} />
      </SectionBlock>

      <SectionBlock title="مقطع المقالات">
        <SectionFields value={draft.articles} onChange={setSection("articles")} options={{ hideDescription: true }} />
      </SectionBlock>

      <SectionBlock title="مقطع آراء العملاء" description="لا يظهر أصلاً ما لم تضيفي رأياً واحداً على الأقل.">
        <SectionFields value={draft.testimonials} onChange={setSection("testimonials")} options={{ hideCta: true, hideDescription: true }} />
      </SectionBlock>

      <SectionBlock title="دعوة التواصل الختامية">
        <SectionFields value={draft.cta} onChange={setSection("cta")} options={{ hideDescription: true }} />
        <div className="admin-form-grid">
          <TextArea label="نص الدعوة" value={draft.ctaText} onChange={(value) => update("ctaText", value)} />
        </div>
      </SectionBlock>
      <SaveButton label="حفظ نصوص الصفحة الرئيسية" />
      </form>
    </section>
  );
}

function AboutCopyPanel() {
  const { draft, save, update } = useCopyDraft("about");
  return (
    <form className="admin-block" onSubmit={save}>
      <div className="admin-block-heading"><h3>صفحة «من أنا»</h3><p>النصوص المحيطة بالسيرة والمبادئ.</p></div>
      <SectionFields value={draft.lead} onChange={(value) => update("lead", value)} options={{ hideCta: true, hideVisibility: true, descriptionHint: "فارغ = السيرة المهنية العامة" }} />
      <div className="admin-form-grid">
        <TextArea label="نص الختم الجانبي" rows={2} value={draft.sealText} onChange={(value) => update("sealText", value)} hint="اتركيه فارغاً لإخفاء الختم" />
        <TextField label="سطر فوق عنوان المسار المهني" value={draft.storyEyebrow} onChange={(value) => update("storyEyebrow", value)} />
        <TextField label="تعليق أسفل الصورة" value={draft.imageCaption} onChange={(value) => update("imageCaption", value)} />
        <TextArea label="فقرة إضافية في السيرة" rows={3} value={draft.storyExtraText} onChange={(value) => update("storyExtraText", value)} />
      </div>
      <div className="admin-block-heading"><h3>مقطع المبادئ</h3><p>البطاقات نفسها تُحرَّر من تبويب «مبادئ العمل».</p></div>
      <SectionFields value={draft.principles} onChange={(value) => update("principles", value)} options={{ hideCta: true, titleHint: "فارغ = عنوان فلسفة العمل", descriptionHint: "فارغ = نص فلسفة العمل" }} />
      <div className="admin-block-heading"><h3>دعوة التواصل</h3></div>
      <SectionFields value={draft.cta} onChange={(value) => update("cta", value)} options={{ hideDescription: true }} />
      <div className="admin-form-grid">
        <TextArea label="نص الدعوة" value={draft.ctaText} onChange={(value) => update("ctaText", value)} />
      </div>
      <SaveButton label="حفظ نصوص «من أنا»" />
    </form>
  );
}

function ServicesCopyPanel() {
  const { draft, save, update } = useCopyDraft("services");
  return (
    <form className="admin-block" onSubmit={save}>
      <div className="admin-block-heading"><h3>صفحة الخدمات</h3><p>الخدمات نفسها تُحرَّر من تبويب «الخدمات».</p></div>
      <SectionFields value={draft.lead} onChange={(value) => update("lead", value)} options={{ hideCta: true, hideVisibility: true }} />
      <div className="admin-form-grid">
        <TextArea label="الملاحظة الجانبية" rows={2} value={draft.asideNote} onChange={(value) => update("asideNote", value)} hint="اتركيها فارغة لإخفاء البطاقة الجانبية" />
      </div>
      <div className="admin-block-heading"><h3>مقطع الإرشاد أسفل الصفحة</h3></div>
      <SectionFields value={draft.guidance} onChange={(value) => update("guidance", value)} options={{ hideDescription: true }} />
      <div className="admin-form-grid">
        <TextArea label="نص الإرشاد" rows={3} value={draft.guidanceText} onChange={(value) => update("guidanceText", value)} />
      </div>
      <SaveButton label="حفظ نصوص الخدمات" />
    </form>
  );
}

function ArticlesCopyPanel() {
  const { draft, save, update } = useCopyDraft("articles");
  return (
    <form className="admin-block" onSubmit={save}>
      <div className="admin-block-heading"><h3>صفحة المقالات</h3><p>المقالات نفسها تُحرَّر من تبويب «المقالات».</p></div>
      <SectionFields value={draft.lead} onChange={(value) => update("lead", value)} options={{ hideCta: true, hideVisibility: true }} />
      <div className="admin-form-grid">
        <TextField label="نص رابط العودة" value={draft.backLabel} onChange={(value) => update("backLabel", value)} />
        <TextField label="نص حال عدم وجود مقالات" value={draft.emptyText} onChange={(value) => update("emptyText", value)} />
        <TextArea label="تنبيه أسفل كل مقال" rows={2} value={draft.endNote} onChange={(value) => update("endNote", value)} hint="اتركيه فارغاً لإخفاء التنبيه" />
      </div>
      <SaveButton label="حفظ نصوص المقالات" />
    </form>
  );
}

function ContactCopyPanel() {
  const { draft, save, update } = useCopyDraft("contact");
  return (
    <form className="admin-block" onSubmit={save}>
      <div className="admin-block-heading"><h3>صفحة التواصل والحجز</h3><p>عناوين النموذج وتسميات حقوله ورسائل النجاح.</p></div>
      <SectionFields value={draft.lead} onChange={(value) => update("lead", value)} options={{ hideCta: true, hideVisibility: true }} />
      <div className="admin-form-grid">
        <TextField label="سطر فوق عنوان التعريف" value={draft.introEyebrow} onChange={(value) => update("introEyebrow", value)} />
        <TextField label="عنوان التعريف" value={draft.introTitle} onChange={(value) => update("introTitle", value)} />
        <TextArea label="نص التعريف" value={draft.introText} onChange={(value) => update("introText", value)} />
        <TextArea label="ملاحظة الخصوصية" rows={2} value={draft.privacyNote} onChange={(value) => update("privacyNote", value)} />
        <TextField label="عنوان النموذج" value={draft.formTitle} onChange={(value) => update("formTitle", value)} />
        <TextField label="ملاحظة أعلى النموذج" value={draft.formNote} onChange={(value) => update("formNote", value)} />
        <TextField label="نص زر الإرسال" value={draft.submitLabel} onChange={(value) => update("submitLabel", value)} />
        <TextField label="عنوان رسالة النجاح" value={draft.successTitle} onChange={(value) => update("successTitle", value)} />
        <TextArea label="نص رسالة النجاح" rows={2} value={draft.successText} onChange={(value) => update("successText", value)} />
        <TextField label="نص زر «طلب جديد»" value={draft.successAgainLabel} onChange={(value) => update("successAgainLabel", value)} />
      </div>
      <div className="admin-block-heading"><h3>تسميات حقول النموذج</h3></div>
      <div className="admin-form-grid">
        <TextField label="حقل الاسم" value={draft.labelName} onChange={(value) => update("labelName", value)} />
        <TextField label="حقل البريد" value={draft.labelEmail} onChange={(value) => update("labelEmail", value)} />
        <TextField label="حقل الهاتف" value={draft.labelPhone} onChange={(value) => update("labelPhone", value)} />
        <TextField label="حقل الخدمة" value={draft.labelService} onChange={(value) => update("labelService", value)} />
        <TextField label="حقل الوقت المفضل" value={draft.labelTime} onChange={(value) => update("labelTime", value)} />
        <TextField label="حقل الرسالة" value={draft.labelMessage} onChange={(value) => update("labelMessage", value)} />
      </div>
      <SaveButton label="حفظ نصوص التواصل" />
    </form>
  );
}

function NotFoundCopyPanel() {
  const { draft, save, update } = useCopyDraft("notFound");
  return (
    <form className="admin-block" onSubmit={save}>
      <div className="admin-block-heading"><h3>صفحة 404</h3><p>ما يراه الزائر عند فتح رابط غير موجود.</p></div>
      <div className="admin-form-grid">
        <TextField label="سطر فوق العنوان" value={draft.eyebrow} onChange={(value) => update("eyebrow", value)} />
        <TextField label="العنوان" value={draft.title} onChange={(value) => update("title", value)} />
        <TextArea label="النص التوضيحي" rows={2} value={draft.description} onChange={(value) => update("description", value)} />
        <TextField label="نص زر العودة" value={draft.ctaLabel} onChange={(value) => update("ctaLabel", value)} />
      </div>
      <SaveButton label="حفظ نصوص 404" />
    </form>
  );
}

function PagesPanel() {
  return (
    <section className="admin-panel">
      <PanelHeading kicker="هيكل الموقع" title="نصوص الصفحات الداخلية" description="كل صفحة لها كتلة مستقلة تُحفظ بزرها الخاص." />
      <AboutCopyPanel />
      <ServicesCopyPanel />
      <ArticlesCopyPanel />
      <ContactCopyPanel />
      <NotFoundCopyPanel />
    </section>
  );
}

function FooterPanel() {
  const { draft, save, update } = useCopyDraft("footer");
  return (
    <form className="admin-panel" onSubmit={save}>
      <PanelHeading kicker="هيكل الموقع" title="التذييل" description="نصوص أسفل الموقع وروابطه. روابط التذييل تتبع قائمة التنقل." action={<SaveButton label="حفظ التذييل" />} />
      <div className="admin-form-grid">
        <TextArea label="نبذة التذييل" value={draft.tagline} onChange={(value) => update("tagline", value)} />
        <TextField label="عنوان الروابط السريعة" value={draft.quickLinksLabel} onChange={(value) => update("quickLinksLabel", value)} />
        <TextField label="عنوان قسم التواصل" value={draft.contactLabel} onChange={(value) => update("contactLabel", value)} />
        <TextField label="نص بديل عند غياب بيانات التواصل" className="full" value={draft.contactEmptyNote} onChange={(value) => update("contactEmptyNote", value)} />
        <TextField label="نص رابط لوحة الإدارة" value={draft.adminLinkLabel} onChange={(value) => update("adminLinkLabel", value)} />
        <TextField label="نص حقوق النشر" value={draft.copyright} onChange={(value) => update("copyright", value)} hint="تُضاف السنة والاسم تلقائياً" />
        <TextArea label="التنبيه أسفل الموقع" rows={2} value={draft.disclaimer} onChange={(value) => update("disclaimer", value)} />
      </div>
      <VisibilityToggle value={draft.showAdminLink} onChange={(value) => update("showAdminLink", value)} label="إظهار رابط لوحة الإدارة في التذييل" />
    </form>
  );
}

function ServiceEditor({ current, nextPosition, onCancel }: { current?: Service; nextPosition: number; onCancel: () => void }) {
  const { saveService, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Service, "id"> & { id?: string }>(
    current ?? { title: "", shortDescription: "", description: "", icon: "Sparkles", image: "", position: nextPosition },
  );
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveService(draft); toast.success("تم حفظ الخدمة."); onCancel(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="inline-editor" onSubmit={handleSave}>
      <div className="inline-editor-heading"><h3>{current ? "تعديل الخدمة" : "إضافة خدمة"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div>
      <div className="admin-form-grid">
        <TextField label="العنوان" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
        <IconField label="الأيقونة" value={draft.icon} onChange={(value) => setDraft({ ...draft, icon: value })} />
        <TextField label="الوصف القصير" className="full" value={draft.shortDescription} onChange={(value) => setDraft({ ...draft, shortDescription: value })} />
        <TextArea label="التفاصيل" rows={4} value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} />
        <Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field>
        <ImageField label="صورة اختيارية" value={draft.image ?? ""} onChange={(url) => setDraft({ ...draft, image: url })} uploadImage={uploadImage} />
      </div>
      <SaveButton label="حفظ الخدمة" />
    </form>
  );
}

function ServicesPanel() {
  const { services, deleteService, saveService } = useSiteContent();
  const [editing, setEditing] = useState<Service | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذه الخدمة؟")) return;
    try { await deleteService(id); toast.success("تم حذف الخدمة."); } catch { toast.error("تعذر حذف الخدمة."); }
  };
  const move = async (index: number, direction: -1 | 1) => {
    try { await swapPositions(services, index, direction, saveService); } catch { toast.error("تعذر تغيير الترتيب."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="المحتوى"
        title="الخدمات"
        description="أضيفي الخدمات أو عدّليها، وسيظهر الترتيب نفسه في الواجهة."
        action={<button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة خدمة</button>}
      />
      {(adding || editing) && <ServiceEditor current={editing} nextPosition={services.length + 1} onCancel={() => { setAdding(false); setEditing(undefined); }} />}
      <div className="content-list">
        {services.map((service, index) => (
          <article className="content-row" key={service.id}>
            <OrderControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0} disableDown={index === services.length - 1} />
            <div><h3>{service.title}</h3><p>{service.shortDescription}</p></div>
            <div className="content-actions">
              <button onClick={() => { setEditing(service); setAdding(false); }} aria-label="تعديل الخدمة"><PenLine size={17} /></button>
              <button onClick={() => remove(service.id)} aria-label="حذف الخدمة"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PrincipleEditor({ current, nextPosition, onCancel }: { current?: Principle; nextPosition: number; onCancel: () => void }) {
  const { savePrinciple } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Principle, "id"> & { id?: string }>(
    current ?? { title: "", text: "", icon: "Heart", position: nextPosition },
  );
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await savePrinciple(draft); toast.success("تم حفظ المبدأ."); onCancel(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="inline-editor" onSubmit={handleSave}>
      <div className="inline-editor-heading"><h3>{current ? "تعديل المبدأ" : "مبدأ جديد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div>
      <div className="admin-form-grid">
        <TextField label="العنوان" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
        <IconField label="الأيقونة" value={draft.icon} onChange={(value) => setDraft({ ...draft, icon: value })} />
        <TextArea label="النص" rows={3} value={draft.text} onChange={(value) => setDraft({ ...draft, text: value })} />
        <Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field>
      </div>
      <SaveButton label="حفظ المبدأ" />
    </form>
  );
}

function PrinciplesPanel() {
  const { principles, deletePrinciple, savePrinciple } = useSiteContent();
  const [editing, setEditing] = useState<Principle | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذا المبدأ؟")) return;
    try { await deletePrinciple(id); toast.success("تم حذف المبدأ."); } catch { toast.error("تعذر حذف المبدأ."); }
  };
  const move = async (index: number, direction: -1 | 1) => {
    try { await swapPositions(principles, index, direction, savePrinciple); } catch { toast.error("تعذر تغيير الترتيب."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="المحتوى"
        title="مبادئ العمل"
        description="البطاقات الثلاث التي تظهر في صفحة «من أنا» تحت فلسفة العمل."
        action={<button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة مبدأ</button>}
      />
      {(adding || editing) && <PrincipleEditor current={editing} nextPosition={principles.length + 1} onCancel={() => { setAdding(false); setEditing(undefined); }} />}
      <div className="content-list">
        {principles.map((principle, index) => (
          <article className="content-row" key={principle.id}>
            <OrderControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0} disableDown={index === principles.length - 1} />
            <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
            <div className="content-actions">
              <button onClick={() => { setEditing(principle); setAdding(false); }} aria-label="تعديل المبدأ"><PenLine size={17} /></button>
              <button onClick={() => remove(principle.id)} aria-label="حذف المبدأ"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArticleEditor({ current, nextPosition, onCancel }: { current?: Article; nextPosition: number; onCancel: () => void }) {
  const { saveArticle, siteInfo, uploadImage } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Article, "id"> & { id?: string }>(
    current ?? { title: "", excerpt: "", content: "", coverImage: siteInfo.articleImage, category: "", publishedAt: new Date().toISOString().slice(0, 10), position: nextPosition },
  );
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveArticle(draft); toast.success("تم حفظ المقال."); onCancel(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="inline-editor" onSubmit={handleSave}>
      <div className="inline-editor-heading"><h3>{current ? "تعديل المقال" : "مقال جديد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div>
      <div className="admin-form-grid">
        <TextField label="العنوان" className="full" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
        <TextField label="الفئة" value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} />
        <Field label="تاريخ النشر"><input required type="date" dir="ltr" value={draft.publishedAt} onChange={(event) => setDraft({ ...draft, publishedAt: event.target.value })} /></Field>
        <TextArea label="مقدمة المقال" value={draft.excerpt} onChange={(value) => setDraft({ ...draft, excerpt: value })} />
        <Field label="المحتوى" className="full" hint="استخدمي أدوات التنسيق أعلى مساحة الكتابة">
          <RichTextEditor value={draft.content} onChange={(content) => setDraft({ ...draft, content })} />
        </Field>
        <Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field>
        <ImageField label="صورة الغلاف" value={draft.coverImage} onChange={(url) => setDraft({ ...draft, coverImage: url })} uploadImage={uploadImage} />
      </div>
      <SaveButton label="حفظ المقال" />
    </form>
  );
}

function ArticlesPanel() {
  const { articles, deleteArticle, saveArticle } = useSiteContent();
  const [editing, setEditing] = useState<Article | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذا المقال؟")) return;
    try { await deleteArticle(id); toast.success("تم حذف المقال."); } catch { toast.error("تعذر حذف المقال."); }
  };
  const move = async (index: number, direction: -1 | 1) => {
    try { await swapPositions(articles, index, direction, saveArticle); } catch { toast.error("تعذر تغيير الترتيب."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="المحتوى"
        title="المقالات"
        description="انشري قراءة جديدة أو عدّلي المقالات المنشورة بمحرر نصوص كامل."
        action={<button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />مقال جديد</button>}
      />
      {(adding || editing) && <ArticleEditor key={editing?.id ?? "new"} current={editing} nextPosition={articles.length + 1} onCancel={() => { setAdding(false); setEditing(undefined); }} />}
      <div className="content-list">
        {articles.map((article, index) => (
          <article className="content-row" key={article.id}>
            <img src={article.coverImage} alt="" className="content-thumb" />
            <div>
              <p className="content-meta">{article.category} · {article.publishedAt}</p>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </div>
            <div className="content-actions">
              <OrderControls onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0} disableDown={index === articles.length - 1} />
              <button onClick={() => { setEditing(article); setAdding(false); }} aria-label="تعديل المقال"><PenLine size={17} /></button>
              <button onClick={() => remove(article.id)} aria-label="حذف المقال"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialEditor({ current, nextPosition, onCancel }: { current?: Testimonial; nextPosition: number; onCancel: () => void }) {
  const { saveTestimonial } = useSiteContent();
  const [draft, setDraft] = useState<Omit<Testimonial, "id"> & { id?: string }>(
    current ?? { name: "", text: "", rating: 5, position: nextPosition },
  );
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await saveTestimonial(draft); toast.success("تم حفظ الرأي."); onCancel(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };
  return (
    <form className="inline-editor" onSubmit={handleSave}>
      <div className="inline-editor-heading"><h3>{current ? "تعديل الرأي" : "إضافة رأي معتمد"}</h3><button type="button" onClick={onCancel}>إلغاء</button></div>
      <div className="admin-form-grid">
        <TextField label="الاسم أو الوصف المعتمد" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
        <Field label="ترتيب الظهور"><input type="number" min="1" value={draft.position} onChange={(event) => setDraft({ ...draft, position: Number(event.target.value) })} /></Field>
        <TextArea label="نص الرأي" rows={4} value={draft.text} onChange={(value) => setDraft({ ...draft, text: value })} />
      </div>
      <SaveButton label="حفظ الرأي" />
    </form>
  );
}

function TestimonialsPanel() {
  const { testimonials, deleteTestimonial } = useSiteContent();
  const [editing, setEditing] = useState<Testimonial | undefined>();
  const [adding, setAdding] = useState(false);
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذا الرأي؟")) return;
    try { await deleteTestimonial(id); toast.success("تم حذف الرأي."); } catch { toast.error("تعذر حذف الرأي."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="محتوى اختياري"
        title="آراء العملاء"
        description="لن يظهر هذا القسم للعامة ما لم تضيفي رأياً. أضيفي فقط نصوصاً موثقة وموافقاً على استخدامها."
        action={<button className="button-primary button-sm" onClick={() => { setAdding(true); setEditing(undefined); }}><Plus size={16} />إضافة رأي معتمد</button>}
      />
      {(adding || editing) && <TestimonialEditor current={editing} nextPosition={testimonials.length + 1} onCancel={() => { setAdding(false); setEditing(undefined); }} />}
      <div className="content-list">
        {testimonials.length === 0 ? (
          <div className="admin-empty"><MessageSquareQuote size={25} /><p>لا توجد آراء منشورة حالياً، ولذلك لن يظهر قسم آراء العملاء في الموقع.</p></div>
        ) : (
          testimonials.map((item) => (
            <article className="content-row" key={item.id}>
              <span className="content-order">{item.position}</span>
              <div><h3>{item.name}</h3><p>{item.text}</p></div>
              <div className="content-actions">
                <button onClick={() => { setEditing(item); setAdding(false); }} aria-label="تعديل الرأي"><PenLine size={17} /></button>
                <button onClick={() => remove(item.id)} aria-label="حذف الرأي"><Trash2 size={17} /></button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function BookingsPanel() {
  const { bookings, deleteBooking } = useSiteContent();
  const remove = async (id: string) => {
    if (!window.confirm("هل تريدين حذف هذا الطلب نهائياً؟")) return;
    try { await deleteBooking(id); toast.success("تم حذف الطلب."); } catch { toast.error("تعذر حذف الطلب."); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading kicker="المتابعة" title="طلبات الحجز" description="تصل الطلبات هنا فور إرسال النموذج." />
      <div className="booking-list">
        {bookings.length === 0 ? (
          <div className="admin-empty"><MailCheck size={25} /><p>لا توجد طلبات جديدة حالياً.</p></div>
        ) : (
          bookings.map((booking) => (
            <article key={booking.id} className="booking-row">
              <div>
                <p className="content-meta">{new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.createdAt))}</p>
                <h3>{booking.name}</h3>
                <p>{booking.preferredService} · {booking.preferredTime}</p>
              </div>
              <div className="booking-contact">
                <a href={`mailto:${booking.email}`}>{booking.email}</a>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
              </div>
              <p className="booking-message">{booking.message}</p>
              <button className="booking-delete" onClick={() => remove(booking.id)} aria-label="حذف الطلب"><Trash2 size={16} /></button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function OverviewPanel({ onTab }: { onTab: (tab: Tab) => void }) {
  const { articles, bookings, principles, seedContent, services, testimonials } = useSiteContent();
  const [isSeeding, setIsSeeding] = useState(false);
  const cards = [
    { label: "الخدمات", value: services.length, icon: Sparkles, tab: "services" as Tab },
    { label: "المقالات", value: articles.length, icon: BookOpenText, tab: "articles" as Tab },
    { label: "الطلبات", value: bookings.length, icon: MailCheck, tab: "bookings" as Tab },
    { label: "مبادئ العمل", value: principles.length, icon: UsersRound, tab: "principles" as Tab },
  ];
  const shortcuts: Array<{ label: string; description: string; tab: Tab }> = [
    { label: "الهوية البصرية", description: "الألوان والخطوط وشكل الحواف.", tab: "theme" },
    { label: "بيانات الموقع", description: "الاسم والصور والتواصل ونصوص البطل.", tab: "profile" },
    { label: "الصفحة الرئيسية", description: "نصوص كل مقطع وإظهاره أو إخفاؤه.", tab: "home" },
    { label: "التنقل والترويسة", description: "روابط القائمة وترتيبها وزر الحجز.", tab: "navigation" },
    { label: "نصوص الصفحات", description: "من أنا، الخدمات، المقالات، التواصل، 404.", tab: "pages" },
  ];
  const seed = async () => {
    if (!window.confirm("ستُستبدل النصوص والخدمات والمقالات الحالية بمحتوى البداية. هل تريدين المتابعة؟")) return;
    setIsSeeding(true);
    try { await seedContent(); toast.success("تمت تهيئة بيانات البداية بنجاح."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذرت التهيئة."); }
    finally { setIsSeeding(false); }
  };
  return (
    <section className="admin-panel">
      <PanelHeading
        kicker="نظرة عامة"
        title="مرحباً بك في مساحة الإدارة."
        description="راقبي المحتوى والطلبات، ثم انتقلي مباشرة إلى القسم الذي تريدين تحديثه."
        action={<Link className="button-quiet button-sm" href="/">معاينة الموقع <ChevronLeft size={16} /></Link>}
      />
      <div className="admin-stat-grid">
        {cards.map(({ icon: Icon, label, tab, value }) => (
          <button key={label} className="admin-stat" onClick={() => onTab(tab)}><span><Icon size={19} /></span><strong>{value}</strong><small>{label}</small></button>
        ))}
      </div>
      <div className="admin-shortcut-grid">
        {shortcuts.map((shortcut) => (
          <button key={shortcut.tab} className="admin-shortcut" onClick={() => onTab(shortcut.tab)}>
            <strong>{shortcut.label}</strong><small>{shortcut.description}</small>
          </button>
        ))}
      </div>
      <div className="admin-seed">
        <div>
          <h3>تهيئة المحتوى الابتدائي</h3>
          <p>يضيف النصوص والخدمات والمقالات وروابط التنقل والمبادئ الأولية القابلة للتحرير. لا يضيف أي آراء عملاء. عدد الآراء الحالية: {testimonials.length}.</p>
        </div>
        <button className="button-primary button-sm" onClick={seed} disabled={isSeeding}>{isSeeding ? "جارٍ التهيئة..." : "تهيئة المحتوى"}</button>
      </div>
    </section>
  );
}

export default function Admin() {
  const { siteInfo } = useSiteContent();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  useEffect(() => {
    if (!firebaseAuth) { setLoadingAuth(false); return; }
    return onAuthStateChanged(firebaseAuth, (nextUser) => { setUser(nextUser); setLoadingAuth(false); });
  }, []);
  const activeLabel = useMemo(() => allTabs.find((item) => item.id === activeTab)?.label, [activeTab]);
  if (!isFirebaseConfigured) return <SetupScreen />;
  if (loadingAuth) return <main className="admin-loading"><div className="loading-leaf" /><p>جارٍ فتح مساحة الإدارة...</p></main>;
  if (!user) return <LoginScreen />;
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-sidebar-brand">
          <img className="admin-brand-logo" src={siteInfo.logo} alt="" />
          <span><strong>{siteInfo.name}</strong><small>إدارة الموقع</small></span>
        </Link>
        <nav>
          {tabGroups.map((group) => (
            <div key={group.group} className="admin-nav-group">
              <p>{group.group}</p>
              {group.items.map(({ icon: Icon, id, label }) => (
                <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}><Icon size={18} />{label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <p>{user.email}</p>
          <button onClick={() => firebaseAuth && signOut(firebaseAuth)}><LogOut size={17} />تسجيل الخروج</button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div><p>لوحة التحكم</p><h1>{activeLabel}</h1></div>
          <Link href="/" className="admin-view-link">عرض الموقع <ChevronLeft size={17} /></Link>
        </header>
        <div className="admin-content">
          {activeTab === "overview" && <OverviewPanel onTab={setActiveTab} />}
          {activeTab === "theme" && <ThemePanel />}
          {activeTab === "profile" && <ProfilePanel />}
          {activeTab === "navigation" && <NavigationPanel />}
          {activeTab === "home" && <HomePanel />}
          {activeTab === "pages" && <PagesPanel />}
          {activeTab === "footer" && <FooterPanel />}
          {activeTab === "services" && <ServicesPanel />}
          {activeTab === "articles" && <ArticlesPanel />}
          {activeTab === "principles" && <PrinciplesPanel />}
          {activeTab === "testimonials" && <TestimonialsPanel />}
          {activeTab === "bookings" && <BookingsPanel />}
        </div>
      </div>
    </main>
  );
}
