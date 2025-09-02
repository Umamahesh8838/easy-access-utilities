import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import getIconComponent from "@/utils/getIcon";

interface ToolCardProps {
  title: string;
  description: string;
  iconName: string;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
  onClick: () => void;
}

const ToolCard = ({ 
  title, 
  description, 
  iconName, 
  category, 
  isNew = false, 
  isPopular = false, 
  onClick 
}: ToolCardProps) => {
  const IconComponent = getIconComponent(iconName);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card border-border focus-within:ring-2 focus-within:ring-primary cursor-pointer"
      role="article"
      aria-labelledby={`tool-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      aria-describedby={`tool-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle 
                className="text-lg group-hover:text-primary transition-colors duration-300"
                id={`tool-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {title}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">
                {category}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {isNew && (
              <Badge className="bg-gradient-primary text-primary-foreground">
                New
              </Badge>
            )}
            {isPopular && (
              <Badge variant="outline" className="border-primary text-primary">
                Popular
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        <CardDescription 
          className="text-muted-foreground mb-4 line-clamp-2"
          id={`tool-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {description}
        </CardDescription>
        
        <Button 
          onClick={onClick}
          className="w-full group-hover:bg-primary group-hover:shadow-glow transition-all duration-300"
          variant="secondary"
          aria-label={`Open ${title} tool`}
        >
          Use Tool
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToolCard;