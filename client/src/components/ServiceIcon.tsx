/**
 * Design system: «ملاذ هادئ» — أيقونات عضوية صغيرة تميّز الخدمات من دون زحام بصري.
 */
import { HeartHandshake, MessageCircleHeart, Sparkles, Sprout } from "lucide-react";

const iconMap = { Sparkles, HeartHandshake, Sprout, MessageCircleHeart };

export function ServiceIcon({ icon, className = "" }: { icon: string; className?: string }) {
  const Icon = iconMap[icon as keyof typeof iconMap] ?? MessageCircleHeart;
  return <Icon className={className} strokeWidth={1.65} aria-hidden="true" />;
}
