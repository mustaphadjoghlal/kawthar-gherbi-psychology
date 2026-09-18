/**
 * Design system: «ملاذ هادئ» — أيقونات عضوية صغيرة تميّز الخدمات من دون زحام بصري.
 */
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Heart,
  HeartHandshake,
  Leaf,
  MessageCircleHeart,
  Moon,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Users,
} from "lucide-react";

const iconMap = {
  Sparkles,
  HeartHandshake,
  Sprout,
  MessageCircleHeart,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Sun,
  Moon,
  Compass,
  BookOpen,
  Users,
  Brain,
};

export function ServiceIcon({ icon, className = "" }: { icon: string; className?: string }) {
  const Icon = iconMap[icon as keyof typeof iconMap] ?? MessageCircleHeart;
  return <Icon className={className} strokeWidth={1.65} aria-hidden="true" />;
}
