/**
 * محتوى الموقع بلغة الزائر. يطابق شكل useSiteContent تماماً، لكن النصوص مترجمة.
 * لوحة الإدارة تستخدم useSiteContent مباشرة لأنها تحرّر النص العربي الأصلي.
 */
import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { localizeTree } from "@/i18n/translate";

export function usePublicContent() {
  const raw = useSiteContent();
  const { lang } = useLanguage();
  return useMemo(() => {
    if (lang === "ar") return raw;
    const overrides = raw.translations;
    return {
      ...raw,
      siteInfo: localizeTree(raw.siteInfo, lang, overrides, "siteInfo"),
      copy: localizeTree(raw.copy, lang, overrides, "copy"),
      navLinks: localizeTree(raw.navLinks, lang, overrides, "navLinks"),
      principles: localizeTree(raw.principles, lang, overrides, "principles"),
      services: localizeTree(raw.services, lang, overrides, "services"),
      articles: localizeTree(raw.articles, lang, overrides, "articles"),
      testimonials: localizeTree(raw.testimonials, lang, overrides, "testimonials"),
    };
  }, [raw, lang]);
}
