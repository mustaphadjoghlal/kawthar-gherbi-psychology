/**
 * Design system: «ملاذ هادئ» — رمز احتواء نباتي ظاهر وواثق، قابل للاستبدال من لوحة الإدارة.
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { ASSETS } from "../lib/default-content";

export function BrandMark({ className = "" }: { className?: string }) {
  const { siteInfo } = useSiteContent();
  const { t } = useLanguage();
  return (
    <img
      src={siteInfo.logo || ASSETS.mark}
      alt={t("logoAlt", { name: siteInfo.name })}
      className={`brand-mark ${className}`}
    />
  );
}
