/**
 * Design system: «ملاذ هادئ» — محتوى بدء إنساني قابل للتبديل من لوحة التحكم فقط بعد التهيئة.
 * كل نص هنا هو القيمة الافتراضية لحقل قابل للتحرير، لا نصاً ثابتاً في الواجهة.
 */
import type {
  Article,
  NavLink,
  Principle,
  Service,
  SiteCopy,
  SiteInfo,
  SiteTheme,
} from "@/types/site";

/**
 * أصول الهوية. الصور الافتراضية أشكال هندسية مشتقة من شعار BLUE PSYART،
 * تُستبدل بصور حقيقية من لوحة الإدارة متى توفرت.
 */
export const ASSETS = {
  hero: "/brand/art/hero.svg",
  dialogue: "/brand/art/dialogue.svg",
  journal: "/brand/art/article-1.svg",
  shadowWalk: "/brand/art/article-2.svg",
  paperBreath: "/brand/art/article-3.svg",
  mark: "/brand/blue-psyart-mark.png",
  logoFull: "/brand/blue-psyart-full.png",
};

/** خطوط عربية متاحة للاختيار من لوحة الإدارة، تُحمّل من Google Fonts عند اختيارها. */
export const ARABIC_FONTS = [
  { value: "Aref Ruqaa Ink", label: "عرَف رقعة (خط عناوين كلاسيكي)" },
  { value: "Amiri", label: "أميري (نسخ أدبي)" },
  { value: "Noto Naskh Arabic", label: "نوتو نسخ (واضح ومتوازن)" },
  { value: "IBM Plex Sans Arabic", label: "IBM Plex عربي (حديث)" },
  { value: "Cairo", label: "القاهرة (عصري هندسي)" },
  { value: "Tajawal", label: "تجوال (بسيط وأنيق)" },
  { value: "Almarai", label: "المراعي (ناعم وواضح)" },
  { value: "Readex Pro", label: "ريدكس برو (مقروء جداً)" },
  { value: "Markazi Text", label: "مركزي (نسخ للقراءة الطويلة)" },
  { value: "Reem Kufi", label: "ريم كوفي (كوفي حديث)" },
] as const;

/** الأيقونات المتاحة للخدمات والمبادئ. */
export const ICON_OPTIONS = [
  { value: "Sparkles", label: "لمعة هادئة" },
  { value: "HeartHandshake", label: "تواصل" },
  { value: "Sprout", label: "نمو" },
  { value: "MessageCircleHeart", label: "حوار" },
  { value: "Heart", label: "قلب" },
  { value: "ShieldCheck", label: "أمان" },
  { value: "CheckCircle2", label: "تأكيد" },
  { value: "Leaf", label: "ورقة" },
  { value: "Sun", label: "شمس" },
  { value: "Moon", label: "هدوء ليلي" },
  { value: "Compass", label: "بوصلة" },
  { value: "BookOpen", label: "كتاب" },
  { value: "Users", label: "مجموعة" },
  { value: "Brain", label: "إدراك" },
  { value: "Palette", label: "لوحة ألوان" },
] as const;

/** الهوية مشتقة من شعار BLUE PSYART: كحلي #011E5B وبرتقالي #FD643C. */
export const defaultSiteTheme: SiteTheme = {
  primary: "#011E5B",
  primaryDeep: "#01143D",
  accent: "#FD643C",
  background: "#F5F7FB",
  surface: "#FFFFFF",
  soft: "#D9E3F4",
  ink: "#12203C",
  footer: "#011E5B",
  displayFont: "Cairo",
  bodyFont: "Tajawal",
  radius: "0.35",
  baseFontSize: "16",
};

export const defaultSiteInfo: SiteInfo = {
  name: "BLUE PSYART",
  role: "للإرشاد النفسي والعلاج بالفن",
  heroEyebrow: "أيقظ روحك بالفن",
  heroTitle: "خطوة هادئة نحو فهم ما تمرّين به.",
  heroDescription:
    "هنا مساحة مهنية مريحة للإصغاء والتأمل، تُرتّب فيها الأفكار والمشاعر بخطوات عملية تناسبك.",
  welcomeTitle: "لأن الإصغاء الجيد بدايةٌ مختلفة.",
  welcomeText:
    "لا يحتاج التغيير إلى استعجال. نبدأ من المكان الذي أنتِ فيه، ونبني معاً فهماً أوضح لما تحتاجينه في هذه المرحلة.",
  aboutTitle: "عن كوثر",
  aboutText:
    "تقدّم كوثر غربي مرافقة نفسية تقوم على الإصغاء والاحترام والوضوح، وتتعامل مع الحوار بوصفه مساحة لفهم التجربة كما تُعاش في يومك.",
  philosophyTitle: "منهج يراعي الإنسان قبل العنوان.",
  philosophyText:
    "الحوار العلاجي مساحة مشتركة لاختبار المعنى واكتشاف الموارد الشخصية، من دون أحكام ومن دون وعود جاهزة.",
  credentials: "",
  yearsExperience: "",
  email: "",
  phone: "",
  whatsapp: "",
  location: "",
  availability: "بالموعد المسبق",
  heroImage: ASSETS.hero,
  aboutImage: ASSETS.dialogue,
  articleImage: ASSETS.journal,
  logo: ASSETS.mark,
  metaTitle: "BLUE PSYART | للإرشاد النفسي والعلاج بالفن",
  metaDescription: "BLUE PSYART — إرشاد نفسي وعلاج بالفن مع الأخصائية النفسية كوثر غربي. مساحة هادئة للحوار والفهم والنمو.",
  theme: defaultSiteTheme,
};

