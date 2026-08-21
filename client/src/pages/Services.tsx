/**
 * Design system: «ملاذ هادئ» — خدمات مرتبة كمسارات إنسانية بدلاً من شبكة بطاقات متشابهة.
 */
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Services() {
  const { services } = useSiteContent();
  return (
    <main>
      <PageLead eyebrow="الخدمات" title="مسارات تُصمّم حول ما تحتاجينه." description="تعرّفي إلى المساحات المتاحة، ثم اختاري بداية الحوار التي تقترب أكثر من سؤالك اليوم." aside={<div className="lead-note"><CalendarDays size={24} /><span>تُحدَّد تفاصيل الموعد<br />بعد التواصل المبدئي.</span></div>} />
      <section className="services-list-section"><div className="container services-list">{services.map((service, index) => <article className="service-row" key={service.id}><span className="row-index">0{index + 1}</span><div className="row-icon"><ServiceIcon icon={service.icon} /></div><div className="row-title"><h2>{service.title}</h2><p>{service.shortDescription}</p></div><p className="row-description">{service.description}</p><Link href="/contact" className="arrow-disc" aria-label={`التواصل بخصوص ${service.title}`}><ArrowLeft size={20} /></Link></article>)}</div></section>
      <section className="service-guidance-section"><div className="container guidance-grid"><div><p className="eyebrow"><span />أي خدمة تناسبك؟</p><h2>ليس ضرورياً أن تعرفي كل الإجابات قبل الموعد.</h2></div><p>اكتبي في طلب الحجز ما ترغبين في مناقشته باختصار. نساعدك في تحديد نقطة البداية المناسبة، مع الحفاظ على خصوصية ما تشاركينه.</p><Link href="/contact" className="button-primary">أرسلي طلبك <ArrowLeft size={17} /></Link></div></section>
    </main>
  );
}
