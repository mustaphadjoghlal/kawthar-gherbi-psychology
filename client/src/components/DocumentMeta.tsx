/**
 * عنوان التبويب ووصف الصفحة بلغة الزائر.
 */
import { useEffect } from "react";
import { usePublicContent } from "@/hooks/usePublicContent";

export function DocumentMeta() {
  const { siteInfo } = usePublicContent();
  useEffect(() => {
    document.title = siteInfo.metaTitle || `${siteInfo.name} | ${siteInfo.role}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", siteInfo.metaDescription);
  }, [siteInfo.metaTitle, siteInfo.metaDescription, siteInfo.name, siteInfo.role]);
  return null;
}
