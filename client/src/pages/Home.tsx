/**
 * Design system: «ملاذ هادئ» — بطلتان غير متماثلتين، أقواس احتواء ومسارات تنفّس ناعمة.
 */
import { ArrowLeft, ArrowUpLeft, CalendarDays, Check, Quote } from "lucide-react";
import { Link } from "wouter";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Home() {
  const { articles, copy, services, siteInfo, testimonials } = useSiteContent();
  const home = copy.home;
  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span />{siteInfo.heroEyebrow}</p>
            <h1>{siteInfo.heroTitle}</h1>
            <p className="hero-description">{siteInfo.heroDescription}</p>
            <div className="hero-actions">
              {home.heroPrimaryCta && (
                <Link href={home.heroPrimaryHref} className="button-primary">{home.heroPrimaryCta} <CalendarDays size={17} /></Link>
              )}
              {home.heroSecondaryCta && (
                <Link href={home.heroSecondaryHref} className="text-action">{home.heroSecondaryCta} <ArrowLeft size={17} /></Link>
              )}
            </div>
            {home.heroNotes.length > 0 && (
              <div className="hero-notes">
                {home.heroNotes.filter(Boolean).map((note) => <span key={note}><Check size={15} /> {note}</span>)}
              </div>
            )}
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-arch"><img src={siteInfo.heroImage} alt={`${siteInfo.name} في مساحة استشارة هادئة`} /></div>
            {home.heroCardText && (
              <div className="hero-card"><span className="hero-card-line" /> <strong>{home.heroCardText}</strong></div>
            )}
            <div className="hero-curve" />
          </div>
        </div>
      </section>

      {home.welcome.visible && (
        <section className="welcome-section">
          <div className="container welcome-grid">
            <div className="section-marker"><span>01</span><i /></div>
            <div>
              <p className="eyebrow"><span />{home.welcome.eyebrow}</p>
              <h2>{home.welcome.title || siteInfo.welcomeTitle}</h2>
            </div>
            <p className="welcome-copy">{home.welcome.description || siteInfo.welcomeText}</p>
          </div>
        </section>
      )}

      {home.services.visible && services.length > 0 && (
        <section className="services-preview">
          <div className="container">
            <div className="section-heading split-heading">
              <div><p className="eyebrow"><span />{home.services.eyebrow}</p><h2>{home.services.title}</h2></div>
              {home.services.ctaLabel && (
                <Link href={home.services.ctaHref} className="text-action">{home.services.ctaLabel} <ArrowLeft size={17} /></Link>
              )}
            </div>
            <div className="service-preview-grid">
              {services.slice(0, 3).map((service, index) => (
                <article className={`service-preview service-${index + 1}`} key={service.id}>
                  <span className="service-number">0{index + 1}</span>
                  <div className="icon-orb"><ServiceIcon icon={service.icon} /></div>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                  <Link href="/contact" aria-label={`حجز ${service.title}`} className="arrow-disc"><ArrowUpLeft size={19} /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {home.about.visible && (
        <section className="about-band">
          <div className="container about-band-grid">
            <div className="about-photo"><img src={siteInfo.aboutImage} alt="زاوية مخصصة للحوار الهادئ" /></div>
            <div className="about-band-copy">
              <p className="eyebrow light"><span />{home.about.eyebrow}</p>
              <h2>{home.about.title || siteInfo.philosophyTitle}</h2>
              <p>{home.about.description || siteInfo.philosophyText}</p>
              {home.about.ctaLabel && (
                <Link href={home.about.ctaHref} className="button-quiet">{home.about.ctaLabel} <ArrowLeft size={17} /></Link>
              )}
            </div>
          </div>
        </section>
      )}

      {home.articles.visible && articles.length > 0 && (
        <section className="articles-preview">
          <div className="container">
            <div className="section-heading split-heading">
              <div><p className="eyebrow"><span />{home.articles.eyebrow}</p><h2>{home.articles.title}</h2></div>
              {home.articles.ctaLabel && (
                <Link href={home.articles.ctaHref} className="text-action">{home.articles.ctaLabel} <ArrowLeft size={17} /></Link>
              )}
            </div>
            <div className="article-preview-grid">
              {articles.slice(0, 3).map((article) => (
                <article className="article-card" key={article.id}>
                  <Link href={`/articles/${article.id}`} className="article-image"><img src={article.coverImage} alt="" /></Link>
                  <div className="article-card-body"><p className="article-meta">{article.category}<span />{new Intl.DateTimeFormat("ar-TN", { month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</p><h3><Link href={`/articles/${article.id}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link href={`/articles/${article.id}`} className="text-action">اقرئي المقال <ArrowLeft size={16} /></Link></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {home.testimonials.visible && testimonials.length > 0 && (
        <section className="testimonials-section">
          <div className="container"><p className="eyebrow"><span />{home.testimonials.eyebrow}</p><div className="testimonial-grid">{testimonials.slice(0, 2).map((testimonial) => <figure key={testimonial.id}><Quote size={32} /><blockquote>{testimonial.text}</blockquote><figcaption>{testimonial.name}</figcaption></figure>)}</div></div>
        </section>
      )}

      {home.cta.visible && (
        <section className="contact-cta-section">
          <div className="container contact-cta-grid">
            <div><p className="eyebrow"><span />{home.cta.eyebrow}</p><h2>{home.cta.title}</h2></div>
            <div>
              <p>{home.ctaText}</p>
              {home.cta.ctaLabel && (
                <Link href={home.cta.ctaHref} className="button-primary">{home.cta.ctaLabel} <ArrowLeft size={17} /></Link>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
