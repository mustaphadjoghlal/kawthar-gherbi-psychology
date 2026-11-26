/**
 * Design system: «ملاذ هادئ» — نموذج مريح ومباشر يضع الخصوصية ووضوح الخطوة التالية أولاً.
 */
import { useState } from "react";
import { CalendarDays, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageLead } from "@/components/PageLead";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicContent } from "@/hooks/usePublicContent";
import { LANGUAGES } from "@/i18n/languages";
import { translateUi } from "@/i18n/ui";
import { useSiteContent } from "@/contexts/SiteContentContext";

const initialForm = { name: "", email: "", phone: "", preferredService: "", preferredTime: "", message: "" };

export default function Contact() {
  const { copy, services, siteInfo } = usePublicContent();
  // القيمة المرسلة للإدارة هي اسم الخدمة بالعربية الأصلية، أما المعروض للزائر فمترجم.
  const { createBooking, isFirebaseConfigured, services: sourceServices } = useSiteContent();
  const { lang, t } = useLanguage();
  const page = copy.contact;
  const hasContactDetails = Boolean(siteInfo.email || siteInfo.phone || siteInfo.location || siteInfo.whatsapp);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFirebaseConfigured) {
      setStatus("error");
      setError(t("errorNotConnected"));
      return;
    }
    setStatus("sending");
    try {
      // نذكر للإدارة لغة الزائر كي ترد عليه بلغته.
      const note = lang === "ar" ? "" : `\n\n— ${translateUi("visitorLanguage", "ar", { language: LANGUAGES.find((item) => item.code === lang)?.name ?? lang })}`;
      await createBooking({ ...form, message: `${form.message}${note}` });
      setStatus("sent");
      setForm(initialForm);
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : t("errorSend"));
    }
  };

  return (
    <main>
      <PageLead
        eyebrow={page.lead.eyebrow}
        title={page.lead.title}
        description={page.lead.description}
        aside={<div className="lead-note"><CalendarDays size={24} /><span>{siteInfo.availability}</span></div>}
      />
      <section className="contact-section">
        <div className="container contact-grid">
          <aside className="contact-details">
            <p className="eyebrow"><span />{page.introEyebrow}</p>
            <h2>{page.introTitle}</h2>
            <p>{page.introText}</p>
            {hasContactDetails && (
              <div className="contact-detail-list">
                {siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={19} /><span><small>{t("email")}</small>{siteInfo.email}</span></a>}
                {siteInfo.phone && <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`}><Phone size={19} /><span><small>{t("phone")}</small>{siteInfo.phone}</span></a>}
                {siteInfo.whatsapp && (
                  <a href={`https://wa.me/${siteInfo.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle size={19} /><span><small>{t("whatsapp")}</small>{siteInfo.whatsapp}</span>
                  </a>
                )}
                {siteInfo.location && <div><MapPin size={19} /><span><small>{t("location")}</small>{siteInfo.location}</span></div>}
              </div>
            )}
            {page.privacyNote && <div className="privacy-note"><CheckCircle2 size={19} /><p>{page.privacyNote}</p></div>}
          </aside>
          <div className="booking-form-wrap">
            <form onSubmit={handleSubmit} className="booking-form">
              {status === "sent" ? (
                <div className="success-state">
                  <CheckCircle2 size={34} />
                  <h2>{page.successTitle}</h2>
                  <p>{page.successText}</p>
                  <button type="button" className="button-quiet" onClick={() => setStatus("idle")}>{page.successAgainLabel}</button>
                </div>
              ) : (
                <>
                  <div className="form-heading"><span>{page.formTitle}</span><p>{page.formNote}</p></div>
                  <div className="form-row">
                    <label>{page.labelName}<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t("namePlaceholder")} /></label>
                    <label>{page.labelEmail}<input required type="email" dir="ltr" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" /></label>
                  </div>
                  <div className="form-row">
                    <label>{page.labelPhone}<input required type="tel" dir="ltr" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+213 ..." /></label>
                    <label>{page.labelService}
                      <select required value={form.preferredService} onChange={(event) => setForm({ ...form, preferredService: event.target.value })}>
                        <option value="">{t("chooseService")}</option>
                        {services.map((service, index) => <option key={service.id} value={sourceServices[index]?.title ?? service.title}>{service.title}</option>)}
                      </select>
                    </label>
                  </div>
                  <label>{page.labelTime}<input required value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })} placeholder={t("timePlaceholder")} /></label>
                  <label>{page.labelMessage}<textarea required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder={t("messagePlaceholder")} /></label>
                  {status === "error" && <p className="form-error">{error}</p>}
                  <button className="button-primary justify-center" type="submit" disabled={status === "sending"}>{status === "sending" ? t("sending") : page.submitLabel}</button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
