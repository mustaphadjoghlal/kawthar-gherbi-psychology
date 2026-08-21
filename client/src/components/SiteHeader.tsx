/**
 * Design system: «ملاذ هادئ» — ترويسة شفافة، دافئة، وموجهة بهدوء نحو الخطوة التالية.
 */
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useSiteContent } from "@/contexts/SiteContentContext";

const navLinks = [
  ["/", "الرئيسية"],
  ["/about", "من أنا"],
  ["/services", "الخدمات"],
  ["/articles", "المقالات"],
  ["/contact", "التواصل والحجز"],
] as const;

export function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { siteInfo } = useSiteContent();

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
          {navLinks.map(([href, label]) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Link href="/contact" className="button-primary button-sm">احجزي موعداً</Link>
        </div>
        <button className="mobile-menu-trigger lg:hidden" onClick={() => setIsOpen((current) => !current)} aria-label="فتح قائمة التنقل">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isOpen && (
        <nav className="mobile-menu lg:hidden" aria-label="التنقل على الهاتف">
          <div className="container grid gap-1 pb-5">
            {navLinks.map(([href, label]) => (
              <Link key={href} href={href} className="mobile-nav-link" onClick={() => setIsOpen(false)}>{label}</Link>
            ))}
            <Link href="/contact" className="button-primary mt-3 justify-center" onClick={() => setIsOpen(false)}>احجزي موعداً</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
