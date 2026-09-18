/**
 * Design system: «ملاذ هادئ» — خدمات مرتبة كمسارات إنسانية بدلاً من شبكة بطاقات متشابهة.
 */
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Services() {
  const { copy, services } = useSiteContent();
  const page = copy.services;
  return (
    <main>
      <PageLead
        eyebrow={page.lead.eyebrow}
        title={page.lead.title}
        description={page.lead.description}
        aside={page.asideNote ? <div className="lead-note"><CalendarDays size={24} /><span>{page.asideNote}</span></div> : undefined}
      />
      <section className="services-list-section">
        <div className="container services-list">
          {services.map((service, index) => (
            <article className="service-row" key={service.id}>
              <span className="row-index">0{index + 1}</span>
              <div className="row-icon"><ServiceIcon icon={service.icon} /></div>
              <div className="row-title"><h2>{service.title}</h2><p>{service.shortDescription}</p></div>
              <p className="row-description">{service.description}</p>
              <Link href="/contact" className="arrow-disc" aria-label={`التواصل بخصوص ${service.title}`}><ArrowLeft size={20} /></Link>
            </article>
          ))}
        </div>
      </section>
      {page.guidance.visible && (
        <section className="service-guidance-section">
          <div className="container guidance-grid">
            <div><p className="eyebrow"><span />{page.guidance.eyebrow}</p><h2>{page.guidance.title}</h2></div>
            <p>{page.guidanceText}</p>
            {page.guidance.ctaLabel && (
              <Link href={page.guidance.ctaHref} className="button-primary">{page.guidance.ctaLabel} <ArrowLeft size={17} /></Link>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