export const defaultNavLinks: NavLink[] = [
  { id: "home", label: "الرئيسية", href: "/", visible: true, position: 1 },
  { id: "about", label: "من أنا", href: "/about", visible: true, position: 2 },
  { id: "services", label: "الخدمات", href: "/services", visible: true, position: 3 },
  { id: "articles", label: "المقالات", href: "/articles", visible: true, position: 4 },
  { id: "contact", label: "التواصل والحجز", href: "/contact", visible: true, position: 5 },
];

export const defaultSiteCopy: SiteCopy = {
  header: {
    ctaLabel: "احجزي موعداً",
    ctaHref: "/contact",
    showCta: true,
  },
  home: {
    heroPrimaryCta: "احجزي موعداً",
    heroPrimaryHref: "/contact",
    heroSecondaryCta: "تعرّفي أكثر",
    heroSecondaryHref: "/about",
    heroNotes: ["خصوصية واحترام", "موعد بالتنسيق المسبق"],
    heroCardText: "مساحة تبدأ من الإصغاء الجيد.",
    welcome: {
      eyebrow: "من هنا نبدأ",
      title: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    services: {
      eyebrow: "كيف يمكنني مرافقتك؟",
      title: "خدمات تُصغي لما تحتاجينه.",
      description: "",
      ctaLabel: "استكشفي الخدمات",
      ctaHref: "/services",
      visible: true,
    },
    about: {
      eyebrow: "عن كوثر",
      title: "",
      description: "",
      ctaLabel: "تعرّفي إلى منهج العمل",
      ctaHref: "/about",
      visible: true,
    },
    articles: {
      eyebrow: "مساحة للمعرفة",
      title: "قراءات صغيرة لرفقة يومك.",
      description: "",
      ctaLabel: "كل المقالات",
      ctaHref: "/articles",
      visible: true,
    },
    testimonials: {
      eyebrow: "كلمات وصلتنا",
      title: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    cta: {
      eyebrow: "خطوة أولى",
      title: "لنرتّب بدايةً مريحة للحوار.",
      description: "",
      ctaLabel: "انتقلي إلى الحجز",
      ctaHref: "/contact",
      visible: true,
    },
    ctaText: "أرسلي طلبك في الوقت الذي يناسبك، وسنتواصل معك لتأكيد التفاصيل المناسبة.",
  },
  about: {
    lead: {
      eyebrow: "من أنا",
      title: "حضور مهني يبدأ باحترام قصتك.",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    sealText: "خصوصيتك ومساحتك في صميم الحوار.",
    storyEyebrow: "المسار المهني",
    storyExtraText:
      "تقوم المرافقة على الإصغاء المتأني لما تقولينه، وعلى البحث معاً عن لغة أوضح لما تمرين به وخطوات قابلة للتجربة في واقعك.",
    imageCaption: "مكان يتيح التوقف والإصغاء.",
    principles: {
      eyebrow: "فلسفة العمل",
      title: "",
      description: "",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    cta: {
      eyebrow: "هل نبدأ؟",
      title: "خطوة هادئة نحو ما يهمك الآن.",
      description: "",
      ctaLabel: "التواصل والحجز",
      ctaHref: "/contact",
      visible: true,
    },
    ctaText: "يمكنك إرسال طلب موعد أو سؤال عام عبر صفحة التواصل.",
  },
  services: {
    lead: {
      eyebrow: "الخدمات",
      title: "مسارات تُصمّم حول ما تحتاجينه.",
      description:
        "تعرّفي إلى المساحات المتاحة، ثم اختاري بداية الحوار التي تقترب أكثر من سؤالك اليوم.",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    asideNote: "تُحدَّد تفاصيل الموعد بعد التواصل المبدئي.",
    guidance: {
      eyebrow: "أي خدمة تناسبك؟",
      title: "ليس ضرورياً أن تعرفي كل الإجابات قبل الموعد.",
      description: "",
      ctaLabel: "أرسلي طلبك",
      ctaHref: "/contact",
      visible: true,
    },
    guidanceText:
      "اكتبي في طلب الحجز ما ترغبين في مناقشته باختصار. نساعدك في تحديد نقطة البداية المناسبة، مع الحفاظ على خصوصية ما تشاركينه.",
  },
  articles: {
    lead: {
      eyebrow: "المقالات",
      title: "قراءات ترافقك في اليوم العادي.",
      description:
        "محتوى توعوي بسيط يفتح أسئلة صغيرة حول العناية النفسية والعلاقات والتوازن اليومي.",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    endNote: "هذا المحتوى توعوي عام ولا يُعد تشخيصاً أو بديلاً عن استشارة مختصة.",
    backLabel: "كل المقالات",
    emptyText: "لا توجد مقالات منشورة حالياً.",
  },
  contact: {
    lead: {
      eyebrow: "التواصل والحجز",
      title: "اختاري وقتاً مناسباً، ولنرتّب بداية مريحة.",
      description:
        "أرسلي طلبك من خلال النموذج. تُستخدم المعلومات التي تكتبينها للتواصل الأولي وترتيب الموعد فقط.",
      ctaLabel: "",
      ctaHref: "",
      visible: true,
    },
    introEyebrow: "خطوة أولى",
    introTitle: "قدّمي نفسك بالطريقة التي تريحك.",
    introText:
      "لا تحتاجين إلى شرح كل شيء في الرسالة الأولى. يكفي أن تكتبي ما يناسبك الآن، ونرتّب الخطوة التالية بهدوء.",
    privacyNote:
      "لن تُستخدم بياناتك في رسائل تسويقية، ويُتعامل معها وفق قواعد الخصوصية المهنية.",
    formTitle: "طلب موعد",
    formNote: "الحقول المعلّمة مطلوبة.",
    submitLabel: "إرسال طلب الموعد",
    successTitle: "وصل طلبك، شكراً لك.",
    successText: "سيتم التواصل معك لتأكيد التفاصيل المناسبة. يمكنك إرسال طلب آخر عند الحاجة.",
    successAgainLabel: "إرسال طلب جديد",
    labelName: "الاسم الكامل",
    labelEmail: "البريد الإلكتروني",
    labelPhone: "رقم الهاتف",
    labelService: "الخدمة الأقرب لاحتياجك",
    labelTime: "وقت تفضلينه للتواصل أو الموعد",
    labelMessage: "كيف يمكنني مساعدتك؟",
  },
  notFound: {
    eyebrow: "404",
    title: "هذه الصفحة ليست هنا.",
    description: "قد يكون الرابط تغيّر، لكن الوصول إلى المساحة التي تحتاجينها ما زال قريباً.",
    ctaLabel: "العودة إلى الرئيسية",
  },
  footer: {
    tagline: "مساحة مهنية هادئة للإصغاء، الفهم، وبناء خطوات أكثر اتساقاً مع ما تحتاجينه.",
    quickLinksLabel: "روابط سريعة",
    contactLabel: "للتواصل",
    contactEmptyNote: "يمكنك إرسال طلب الموعد عبر النموذج المخصص.",
    adminLinkLabel: "دخول لوحة الإدارة",
    showAdminLink: true,
    copyright: "جميع الحقوق محفوظة.",
    disclaimer: "الصحة النفسية رحلة شخصية، والمحتوى التوعوي لا يغني عن الاستشارة المختصة.",
  },
};

export const defaultPrinciples: Principle[] = [
  {
    id: "listening",
    title: "إنصات بلا أحكام",
    text: "تجربة تُؤخذ على محمل الجد من دون اختزالها أو استعجال تفسيرها.",
    icon: "Heart",
    position: 1,
  },
  {
    id: "steps",
    title: "خطوات تناسب واقعك",
    text: "التركيز على ما يمكن ملاحظته وتغييره بالوتيرة المناسبة لك.",
    icon: "CheckCircle2",
    position: 2,
  },
  {
    id: "boundaries",
    title: "حدود مهنية واضحة",
    text: "إطار منظم يحمي المساحة ويجعل الحوار أكثر أمناً ووضوحاً.",
    icon: "ShieldCheck",
    position: 3,
  },
];

export const defaultServices: Service[] = [
  {
    id: "art-therapy",
    title: "العلاج بالفن",
    shortDescription: "تعبير عن المشاعر بالرسم واللون حين تعجز الكلمات.",
    description:
      "جلسات تستعين بالوسائط الفنية للوصول إلى ما يصعب قوله مباشرة. لا تتطلب موهبة ولا خبرة سابقة؛ فالعمل على المعنى الذي يظهر أثناء التعبير، لا على جودة العمل الفني.",
    icon: "Palette",
    position: 1,
  },
  {
    id: "individual",
    title: "جلسات فردية",
    shortDescription: "مساحة شخصية لفهم ما يثقل يومك واستكشاف ما يعينك.",
    description:
      "حوار فردي هادئ يُصمَّم وفق ما تودّين التوقف عنده، من التوتر اليومي إلى التحولات الشخصية والعلاقات.",
    icon: "Sparkles",
    position: 2,
  },
  {
    id: "couples",
    title: "جلسات للأزواج",
    shortDescription: "إتاحة مساحة أكثر وضوحاً وإصغاءً داخل العلاقة.",
    description:
      "جلسات تساعد على تسمية ما يحدث بين الطرفين، وتطوير لغة أقرب للتفاهم والحدود والاحتياجات المشتركة.",
    icon: "HeartHandshake",
    position: 3,
  },
  {
    id: "youth",
    title: "دعم اليافعين",
    shortDescription: "مرافقة حسّاسة للمرحلة التي تتشكل فيها الأسئلة الكبيرة.",
    description:
      "مساحة مناسبة للحديث عن ضغوط الدراسة والهوية والعلاقات والتغيرات اليومية، وفق ما يتوافق مع إطار العمل المعتمد.",
    icon: "Sprout",
    position: 4,
  },
];

export const defaultArticles: Article[] = [
  {
    id: "when-to-pause",
    title: "متى نحتاج إلى التوقف والإصغاء لأنفسنا؟",
    excerpt: "إشارات يومية بسيطة قد تخبرنا بأننا بحاجة إلى مساحة أهدأ، لا إلى مزيد من الضغط.",
    content:
      "## التوقف ليس انسحاباً\n\nأحياناً تظهر الحاجة إلى التوقف في صورة تشتت مستمر، أو انفعال أسرع من المعتاد، أو صعوبة في الاستمتاع بما كان عادياً. لا تعني هذه الإشارات شيئاً واحداً للجميع، لكنها قد تستحق لحظة إصغاء.\n\n## سؤال صغير كبداية\n\nبدلاً من البحث عن إجابة فورية، يمكن أن نسأل: ما الذي يستهلك طاقتي هذه الأيام؟ وما الشيء الصغير الذي قد يجعل يومي ألطف؟\n\n## طلب الدعم\n\nعندما تشعرين أن ثقل التجربة يطول أو يتسع، يمكن أن يكون الحديث مع مختص خطوة عملية ولطيفة لفهم ما يحدث.",
    coverImage: ASSETS.journal,
    category: "عناية ذاتية",
    publishedAt: "2026-08-01",
    position: 1,
  },
  {
    id: "gentle-boundaries",
    title: "الحدود اللطيفة: كيف نقول «لا» باحترام؟",
    excerpt: "الحدود ليست جداراً بيننا وبين الآخرين، بل طريقة أوضح لحماية ما يهمنا.",
    content:
      "## لماذا تبدو الحدود صعبة؟\n\nقد نخلط بين الرفض وإيذاء الآخر، خصوصاً عندما نعتاد تلبية احتياجات الجميع قبل احتياجاتنا. لكن الوضوح الهادئ يترك مساحة أكثر صدقاً للعلاقة.\n\n## صياغة قابلة للتجربة\n\nابدئي بجملة قصيرة: «أقدّر طلبك، لكنني لا أستطيع الآن». لا تحتاجين إلى تبرير طويل كي يكون موقفك محترماً.\n\n## تدريب تدريجي\n\nاختاري موقفاً صغيراً وآمناً أولاً. بعد كل تجربة، لاحظي ما حدث بالفعل لا ما كنت تخشينه فقط.",
    coverImage: ASSETS.shadowWalk,
    category: "علاقات",
    publishedAt: "2026-07-15",
    position: 2,
  },
  {
    id: "rest-without-guilt",
    title: "الراحة من دون شعور بالذنب",
    excerpt: "الراحة ليست مكافأة نؤجلها إلى ما لا نهاية، بل مورد يساعدنا على الاستمرار.",
    content:
      "## الراحة مورد وليست رفاهية\n\nلا تحتاج الراحة دائماً إلى وقت طويل أو رحلة بعيدة. قد تكون خمس دقائق بلا إشعارات، أو مشياً قصيراً، أو وجبة نتناولها بهدوء.\n\n## انتبهي إلى اللغة الداخلية\n\nإذا كانت الراحة تثير الذنب، جربي استبدال عبارة «أنا لا أفعل شيئاً» بعبارة «أنا أستعيد طاقتي لليوم القادم».\n\n## ما يناسبك أنتِ\n\nلا توجد وصفة واحدة للراحة. المهم أن تلاحظي ما يخفف عنك فعلاً، لا ما يُفترض أن يريحك.",
    coverImage: ASSETS.paperBreath,
    category: "توازن يومي",
    publishedAt: "2026-06-28",
    position: 3,
  },
];
