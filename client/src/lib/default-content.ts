/**
 * Design system: «ملاذ هادئ» — محتوى بدء إنساني قابل للتبديل من لوحة التحكم فقط بعد التهيئة.
 */
import type { Article, Service, SiteInfo, SiteTheme } from "@/types/site";

export const ASSETS = {
  hero: "/manus-storage/kawthar-hero-therapy-sanctuary_d99d4ac4.jpg",
  dialogue: "/manus-storage/kawthar-space-for-dialogue_7e92f78f.jpg",
  journal: "/manus-storage/kawthar-journal-mindfulness_0f14f068.jpg",
  shadowWalk: "/manus-storage/kawthar-shadow-walk_2504109e.jpg",
  paperBreath: "/manus-storage/kawthar-paper-breath_28d97e66.jpg",
  mark: "/manus-storage/kawthar-brand-mark_cd0a65a8.png",
};

export const defaultSiteTheme: SiteTheme = {
  primary: "#183b5b",
  primaryDeep: "#0e2a43",
  accent: "#f18478",
  background: "#f4f7fa",
  surface: "#ffffff",
  soft: "#d8e7f1",
  ink: "#182c3a",
  footer: "#112c45",
};

export const defaultSiteInfo: SiteInfo = {
  name: "كوثر غربي",
  role: "أخصائية نفسية",
  heroEyebrow: "مساحة آمنة للحوار والنمو",
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
  location: "",
  availability: "بالموعد المسبق",
  heroImage: ASSETS.hero,
  aboutImage: ASSETS.dialogue,
  articleImage: ASSETS.journal,
  theme: defaultSiteTheme,
};

export const defaultServices: Service[] = [
  {
    id: "individual",
    title: "جلسات فردية",
    shortDescription: "مساحة شخصية لفهم ما يثقل يومك واستكشاف ما يعينك.",
    description:
      "حوار فردي هادئ يُصمَّم وفق ما تودّين التوقف عنده، من التوتر اليومي إلى التحولات الشخصية والعلاقات.",
    icon: "Sparkles",
    position: 1,
  },
  {
    id: "couples",
    title: "جلسات للأزواج",
    shortDescription: "إتاحة مساحة أكثر وضوحاً وإصغاءً داخل العلاقة.",
    description:
      "جلسات تساعد على تسمية ما يحدث بين الطرفين، وتطوير لغة أقرب للتفاهم والحدود والاحتياجات المشتركة.",
    icon: "HeartHandshake",
    position: 2,
  },
  {
    id: "youth",
    title: "دعم اليافعين",
    shortDescription: "مرافقة حسّاسة للمرحلة التي تتشكل فيها الأسئلة الكبيرة.",
    description:
      "مساحة مناسبة للحديث عن ضغوط الدراسة والهوية والعلاقات والتغيرات اليومية، وفق ما يتوافق مع إطار العمل المعتمد.",
    icon: "Sprout",
    position: 3,
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
