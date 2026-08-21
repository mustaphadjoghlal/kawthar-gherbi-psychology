/**
 * Design system: «ملاذ هادئ» — صفحة مفقودة تمنح الزائر طريقاً واضحاً للعودة بدلاً من طريق مسدود.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return <main className="not-found-inline"><div className="container"><p className="eyebrow"><span />404</p><h1>هذه الصفحة ليست هنا.</h1><p>قد يكون الرابط تغيّر، لكن الوصول إلى المساحة التي تحتاجينها ما زال قريباً.</p><Link href="/" className="button-primary">العودة إلى الرئيسية <ArrowRight size={17} /></Link></div></main>;
}
