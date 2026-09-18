/**
 * Design system: «ملاذ هادئ» — رمز احتواء نباتي ظاهر وواثق، قابل للاستبدال من لوحة الإدارة.
 */
import { useSiteContent } from "@/contexts/SiteContentContext";
import { ASSETS } from "../lib/default-content";

export function BrandMark({ className = "" }: { className?: string }) {
  const { siteInfo } = useSiteContent();
  return (
    <img
      src={siteInfo.logo || ASSETS.mark}
      alt={`رمز ${siteInfo.name}`}
      className={`brand-mark ${className}`}
    />
  );
}
