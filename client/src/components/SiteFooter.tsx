/**
 * Design system: «ملاذ هادئ» — ختام دافئ وواضح يمنح الزائر مخرجاً سهلاً وموثوقاً.
 */
import { Link } from "wouter";
import { ArrowUpLeft, Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useSiteContent } from "@/contexts/SiteContentContext";

export function SiteFooter() {
  const { siteInfo } = useSiteContent();
  const hasContactDetails = Boolean(siteInfo.email || siteInfo.phone || siteInfo.location);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup">
            <BrandMark className="h-14 w-14" />
            <span><strong>{siteInfo.name}</strong><small>{siteInfo.role}</small></span>
          </div>
          <p>مساحة مهنية هادئة للإصغاء، الفهم، وبناء خطوات أكثر اتساقاً مع ما تحتاجينه.</p>
          <Link href="/admin" className="admin-link">دخول لوحة الإدارة <ArrowUpLeft size={15} /></Link>
        </div>
        <div>
          <p className="footer-label">روابط سريعة</p>
          <div className="footer-links">
            <Link href="/about">من أنا</Link>
            <Link href="/services">الخدمات</Link>
            <Link href="/articles">المقالات</Link>
            <Link href="/contact">التواصل والحجز</Link>
          </div>
        </div>
        <div>
          <p className="footer-label">للتواصل</p>
          <div className="footer-contact">
            {siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={16} />{siteInfo.email}</a>}
            {siteInfo.phone && <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}><Phone size={16} />{siteInfo.phone}</a>}
            {siteInfo.location && <span><MapPin size={16} />{siteInfo.location}</span>}
            {!hasContactDetails && <span className="footer-contact-note">يمكنك إرسال طلب الموعد عبر النموذج المخصص.</span>}
          </div>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} {siteInfo.name}. جميع الحقوق محفوظة.</span><span>الصحة النفسية رحلة شخصية، والمحتوى التوعوي لا يغني عن الاستشارة المختصة.</span></div>
    </footer>
  );
}
