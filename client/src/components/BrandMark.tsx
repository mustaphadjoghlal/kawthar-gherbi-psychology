/**
 * Design system: «ملاذ هادئ» — رمز احتواء نباتي ظاهر وواثق، لا شعار نصياً افتراضياً.
 */
import { ASSETS } from "../lib/default-content";

export function BrandMark({ className = "" }: { className?: string }) {
  return <img src={ASSETS.mark} alt="رمز كوثر غربي" className={`brand-mark ${className}`} />;
}
