/**
 * Design system: «ملاذ هادئ» — سيرة مهنية دافئة في بناء تحريري متدرج وموثوق.
 */
import { ArrowLeft, CheckCircle2, Heart, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { PageLead } from "@/components/PageLead";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function About() {
  const { siteInfo } = useSiteContent();
  return (
    <main>
      <PageLead eyebrow="من أنا" title="حضور مهني يبدأ باحترام قصتك." description={siteInfo.aboutText} aside={<div className="lead-seal"><ShieldCheck size={29} /><span>خصوصيتك ومساحتك<br />في صميم الحوار.</span></div>} />
      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-image"><img src={siteInfo.aboutImage} alt="مساحة حوار هادئة" /><span className="image-caption">مكان يتيح التوقف والإصغاء.</span></div>
          <div className="about-story-copy"><p className="eyebrow"><span />المسار المهني</p><h2>{siteInfo.aboutTitle}</h2><p>{siteInfo.aboutText}</p><p>تقوم المرافقة على الإصغاء المتأني لما تقولينه، وعلى البحث معاً عن لغة أوضح لما تمرين به وخطوات قابلة للتجربة في واقعك.</p>{siteInfo.credentials && <div className="credential-line"><span>المؤهلات</span><strong>{siteInfo.credentials}</strong></div>}{siteInfo.yearsExperience && <div className="credential-line"><span>الخبرة</span><strong>{siteInfo.yearsExperience}</strong></div>}</div>
        </div>
      </section>
      <section className="principles-section">
        <div className="container"><div className="section-heading"><p className="eyebrow"><span />فلسفة العمل</p><h2>{siteInfo.philosophyTitle}</h2><p>{siteInfo.philosophyText}</p></div><div className="principle-grid"><article><Heart size={25} /><h3>إنصات بلا أحكام</h3><p>تجربة تُؤخذ على محمل الجد من دون اختزالها أو استعجال تفسيرها.</p></article><article><CheckCircle2 size={25} /><h3>خطوات تناسب واقعك</h3><p>التركيز على ما يمكن ملاحظته وتغييره بالوتيرة المناسبة لك.</p></article><article><ShieldCheck size={25} /><h3>حدود مهنية واضحة</h3><p>إطار منظم يحمي المساحة ويجعل الحوار أكثر أمناً ووضوحاً.</p></article></div></div>
      </section>
      <section className="contact-cta-section compact"><div className="container contact-cta-grid"><div><p className="eyebrow"><span />هل نبدأ؟</p><h2>خطوة هادئة نحو ما يهمك الآن.</h2></div><div><p>يمكنك إرسال طلب موعد أو سؤال عام عبر صفحة التواصل.</p><Link href="/contact" className="button-primary">التواصل والحجز <ArrowLeft size={17} /></Link></div></div></section>
    </main>
  );
}
