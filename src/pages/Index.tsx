import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/SearchBar";
import CategorySection from "@/components/CategorySection";
import { toolCategories } from "@/data/tools";
import { Zap, Star, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
  };

  const handleToolClick = (toolId: string) => {
    console.log(`Tool clicked: ${toolId}`);
    
    // Universal route mapping for all tools
    const toolRouteMap: Record<string, string> = {
      "pomodoro-timer": "/tools/pomodoro-timer",
      "qr-generator": "/tools/qr-generator",
      "barcode-generator": "/tools/barcode-generator",
      // Image tools
      "png-to-jpg": "/tools/png-to-jpg",
      "image-compressor": "/tools/image-compressor",
      "image-cropper": "/tools/image-cropper",
      "image-rotator": "/tools/image-rotator",
      "image-filters": "/tools/image-filters",
      "instagram-filters": "/tools/instagram-filters",
      "image-resizer": "/tools/image-resizer",
      "instagram-post-generator": "/tools/instagram-post-generator",
      "instagram-post-editor": "/tools/instagram-post-editor",
      "instagram-photo-downloader": "/tools/instagram-photo-downloader",
      "image-average-color": "/tools/image-average-color",
      "image-color-extractor": "/tools/image-color-extractor",
      "image-color-picker": "/tools/image-color-picker",
      "photo-censor": "/tools/photo-censor",
      "svg-to-png": "/tools/svg-to-png",
      "svg-stroke-to-fill": "/tools/svg-stroke-to-fill",
      "image-to-base64": "/tools/image-to-base64",
      "image-caption-generator": "/tools/image-caption-generator",
      "scanned-pdf-converter": "/tools/scanned-pdf-converter",
      // SVG tools
      "svg-blob-generator": "/tools/svg-blob-generator",
      "svg-pattern-generator": "/tools/svg-pattern-generator",
      "svg-optimizer": "/tools/svg-optimizer",
      // Favicon tool
      "favicon-generator": "/tools/favicon-generator",
      // PDF tools
      "merge-pdf": "/tools/pdf-merge",
      "split-pdf": "/tools/pdf-split",
      "pdf-to-jpg": "/tools/pdf-to-jpg",
      "compress-pdf": "/tools/compress-pdf",
      // Text tools
      "character-counter": "/tools/character-counter",
      "case-converter": "/tools/case-converter",
      "text-formatter": "/tools/text-formatter",
      "duplicate-remover": "/tools/duplicate-remover",
      "lorem-ipsum-generator": "/tools/lorem-ipsum-generator",
      "letter-counter": "/tools/letter-counter",
      "text-to-handwriting": "/tools/text-to-handwriting",
      "bionic-reading": "/tools/bionic-reading",
      "whitespace-remover": "/tools/whitespace-remover",
      "list-randomizer": "/tools/list-randomizer",
      // Coding tools
      "base64-encoder": "/tools/base64-encoder",
      "url-encoder": "/tools/url-encoder",
      "html-encoder": "/tools/html-encoder",
      "json-formatter": "/tools/json-formatter",
      "json-tree-viewer": "/tools/json-tree-viewer",
      "regex-tester": "/tools/regex-tester",
      "code-to-image": "/tools/code-to-image",
      // Calculators
      "bmi-calculator": "/tools/bmi-calculator",
      "loan-emi-calculator": "/tools/loan-emi-calculator",
      "percentage-calculator": "/tools/percentage-calculator",
      "age-calculator": "/tools/age-calculator",
      "url-slug-generator": "/tools/url-slug-generator",
      "react-native-shadow": "/tools/react-native-shadow",
      "html-minifier": "/tools/html-minifier",
      "js-minifier": "/tools/js-minifier",
      "html-formatter": "/tools/html-formatter",
      "js-formatter": "/tools/js-formatter",
      "jwt-encoder": "/tools/jwt-encoder",
      // Encryption tools
      "md5-hash-generator": "/tools/md5-hash-generator",
      "strong-password-generator": "/tools/strong-password-generator",
      "md5-encrypt-decrypt": "/tools/md5-encrypt-decrypt",
      // SHA tools (special handling below)
      // Color tools
      "color-picker": "/tools/color-picker",
      "contrast-checker": "/tools/contrast-checker",
      "ai-color-palette": "/tools/ai-color-palette-generator",
      "hex-to-rgba": "/tools/hex-to-rgba-converter",
      "rgba-to-hex": "/tools/rgba-to-hex-converter",
      "color-shades": "/tools/color-shades-generator",
      "color-mixer": "/tools/color-mixer",
      // Productivity tools
      "todo-list": "/tools/todo-list",
      "clipboard-manager": "/tools/clipboard-manager",
    };

    // SHA tools: use one route with variant param
    if (toolId.startsWith("sha") && toolId.endsWith("-encrypt-decrypt")) {
      const variant = toolId.replace("-encrypt-decrypt", "").toUpperCase();
      navigate(`/tools/sha-encrypt-decrypt?variant=${variant}`);
      return;
    }

    // Fix: handle case-insensitive toolId and dashes/underscores
    const normalizedToolId = toolId.toLowerCase().replace(/[_\s]+/g, "-");
    
    // Try both normalized and original toolId for maximum compatibility
    if (toolRouteMap[normalizedToolId]) {
      navigate(toolRouteMap[normalizedToolId]);
    } else if (toolRouteMap[toolId]) {
      navigate(toolRouteMap[toolId]);
    } else {
      // Before giving up, try a generic /tools/tool-id route
      const genericPath = `/tools/${normalizedToolId}`;
      navigate(genericPath);
    }
  };

  // Filter categories and tools based on search query
  const filteredCategories = searchQuery.trim() === "" 
    ? toolCategories
    : toolCategories.map(category => {
        const filteredTools = category.tools.filter(tool => 
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return {
          ...category,
          tools: filteredTools
        };
      }).filter(category => category.tools.length > 0);

  const totalTools = toolCategories.reduce((total, category) => total + category.tools.length, 0);
  const popularTools = toolCategories.flatMap(cat => cat.tools.filter(tool => tool.isPopular));
  const newTools = toolCategories.flatMap(cat => cat.tools.filter(tool => tool.isNew));

  const filteredToolsCount = filteredCategories.reduce((total, category) => total + category.tools.length, 0);

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

      {/* Search Results or Tool Categories */}
      <main id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchQuery.trim() !== "" && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-muted-foreground">
              Found {filteredToolsCount} tool{filteredToolsCount !== 1 ? 's' : ''} matching your search
            </p>
          </div>
        )}

        {filteredCategories.length === 0 && searchQuery.trim() !== "" ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-6">
              Try searching with different keywords or browse our categories below.
            </p>
            <Button onClick={() => setSearchQuery("")} variant="outline">
              Clear Search
            </Button>
          </div>
        ) : (
          filteredCategories.map((category, index) => (
            <CategorySection
              key={category.id}
              title={category.title}
              description={category.description}
              iconName={category.iconName}
              tools={category.tools}
              onToolClick={handleToolClick}
            />
          ))
        )}
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
