/**
 * Design system: «ملاذ هادئ» — ترويسة شفافة، دافئة، وموجهة بهدوء نحو الخطوة التالية.
 */
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useSiteContent } from "@/contexts/SiteContentContext";

export function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { copy, navLinks, siteInfo } = useSiteContent();
  const links = navLinks.filter((link) => link.visible !== false);
  const { ctaHref, ctaLabel, showCta } = copy.header;

  return (
    <header className="site-header">
      <div className="container flex items-center justify-between gap-5 py-4">
        <Link href="/" className="brand-lockup" aria-label="العودة إلى الرئيسية">
          <BrandMark className="h-12 w-12" />
          <span>
            <strong>{siteInfo.name}</strong>
            <small>{siteInfo.role}</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <Link key={link.id} href={link.href} className={`nav-link ${location === link.href ? "active" : ""}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        {showCta && (
          <div className="hidden lg:block">
            <Link href={ctaHref} className="button-primary button-sm">{ctaLabel}</Link>
          </div>
        )}
        <button className="mobile-menu-trigger lg:hidden" onClick={() => setIsOpen((current) => !current)} aria-label="فتح قائمة التنقل">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isOpen && (
        <nav className="mobile-menu lg:hidden" aria-label="التنقل على الهاتف">
          <div className="container grid gap-1 pb-5">
            {links.map((link) => (
              <Link key={link.id} href={link.href} className="mobile-nav-link" onClick={() => setIsOpen(false)}>{link.label}</Link>
            ))}
            {showCta && (
              <Link href={ctaHref} className="button-primary mt-3 justify-center" onClick={() => setIsOpen(false)}>{ctaLabel}</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
