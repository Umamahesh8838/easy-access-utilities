import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Copy, Link, Wand2, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UrlSlugGenerator = () => {
  const [input, setInput] = useState("");
  const [slug, setSlug] = useState("");
  const [options, setOptions] = useState({
    lowercase: true,
    removeSpecialChars: true,
    maxLength: 60,
    separator: "-",
  });
  const { toast } = useToast();

  const generateSlug = () => {
    if (!input.trim()) {
      setSlug("");
      return;
    }

    let result = input.trim();

    // Convert to lowercase if option is enabled
    if (options.lowercase) {
      result = result.toLowerCase();
    }

    // Remove special characters if option is enabled
    if (options.removeSpecialChars) {
      // Keep only alphanumeric characters, spaces, hyphens, and underscores
      result = result.replace(/[^\w\s-]/g, '');
    }

    // Replace spaces and multiple separators with the chosen separator
    result = result.replace(/[\s_]+/g, options.separator);
    result = result.replace(new RegExp(`\\${options.separator}+`, 'g'), options.separator);

    // Remove leading and trailing separators
    result = result.replace(new RegExp(`^\\${options.separator}+|\\${options.separator}+$`, 'g'), '');

    // Truncate to max length if specified
    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength);
      // Ensure we don't cut off in the middle of a word
      const lastSeparator = result.lastIndexOf(options.separator);
      if (lastSeparator > result.length * 0.7) {
        result = result.substring(0, lastSeparator);
      }
    }

    setSlug(result);
    
    toast({
      title: "Slug Generated",
      description: "URL slug has been generated successfully!",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(slug);
      toast({
        title: "Copied!",
        description: "Slug copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const presets = [
    {
      name: "Article Title",
      text: "How to Build a Modern Web Application with React and TypeScript",
      description: "Perfect for blog posts and articles"
    },
    {
      name: "Product Name",
      text: "Premium Wireless Headphones - Noise Cancelling",
      description: "Great for e-commerce product URLs"
    },
    {
      name: "Category Page",
      text: "Men's Clothing & Accessories",
      description: "Ideal for category and collection pages"
    },
    {
      name: "Event Title",
      text: "Annual Tech Conference 2024: AI & Machine Learning",
      description: "Perfect for event and conference pages"
    }
  ];

  const separatorOptions = [
    { value: "-", label: "Hyphen (-)", example: "my-url-slug" },
    { value: "_", label: "Underscore (_)", example: "my_url_slug" },
    { value: ".", label: "Dot (.)", example: "my.url.slug" },
  ];

  const examples = [
    {
      input: "Best Practices for SEO in 2024",
      output: "best-practices-for-seo-in-2024"
    },
    {
      input: "React.js Tutorial: Getting Started",
      output: "reactjs-tutorial-getting-started"
    },
    {
      input: "Top 10 JavaScript Libraries",
      output: "top-10-javascript-libraries"
    }
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setInput(preset.text);
  };

  return (
    <div className="pt-40 min-h-screen bg-background px-4 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                URL Slug Generator
              </CardTitle>
              <CardDescription>
                Generate SEO-friendly URL slugs from any text. Configure options and preview the result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="text-input">Text to Convert</Label>
                  <Textarea
                    id="text-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your text here..."
                    className="min-h-[120px]"
                  />
                  <div>
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {presets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset(preset)}
                          className="justify-start text-left"
                        >
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={generateSlug} className="w-full mt-2">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Slug
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="slug-output">URL Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug-output"
                      value={slug}
                      readOnly
                      className="font-mono flex-1"
                      placeholder="Generated slug will appear here..."
                    />
                    {slug && (
                      <Button 
                        onClick={copyToClipboard} 
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {slug && (
                    <div className="bg-muted border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Preview URL:</h3>
                      <div className="font-mono text-sm text-muted-foreground break-all">
                        https://example.com/<span className="text-primary">{slug}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 mt-4">
                    <h3 className="font-medium">Options</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lowercase">Convert to lowercase</Label>
                      <Switch
                        id="lowercase"
                        checked={options.lowercase}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, lowercase: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="remove-special">Remove special characters</Label>
                      <Switch
                        id="remove-special"
                        checked={options.removeSpecialChars}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, removeSpecialChars: checked }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="separator">Word Separator</Label>
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        {separatorOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={options.separator === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOptions(prev => ({ ...prev, separator: option.value }))}
                            className="justify-start"
                          >
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs opacity-70">{option.example}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="max-length">
                        Max Length: {options.maxLength > 0 ? `${options.maxLength} chars` : 'No limit'}
                      </Label>
                      <Input
                        id="max-length"
                        type="number"
                        min="0"
                        max="200"
                        value={options.maxLength}
                        onChange={(e) => 
                          setOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right: Info, Examples, Best Practices */}
        <div className="space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>About & Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <b>URL Slug Generator</b> helps you create SEO-friendly, readable slugs for your website URLs. Use the options to customize the output and follow best practices for optimal results.
                </p>
                <ul className="list-disc ml-5">
                  <li>Keep it short (50-60 characters max)</li>
                  <li>Use hyphens (-) for word separation</li>
                  <li>Be descriptive and include keywords</li>
                  <li>Avoid stop words unless essential</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                See how different inputs become URL slugs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="bg-muted p-3 rounded border">
                    <div className="text-xs text-muted-foreground mb-1">Input:</div>
                    <div className="text-sm mb-2">{example.input}</div>
                    <div className="text-xs text-muted-foreground mb-1">Output:</div>
                    <div className="text-primary text-sm font-mono">{example.output}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UrlSlugGenerator;
