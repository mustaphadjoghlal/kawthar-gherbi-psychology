/**
 * Design system: «ملاذ هادئ» — نموذج مريح ومباشر يضع الخصوصية ووضوح الخطوة التالية أولاً.
 */
import { useState } from "react";
import { CalendarDays, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { PageLead } from "@/components/PageLead";
import { useSiteContent } from "@/contexts/SiteContentContext";

const initialForm = { name: "", email: "", phone: "", preferredService: "", preferredTime: "", message: "" };

export default function Contact() {
  const { createBooking, isFirebaseConfigured, services, siteInfo } = useSiteContent();
  const hasContactDetails = Boolean(siteInfo.email || siteInfo.phone || siteInfo.location);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFirebaseConfigured) { setStatus("error"); setError("لم يكتمل ربط نموذج الحجز بقاعدة البيانات بعد. يُرجى التواصل عبر البريد أو الهاتف الظاهرين أدناه."); return; }
    setStatus("sending");
    try { await createBooking(form); setStatus("sent"); setForm(initialForm); } catch (submissionError) { setStatus("error"); setError(submissionError instanceof Error ? submissionError.message : "تعذر إرسال الطلب حالياً."); }
  };
  return (
    <main>
      <PageLead eyebrow="التواصل والحجز" title="اختاري وقتاً مناسباً، ولنرتّب بداية مريحة." description="أرسلي طلبك من خلال النموذج. تُستخدم المعلومات التي تكتبينها للتواصل الأولي وترتيب الموعد فقط." aside={<div className="lead-note"><CalendarDays size={24} /><span>{siteInfo.availability}</span></div>} />
      <section className="contact-section"><div className="container contact-grid"><aside className="contact-details"><p className="eyebrow"><span />خطوة أولى</p><h2>قدّمي نفسك بالطريقة التي تريحك.</h2><p>لا تحتاجين إلى شرح كل شيء في الرسالة الأولى. يكفي أن تكتبي ما يناسبك الآن، ونرتّب الخطوة التالية بهدوء.</p>{hasContactDetails && <div className="contact-detail-list">{siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={19} /><span><small>البريد الإلكتروني</small>{siteInfo.email}</span></a>}{siteInfo.phone && <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}><Phone size={19} /><span><small>الهاتف</small>{siteInfo.phone}</span></a>}{siteInfo.location && <div><MapPin size={19} /><span><small>المكان</small>{siteInfo.location}</span></div>}</div>}<div className="privacy-note"><CheckCircle2 size={19} /><p>لن تُستخدم بياناتك في رسائل تسويقية، ويُتعامل معها وفق قواعد الخصوصية المهنية.</p></div></aside><div className="booking-form-wrap"><form onSubmit={handleSubmit} className="booking-form">{status === "sent" ? <div className="success-state"><CheckCircle2 size={34} /><h2>وصل طلبك، شكراً لك.</h2><p>سيتم التواصل معك لتأكيد التفاصيل المناسبة. يمكنك إرسال طلب آخر عند الحاجة.</p><button type="button" className="button-quiet" onClick={() => setStatus("idle")}>إرسال طلب جديد</button></div> : <><div className="form-heading"><span>طلب موعد</span><p>الحقول المعلّمة مطلوبة.</p></div><div className="form-row"><label>الاسم الكامل<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="اكتبي اسمك" /></label><label>البريد الإلكتروني<input required type="email" dir="ltr" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" /></label></div><div className="form-row"><label>رقم الهاتف<input required type="tel" dir="ltr" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+216 ..." /></label><label>الخدمة الأقرب لاحتياجك<select required value={form.preferredService} onChange={(event) => setForm({ ...form, preferredService: event.target.value })}><option value="">اختاري خدمة</option>{services.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}</select></label></div><label>وقت تفضلينه للتواصل أو الموعد<input required value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })} placeholder="مثال: صباحاً خلال أيام الأسبوع" /></label><label>كيف يمكنني مساعدتك؟<textarea required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="اكتبي باختصار ما ترغبين في مناقشته..." /></label>{status === "error" && <p className="form-error">{error}</p>}<button className="button-primary justify-center" type="submit" disabled={status === "sending"}>{status === "sending" ? "جارٍ إرسال الطلب..." : "إرسال طلب الموعد"}</button></>}</form></div></div></section>
    </main>
  );
}
