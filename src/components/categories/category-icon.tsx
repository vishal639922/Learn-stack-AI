import {
  BookOpen,
  Brain,
  Cpu,
  Network,
  BarChart3,
  Globe,
  Monitor,
  Database,
  Layers,
  Code2,
  FileText,
  Target,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Cpu,
  Network,
  BarChart3,
  Globe,
  Monitor,
  Database,
  Layers,
  Code2,
  FileText,
  Target,
  BookOpen,
};

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export function CategoryIcon({ name = "BookOpen", className }: CategoryIconProps) {
  const Icon = iconMap[name] || BookOpen;
  return <Icon className={className} />;
}
