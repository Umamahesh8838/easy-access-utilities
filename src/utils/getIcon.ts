import * as LucideIcons from "lucide-react";

const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName];
  return IconComponent || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
};

export default getIconComponent;