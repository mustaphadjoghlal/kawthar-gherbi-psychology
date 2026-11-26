/**
 * Design system: «ملاذ هادئ» — صفحة مفقودة تمنح الزائر طريقاً واضحاً للعودة بدلاً من طريق مسدود.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { usePublicContent } from "@/hooks/usePublicContent";

export default function NotFound() {
  const { copy } = usePublicContent();
  const page = copy.notFound;
  return (
    <main className="not-found-inline">
      <div className="container">
        <p className="eyebrow"><span />{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <Link href="/" className="button-primary">{page.ctaLabel} <ArrowRight size={17} /></Link>
      </div>
    </main>
  );
}
