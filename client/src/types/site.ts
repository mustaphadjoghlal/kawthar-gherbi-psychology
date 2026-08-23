/**
 * Design system: «ملاذ هادئ» — بيانات واضحة تحافظ على المحتوى إنسانياً وهادئاً.
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
  location: string;
  availability: string;
  heroImage: string;
  aboutImage: string;
  articleImage: string;
  theme: SiteTheme;
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
