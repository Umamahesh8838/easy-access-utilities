import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Cache for loaded icons to prevent re-imports
const iconCache = new Map<string, LucideIcon>();

const getIconComponent = (iconName: string): LucideIcon => {
  // Check cache first
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  // @ts-ignore - Dynamic icon access for valid Lucide icon names
  const IconComponent = (LucideIcons as any)[iconName];
  const icon = IconComponent || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
  
  // Cache the icon
  iconCache.set(iconName, icon);
  
  return icon;
};

export default getIconComponent;