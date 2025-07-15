import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

const getIconComponent = (iconName: string): LucideIcon => {
  // @ts-ignore - Dynamic icon access for valid Lucide icon names
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
};

export default getIconComponent;