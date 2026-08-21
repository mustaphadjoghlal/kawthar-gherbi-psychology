/**
 * Design system: «ملاذ هادئ» — بطلتان غير متماثلتين، أقواس احتواء ومسارات تنفّس ناعمة.
 */
import { ArrowLeft, ArrowUpLeft, CalendarDays, Check, Quote } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Home() {
  const { articles, services, siteInfo, testimonials } = useSiteContent();
  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span />{siteInfo.heroEyebrow}</p>
            <h1>{siteInfo.heroTitle}</h1>
            <p className="hero-description">{siteInfo.heroDescription}</p>
            <div className="hero-actions">
              <Link href="/contact" className="button-primary">احجزي موعداً <CalendarDays size={17} /></Link>
              <Link href="/about" className="text-action">تعرّفي أكثر <ArrowLeft size={17} /></Link>
            </div>
            <div className="hero-notes"><span><Check size={15} /> خصوصية واحترام</span><span><Check size={15} /> موعد بالتنسيق المسبق</span></div>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-arch"><img src={siteInfo.heroImage} alt="كوثر غربي في مساحة استشارة هادئة" /></div>
            <div className="hero-card"><span className="hero-card-line" /> <strong>مساحة تبدأ من<br />الإصغاء الجيد.</strong></div>
            <div className="hero-curve" />
          </div>
        </div>
      </section>

      <section className="welcome-section">
        <div className="container welcome-grid">
          <div className="section-marker"><span>01</span><i /></div>
          <div>
            <p className="eyebrow"><span />من هنا نبدأ</p>
            <h2>{siteInfo.welcomeTitle}</h2>
          </div>
          <p className="welcome-copy">{siteInfo.welcomeText}</p>
        </div>
      </section>

      <section className="services-preview">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="eyebrow"><span />كيف يمكنني مرافقتك؟</p><h2>خدمات تُصغي لما تحتاجينه.</h2></div>
            <Link href="/services" className="text-action">استكشفي الخدمات <ArrowLeft size={17} /></Link>
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

      <section className="about-band">
        <div className="container about-band-grid">
          <div className="about-photo"><img src={siteInfo.aboutImage} alt="زاوية مخصصة للحوار الهادئ" /></div>
          <div className="about-band-copy">
            <p className="eyebrow light"><span />عن كوثر</p>
            <h2>{siteInfo.philosophyTitle}</h2>
            <p>{siteInfo.philosophyText}</p>
            <Link href="/about" className="button-quiet">تعرّفي إلى منهج العمل <ArrowLeft size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="articles-preview">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="eyebrow"><span />مساحة للمعرفة</p><h2>قراءات صغيرة لرفقة يومك.</h2></div>
            <Link href="/articles" className="text-action">كل المقالات <ArrowLeft size={17} /></Link>
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

      {testimonials.length > 0 && (
        <section className="testimonials-section">
          <div className="container"><p className="eyebrow"><span />كلمات وصلتنا</p><div className="testimonial-grid">{testimonials.slice(0, 2).map((testimonial) => <figure key={testimonial.id}><Quote size={32} /><blockquote>{testimonial.text}</blockquote><figcaption>{testimonial.name}</figcaption></figure>)}</div></div>
        </section>
      )}

      <section className="contact-cta-section">
        <div className="container contact-cta-grid">
          <div><p className="eyebrow"><span />خطوة أولى</p><h2>لنرتّب بدايةً مريحة للحوار.</h2></div>
          <div><p>أرسلي طلبك في الوقت الذي يناسبك، وسنتواصل معك لتأكيد التفاصيل المناسبة.</p><Link href="/contact" className="button-primary">انتقلي إلى الحجز <ArrowLeft size={17} /></Link></div>
        </div>
      </section>
    </main>
  );
}
