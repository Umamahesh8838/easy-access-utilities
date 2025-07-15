import { ReactNode } from "react";
import ToolCard from "./ToolCard";
import getIconComponent from "@/utils/getIcon";

interface Tool {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface CategorySectionProps {
  title: string;
  description: string;
  iconName: string;
  tools: Tool[];
  onToolClick: (toolId: string) => void;
}

const CategorySection = ({ 
  title, 
  description, 
  iconName, 
  tools, 
  onToolClick 
}: CategorySectionProps) => {
  const IconComponent = getIconComponent(iconName);
  
  return (
    <section className="py-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          <IconComponent className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            iconName={tool.iconName}
            category={title}
            isNew={tool.isNew}
            isPopular={tool.isPopular}
            onClick={() => onToolClick(tool.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;