/**
 * Design system: «ملاذ هادئ» — افتتاح تحريري واسع يوجّه دون واجهة مركزية مكرّرة.
 */
import { ReactNode } from "react";

export function PageLead({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return (
    <section className="page-lead">
      <div className="container page-lead-grid">
        <div>
          <p className="eyebrow"><span />{eyebrow}</p>
          <h1>{title}</h1>
          <p className="page-lead-description">{description}</p>
        </div>
        {aside && <div className="page-lead-aside">{aside}</div>}
      </div>
    </section>
  );
}
