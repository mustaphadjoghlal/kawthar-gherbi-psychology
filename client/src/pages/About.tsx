/**
 * Design system: «ملاذ هادئ» — سيرة مهنية دافئة في بناء تحريري متدرج وموثوق.
 */
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function About() {
  const { copy, principles, siteInfo } = useSiteContent();
  const about = copy.about;
  return (
    <main>
      <PageLead
        eyebrow={about.lead.eyebrow}
        title={about.lead.title}
        description={about.lead.description || siteInfo.aboutText}
        aside={about.sealText ? <div className="lead-seal"><ShieldCheck size={29} /><span>{about.sealText}</span></div> : undefined}
      />
      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-image">
            <img src={siteInfo.aboutImage} alt="" style={{ objectPosition: siteInfo.aboutImagePosition }} />
            {about.imageCaption && <span className="image-caption">{about.imageCaption}</span>}
          </div>
          <div className="about-story-copy">
            <p className="eyebrow"><span />{about.storyEyebrow}</p>
            <h2>{siteInfo.aboutTitle}</h2>
            <p>{siteInfo.aboutText}</p>
            {about.storyExtraText && <p>{about.storyExtraText}</p>}
            {siteInfo.credentials && <div className="credential-line"><span>المؤهلات</span><strong>{siteInfo.credentials}</strong></div>}
            {siteInfo.yearsExperience && <div className="credential-line"><span>الخبرة</span><strong>{siteInfo.yearsExperience}</strong></div>}
          </div>
        </div>
      </section>
      {about.principles.visible && principles.length > 0 && (
        <section className="principles-section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow"><span />{about.principles.eyebrow}</p>
              <h2>{about.principles.title || siteInfo.philosophyTitle}</h2>
              <p>{about.principles.description || siteInfo.philosophyText}</p>
            </div>
            <div className="principle-grid">
              {principles.map((principle) => (
                <article key={principle.id}>
                  <ServiceIcon icon={principle.icon} className="principle-icon" />
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {about.cta.visible && (
        <section className="contact-cta-section compact">
          <div className="container contact-cta-grid">
            <div><p className="eyebrow"><span />{about.cta.eyebrow}</p><h2>{about.cta.title}</h2></div>
            <div>
              <p>{about.ctaText}</p>
              {about.cta.ctaLabel && <Link href={about.cta.ctaHref} className="button-primary">{about.cta.ctaLabel} <ArrowLeft size={17} /></Link>}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
