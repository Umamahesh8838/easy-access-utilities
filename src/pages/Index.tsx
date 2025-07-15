import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/SearchBar";
import CategorySection from "@/components/CategorySection";
import { toolCategories } from "@/data/tools";
import { Zap, Star, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  const handleToolClick = (toolId: string) => {
    // TODO: Navigate to tool page or open tool modal
    console.log("Opening tool:", toolId);
  };

  const totalTools = toolCategories.reduce((total, category) => total + category.tools.length, 0);
  const popularTools = toolCategories.flatMap(cat => cat.tools.filter(tool => tool.isPopular));
  const newTools = toolCategories.flatMap(cat => cat.tools.filter(tool => tool.isNew));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-subtle opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-primary text-primary-foreground px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Free Online Tools
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Easy Access
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Utilities
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your one-stop destination for essential online tools. Convert images, edit PDFs, 
              format text, and much more - all free and no registration required.
            </p>
          </div>

          <div className="mb-12">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-primary" />
              <span>{totalTools}+ Tools</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>No Registration</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{totalTools}+</div>
              <div className="text-muted-foreground">Total Tools</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{popularTools.length}</div>
              <div className="text-muted-foreground">Popular Tools</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{newTools.length}</div>
              <div className="text-muted-foreground">New Tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {toolCategories.map((category, index) => (
          <CategorySection
            key={category.id}
            title={category.title}
            description={category.description}
            iconName={category.iconName}
            tools={category.tools}
            onToolClick={handleToolClick}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Easy Access Utilities</h3>
            <p className="text-muted-foreground mb-6">
              Making online tools accessible to everyone, everywhere.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">About</Button>
              <Button variant="outline">Contact</Button>
              <Button variant="outline">Privacy</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
