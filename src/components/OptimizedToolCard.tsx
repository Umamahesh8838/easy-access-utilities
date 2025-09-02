import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import getIconComponent from "@/utils/getIcon";

interface OptimizedToolCardProps {
  title: string;
  description: string;
  iconName: string;
  isNew?: boolean;
  isPopular?: boolean;
  onClick: () => void;
}

const OptimizedToolCard = memo(({ 
  title, 
  description, 
  iconName, 
  isNew, 
  isPopular, 
  onClick 
}: OptimizedToolCardProps) => {
  const IconComponent = getIconComponent(iconName);

  return (
    <Card 
      className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-border hover:border-primary/50 hover:bg-card/80"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              {(isNew || isPopular) && (
                <div className="flex space-x-1 mb-1">
                  {isNew && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 border-blue-500/20"
                    >
                      New
                    </Badge>
                  )}
                  {isPopular && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 border-orange-500/20"
                    >
                      Popular
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
});

OptimizedToolCard.displayName = "OptimizedToolCard";

export default OptimizedToolCard;
