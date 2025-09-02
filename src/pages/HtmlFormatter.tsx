import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Upload, Code, FileCode, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HtmlFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    indentSize: "2",
    indentType: "spaces",
    maxLineLength: 80,
    wrapAttributes: false,
    sortAttributes: false,
    removeComments: false,
  });
  const { toast } = useToast();

  const formatHtml = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;
    const indent = options.indentType === "spaces" 
      ? " ".repeat(parseInt(options.indentSize)) 
      : "\t";

    // Remove existing formatting
    result = result.replace(/>\s+</g, '><');
    result = result.replace(/\s+/g, ' ');
    result = result.trim();

    // Remove comments if option is enabled
    if (options.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Simple HTML formatting
    let formatted = '';
    let indentLevel = 0;
    let inTag = false;
    let tagName = '';
    let attributes = '';
    
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    const inlineTags = ['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'kbd', 'label', 'mark', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var'];

    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      
      if (char === '<') {
        inTag = true;
        tagName = '';
        attributes = '';
        
        // Check if it's a closing tag
        if (result[i + 1] === '/') {
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += '\n' + indent.repeat(indentLevel);
        } else {
          // Opening tag
          formatted += '\n' + indent.repeat(indentLevel);
        }
        
        formatted += char;
      } else if (char === '>' && inTag) {
        inTag = false;
        formatted += char;
        
        // Extract tag name
        const tagMatch = tagName.match(/^(\w+)/);
        const currentTag = tagMatch ? tagMatch[1].toLowerCase() : '';
        
        // Check if we need to increase indent level
        if (!selfClosingTags.includes(currentTag) && !tagName.includes('/')) {
          if (!inlineTags.includes(currentTag)) {
            indentLevel++;
          }
        }
        
        tagName = '';
      } else if (inTag) {
        tagName += char;
        formatted += char;
      } else {
        // Content outside tags
        if (char.trim()) {
          formatted += char;
        }
      }
    }

    // Clean up extra newlines
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    formatted = formatted.trim();

    // Sort attributes if option is enabled
    if (options.sortAttributes) {
      formatted = formatted.replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
        if (!attrs.trim()) return match;
        
        const attrList = attrs.trim().split(/\s+/).filter(attr => attr);
        attrList.sort();
        
        return `<${tag} ${attrList.join(' ')}>`;
      });
    }

    setOutput(formatted);
    
    toast({
      title: "HTML Formatted",
      description: "HTML code has been formatted successfully!",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Formatted HTML copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const sampleHtml = `<!DOCTYPE html><html><head><title>Sample</title><meta charset="UTF-8"><style>body{margin:0;padding:20px;}</style></head><body><div class="container"><h1>Welcome</h1><p>This is a <strong>sample</strong> paragraph with <a href="#" target="_blank">a link</a>.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><script>console.log("Hello World");</script></div></body></html>`;

  const examples = [
    {
      name: "Basic HTML",
      before: `<div><h1>Title</h1><p>Content</p></div>`,
      after: `<div>
  <h1>Title</h1>
  <p>Content</p>
</div>`
    },
    {
      name: "Nested Elements",
      before: `<ul><li><a href="#">Link 1</a></li><li><a href="#">Link 2</a></li></ul>`,
      after: `<ul>
  <li>
    <a href="#">Link 1</a>
  </li>
  <li>
    <a href="#">Link 2</a>
  </li>
</ul>`
    },
    {
      name: "Complex Structure",
      before: `<div class="wrapper"><header><nav><ul><li>Home</li><li>About</li></ul></nav></header><main><section><h2>Section Title</h2><p>Content here</p></section></main></div>`,
      after: `<div class="wrapper">
  <header>
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
      </ul>
    </nav>
  </header>
  <main>
    <section>
      <h2>Section Title</h2>
      <p>Content here</p>
    </section>
  </main>
</div>`
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">HTML Formatter</h1>
          <p className="text-xl text-muted-foreground">
            Format and beautify HTML code with proper indentation
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 min-h-[700px]">
          {/* Input/Options Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>HTML Editor</CardTitle>
              <CardDescription>
                Paste your HTML code or upload a file. Configure formatting options below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div>
                <Label htmlFor="file-upload" className="mb-2 block">
                  Upload HTML File
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <div>
                <Label htmlFor="html-input" className="mb-2 block">
                  HTML Code
                </Label>
                <Textarea
                  id="html-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your HTML here..."
                  className="min-h-[200px] font-mono text-sm resize-none"
                />
              </div>

              <Button 
                onClick={() => setInput(sampleHtml)} 
                variant="outline" 
                className="w-full"
              >
                <FileCode className="w-4 h-4 mr-2" />
                Load Sample HTML
              </Button>

              <div className="space-y-3">
                <h3 className="font-medium">Formatting Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block text-sm">Indent Type</Label>
                    <Select value={options.indentType} onValueChange={(value) => 
                      setOptions(prev => ({ ...prev, indentType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spaces">Spaces</SelectItem>
                        <SelectItem value="tabs">Tabs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm">Indent Size</Label>
                    <Select value={options.indentSize} onValueChange={(value) => 
                      setOptions(prev => ({ ...prev, indentSize: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wrap-attrs" className="text-sm">Wrap attributes</Label>
                    <Switch
                      id="wrap-attrs"
                      checked={options.wrapAttributes}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, wrapAttributes: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sort-attrs" className="text-sm">Sort attributes</Label>
                    <Switch
                      id="sort-attrs"
                      checked={options.sortAttributes}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, sortAttributes: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remove-comments" className="text-sm">Remove comments</Label>
                    <Switch
                      id="remove-comments"
                      checked={options.removeComments}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, removeComments: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={formatHtml} className="w-full">
                <Code className="w-4 h-4 mr-2" />
                Format HTML
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Formatted Output</CardTitle>
              <CardDescription>
                Your beautifully formatted HTML code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div>
                <Label htmlFor="html-output" className="mb-2 block">
                  Formatted HTML
                </Label>
                <Textarea
                  id="html-output"
                  value={output}
                  readOnly
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Formatted HTML will appear here..."
                />
              </div>

              {output && (
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadHtml} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples/Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>
                See how formatting improves code readability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="bg-background p-3 rounded border">
                    <h4 className="font-medium mb-2">{example.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Before:</div>
                        <pre className="text-red-600 dark:text-red-300 bg-muted p-2 rounded text-xs overflow-x-auto">
                          {example.before}
                        </pre>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">After:</div>
                        <pre className="text-green-700 dark:text-green-300 bg-muted p-2 rounded text-xs overflow-x-auto">
                          {example.after}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About HTML Formatter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span>Beautifies and formats your HTML for better readability and maintainability.</span>
                </div>
                <div>
                  <span>Choose indentation style, remove comments, and sort or wrap attributes for clean code.</span>
                </div>
                <div>
                  <span>Great for preparing HTML for sharing, collaboration, or production.</span>
                </div>
                <div>
                  <span>Helps spot missing tags and syntax errors more easily.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HtmlFormatter;
