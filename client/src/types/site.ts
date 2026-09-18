/**
 * Design system: «ملاذ هادئ» — بيانات واضحة تحافظ على المحتوى إنسانياً وهادئاً.
 * كل نص وصورة ولون في الموقع يمر عبر هذه الأنواع كي يبقى قابلاً للتحرير من لوحة الإدارة.
 */
export type SiteTheme = {
  primary: string;
  primaryDeep: string;
  accent: string;
  background: string;
  surface: string;
  soft: string;
  ink: string;
  footer: string;
  /** خط العناوين — اسم عائلة خط عربي من Google Fonts. */
  displayFont: string;
  /** خط النصوص العامة. */
  bodyFont: string;
  /** استدارة الحواف بالـ rem، مثل "0.35". */
  radius: string;
  /** حجم النص الأساسي بالبكسل، مثل "16". */
  baseFontSize: string;
};

export type SiteInfo = {
  name: string;
  role: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  welcomeTitle: string;
  welcomeText: string;
  aboutTitle: string;
  aboutText: string;
  philosophyTitle: string;
  philosophyText: string;
  credentials: string;
  yearsExperience: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  availability: string;
  heroImage: string;
  /** بؤرة قصّ صورة الواجهة، مثل "center" أو "top". تُهم عند استخدام صورة شخص. */
  heroImagePosition: string;
  /** شدة التعتيم فوق صورة الواجهة من 0 إلى 100. */
  heroImageOverlay: string;
  aboutImage: string;
  aboutImagePosition: string;
  articleImage: string;
  logo: string;
  metaTitle: string;
  metaDescription: string;
  theme: SiteTheme;
};

/** ترويسة مقطع: فوق-العنوان، العنوان، الوصف، ورابط اختياري. */
export type SectionCopy = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  visible: boolean;
};

export type HomeCopy = {
  heroPrimaryCta: string;
  heroPrimaryHref: string;
  heroSecondaryCta: string;
  heroSecondaryHref: string;
  heroNotes: string[];
  heroCardText: string;
  welcome: SectionCopy;
  services: SectionCopy;
  about: SectionCopy;
  articles: SectionCopy;
  testimonials: SectionCopy;
  cta: SectionCopy;
  ctaText: string;
};

export type AboutCopy = {
  lead: SectionCopy;
  sealText: string;
  storyEyebrow: string;
  storyExtraText: string;
  imageCaption: string;
  principles: SectionCopy;
  cta: SectionCopy;
  ctaText: string;
};

export type ServicesCopy = {
  lead: SectionCopy;
  asideNote: string;
  guidance: SectionCopy;
  guidanceText: string;
};

export type ArticlesCopy = {
  lead: SectionCopy;
  endNote: string;
  backLabel: string;
  emptyText: string;
};

export type ContactCopy = {
  lead: SectionCopy;
  introEyebrow: string;
  introTitle: string;
  introText: string;
  privacyNote: string;
  formTitle: string;
  formNote: string;
  submitLabel: string;
  successTitle: string;
  successText: string;
  successAgainLabel: string;
  labelName: string;
  labelEmail: string;
  labelPhone: string;
  labelService: string;
  labelTime: string;
  labelMessage: string;
};

export type NotFoundCopy = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export type HeaderCopy = {
  ctaLabel: string;
  ctaHref: string;
  showCta: boolean;
};

export type FooterCopy = {
  tagline: string;
  quickLinksLabel: string;
  contactLabel: string;
  contactEmptyNote: string;
  adminLinkLabel: string;
  showAdminLink: boolean;
  copyright: string;
  disclaimer: string;
};

/** كل نصوص الصفحات القابلة للتحرير، محفوظة في مستند واحد. */
export type SiteCopy = {
  header: HeaderCopy;
  home: HomeCopy;
  about: AboutCopy;
  services: ServicesCopy;
  articles: ArticlesCopy;
  contact: ContactCopy;
  notFound: NotFoundCopy;
  footer: FooterCopy;
};

export type NavLink = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  position: number;
};

export type Principle = {
  id: string;
  title: string;
  text: string;
  icon: string;
  position: number;
};

export type Service = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  image?: string;
  position: number;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  position: number;
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating?: number;
  position: number;
};

export type BookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredService: string;
  preferredTime: string;
  message: string;
  createdAt: string;
};
