/**
 * Design system: «ملاذ هادئ» — ختام دافئ وواضح يمنح الزائر مخرجاً سهلاً وموثوقاً.
 */
import { Link } from "wouter";
import { ArrowUpLeft, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useSiteContent } from "@/contexts/SiteContentContext";

export function SiteFooter() {
  const { copy, navLinks, siteInfo } = useSiteContent();
  const footer = copy.footer;
  const links = navLinks.filter((link) => link.visible !== false);
  const hasContactDetails = Boolean(siteInfo.email || siteInfo.phone || siteInfo.location || siteInfo.whatsapp);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup">
            <BrandMark className="h-14 w-14" />
            <span><strong>{siteInfo.name}</strong><small>{siteInfo.role}</small></span>
          </div>
          <p>{footer.tagline}</p>
          {footer.showAdminLink && (
            <Link href="/admin" className="admin-link">{footer.adminLinkLabel} <ArrowUpLeft size={15} /></Link>
          )}
        </div>
        <div>
          <p className="footer-label">{footer.quickLinksLabel}</p>
          <div className="footer-links">
            {links.map((link) => <Link key={link.id} href={link.href}>{link.label}</Link>)}
          </div>
        </div>
        <div>
          <p className="footer-label">{footer.contactLabel}</p>
          <div className="footer-contact">
            {siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={16} />{siteInfo.email}</a>}
            {siteInfo.phone && <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}><Phone size={16} />{siteInfo.phone}</a>}
            {siteInfo.whatsapp && (
              <a href={`https://wa.me/${siteInfo.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle size={16} />واتساب
              </a>
            )}
            {siteInfo.location && <span><MapPin size={16} />{siteInfo.location}</span>}
            {!hasContactDetails && <span className="footer-contact-note">{footer.contactEmptyNote}</span>}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {siteInfo.name}. {footer.copyright}</span>
        <span>{footer.disclaimer}</span>
      </div>
    </footer>
  );
}
