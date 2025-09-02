import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, Download, Image, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CodeToImage = () => {
  const [code, setCode] = useState('function helloWorld() {\n  console.log("Hello, World!");\n  return true;\n}');
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState([14]);
  const [padding, setPadding] = useState([32]);
  const [backgroundColor, setBackgroundColor] = useState("#1e293b");
  const [title, setTitle] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ];

  const themes = [
    { value: "dark", label: "Dark", bg: "#1e293b", text: "#f1f5f9" },
    { value: "light", label: "Light", bg: "#ffffff", text: "#1e293b" },
    { value: "github", label: "GitHub", bg: "#f6f8fa", text: "#24292e" },
    { value: "monokai", label: "Monokai", bg: "#272822", text: "#f8f8f2" },
    { value: "dracula", label: "Dracula", bg: "#282a36", text: "#f8f8f2" },
    { value: "nord", label: "Nord", bg: "#2e3440", text: "#d8dee9" },
    { value: "solarized", label: "Solarized", bg: "#002b36", text: "#839496" },
  ];

  const syntaxHighlight = (code: string, language: string) => {
    // Simple syntax highlighting for demonstration
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'for', 'while', 'class', 'extends', 'import', 'export'],
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'try', 'except'],
      java: ['public', 'private', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while'],
      // Add more languages as needed
    };

    const langKeywords = keywords[language as keyof typeof keywords] || [];
    
    let highlightedCode = code;
    
    // Highlight keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="keyword">${keyword}</span>`);
    });

    // Highlight strings
    highlightedCode = highlightedCode.replace(/(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span class="string">$1$2$3</span>');
    
    // Highlight comments
    highlightedCode = highlightedCode.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>');
    
    // Highlight numbers
    highlightedCode = highlightedCode.replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>');

    return highlightedCode;
  };

  const generateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedTheme = themes.find(t => t.value === theme) || themes[0];
    const lines = code.split('\n');
    const lineHeight = fontSize[0] * 1.4;
    const paddingValue = padding[0];
    
    // Calculate canvas dimensions
    ctx.font = `${fontSize[0]}px 'Fira Code', 'Monaco', 'Consolas', monospace`;
    const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const lineNumberWidth = showLineNumbers ? ctx.measureText(lines.length.toString()).width + 20 : 0;
    
    const canvasWidth = maxLineWidth + lineNumberWidth + (paddingValue * 2) + 40;
    const titleHeight = title ? fontSize[0] + 20 : 0;
    const canvasHeight = (lines.length * lineHeight) + (paddingValue * 2) + titleHeight + 20;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw title if provided
    let yOffset = paddingValue;
    if (title) {
      ctx.fillStyle = selectedTheme.text;
      ctx.font = `bold ${fontSize[0] + 4}px 'Fira Code', 'Monaco', 'Consolas', monospace`;
      ctx.fillText(title, paddingValue, yOffset + fontSize[0]);
      yOffset += fontSize[0] + 20;
    }

    // Set font for code
    ctx.font = `${fontSize[0]}px 'Fira Code', 'Monaco', 'Consolas', monospace`;
    
    // Draw code
    lines.forEach((line, index) => {
      const y = yOffset + (index * lineHeight) + fontSize[0];
      
      // Draw line numbers
      if (showLineNumbers) {
        ctx.fillStyle = '#6b7280';
        ctx.fillText((index + 1).toString().padStart(2, ' '), paddingValue, y);
      }
      
      // Draw code line
      ctx.fillStyle = selectedTheme.text;
      ctx.fillText(line, paddingValue + lineNumberWidth, y);
    });

    // Draw border/frame
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    toast({
      title: "Image Generated",
      description: "Code image has been generated successfully!",
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `code-snippet-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast({
      title: "Downloaded",
      description: "Image has been downloaded!",
    });
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast({
            title: "Copied!",
            description: "Image copied to clipboard",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy image to clipboard",
        variant: "destructive",
      });
    }
  };

  const presets = [
    {
      name: "Social Media Post",
      code: 'const greeting = "Hello, World!";\nconsole.log(greeting);',
      language: "javascript",
      theme: "dark",
      title: "Quick JavaScript Example"
    },
    {
      name: "Tutorial Snippet",
      code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
      language: "python",
      theme: "monokai",
      title: "Fibonacci Function"
    },
    {
      name: "Blog Code Block",
      code: 'import React, { useState } from "react";\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n};',
      language: "javascript",
      theme: "github",
      title: "React Counter Component"
    }
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setCode(preset.code);
    setLanguage(preset.language);
    setTheme(preset.theme);
    setTitle(preset.title);
  };

  return (
    <div className="pt-40 min-h-screen bg-background px-4 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Editor & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Code to Image Converter
              </CardTitle>
              <CardDescription>
                Convert your code snippets to beautiful, shareable images. Configure appearance, theme, and export as PNG.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your code..."
                  />
                  <div>
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((themeOption) => (
                          <SelectItem key={themeOption.value} value={themeOption.value}>
                            {themeOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Font Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={10}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Padding: {padding[0]}px</Label>
                    <Slider
                      value={padding}
                      onValueChange={setPadding}
                      min={16}
                      max={64}
                      step={4}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="code-input">Code</Label>
                  <Textarea
                    id="code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code here..."
                    className="min-h-[200px] font-mono"
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
                          className="justify-start"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={generateImage} className="w-full mt-2">
                    <Image className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Preview & Export
              </CardTitle>
              <CardDescription>
                Preview and download your code image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted border rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[400px] border rounded"
                  style={{ backgroundColor: '#1e293b' }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={copyImageToClipboard} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Image
                </Button>
                <Button 
                  onClick={downloadImage} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right: Info & Features */}
        <div className="space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>About & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <b>Code to Image Converter</b> lets you turn code snippets into beautiful, shareable images. Choose your language, theme, font size, and more. Great for social media, blogs, and documentation.
                </p>
                <ul className="list-disc ml-5">
                  <li>Supports many languages: JavaScript, Python, Java, and more</li>
                  <li>Popular themes: Dark, Monokai, GitHub, Dracula, etc.</li>
                  <li>Customizable: font size, padding, title, and quick presets</li>
                  <li>Export as PNG or copy to clipboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeToImage;
