/**
 * Design system: «هندسة Ψ» — بطل كحلي بأشكال اللوغو، شريط متحرك، وكتل لونية بزوايا غير متماثلة.
 */
import { ArrowLeft, ArrowUpLeft, CalendarDays, Check, Quote } from "lucide-react";
import { Link } from "wouter";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

/** يبرز أطول كلمة في العنوان باللون البرتقالي، فيبقى النص قابلاً للتعديل من لوحة الإدارة. */
function HighlightedTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const longest = words.reduce((best, word, index) => (word.length > words[best].length ? index : best), 0);
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          {index === longest ? <span className="accent">{word}</span> : word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const { articles, copy, services, siteInfo, testimonials } = useSiteContent();
  const home = copy.home;
  return (
    <main>
      <section className="hero-section">
        <span className="geo geo-quarter soft" style={{ width: "38rem", height: "38rem", top: 0, right: 0, borderRadius: "0 0 0 100%" }} />
        <span className="geo geo-dot" style={{ width: "1.6rem", height: "1.6rem", bottom: "20%", left: "8%" }} />
        <span className="geo geo-ring" style={{ width: "22rem", height: "22rem", bottom: "-9rem", left: "-6rem" }} />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span />{siteInfo.heroEyebrow}</p>
            <h1><HighlightedTitle text={siteInfo.heroTitle} /></h1>
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
            <span className="geo geo-quarter" style={{ width: "46%", height: "42%", top: 0, left: 0 }} />
            <span className="geo geo-dot light" style={{ width: "2.6rem", height: "2.6rem", top: "8%", right: "6%" }} />
            <span className="geo geo-half soft" style={{ width: "9rem", height: "4.5rem", bottom: 0, left: "10%" }} />
            <div
              className="hero-image-arch"
              style={{ "--hero-overlay": Number(siteInfo.heroImageOverlay) / 100 } as React.CSSProperties}
            >
              <img
                src={siteInfo.heroImage}
                alt={`${siteInfo.name} — ${siteInfo.role}`}
                style={{ objectPosition: siteInfo.heroImagePosition }}
              />
            </div>
            {home.heroCardText && (
              <div className="hero-card"><span className="hero-card-line" /> <strong>{home.heroCardText}</strong></div>
            )}
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].flatMap((round) =>
            [siteInfo.heroEyebrow, "BLUE PSYART", "AWAKEN YOUR SOUL WITH ART", "BLUE PSYART"].flatMap((phrase, index) => [
              <span key={`t-${round}-${index}`}>{phrase}</span>,
              <i key={`d-${round}-${index}`} />,
            ]),
          )}
        </div>
      </div>

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
          <span className="geo geo-quarter" style={{ width: "22rem", height: "22rem", bottom: 0, left: 0, borderRadius: "0 100% 0 0" }} />
          <span className="geo geo-dot light" style={{ width: "1.8rem", height: "1.8rem", top: "12%", left: "46%" }} />
          <div className="container about-band-grid">
            <div className="about-photo"><img src={siteInfo.aboutImage} alt="" style={{ objectPosition: siteInfo.aboutImagePosition }} /></div>
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
                  <Link href={`/articles/${article.id}`} className="article-image" aria-label={article.title}><img src={article.coverImage} alt="" /></Link>
                  <div className="article-card-body"><p className="article-meta">{article.category}<span />{new Intl.DateTimeFormat("ar-DZ", { month: "long", year: "numeric" }).format(new Date(article.publishedAt))}</p><h3><Link href={`/articles/${article.id}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link href={`/articles/${article.id}`} className="text-action">اقرئي المقال <ArrowLeft size={16} /></Link></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {home.testimonials.visible && testimonials.length > 0 && (
        <section className="testimonials-section">
          <span className="geo geo-dot navy" style={{ width: "3rem", height: "3rem", top: "2.5rem", left: "6%" }} />
          <span className="geo geo-quarter navy" style={{ width: "11rem", height: "11rem", bottom: 0, right: 0, borderRadius: "100% 0 0 0" }} />
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
