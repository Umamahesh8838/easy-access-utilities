import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Upload, Archive, FileCode, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JavaScriptMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    removeComments: true,
    removeConsole: false,
    removeDebugger: true,
    preserveNewlines: false,
    removeUnnecessarySemicolons: true,
  });
  const { toast } = useToast();

  const minifyJavaScript = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;

    // Remove single-line comments
    if (options.removeComments) {
      result = result.replace(/\/\/.*$/gm, '');
    }

    // Remove multi-line comments
    if (options.removeComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Remove console statements
    if (options.removeConsole) {
      result = result.replace(/console\.[a-zA-Z]+\([^;]*\);?/g, '');
    }

    // Remove debugger statements
    if (options.removeDebugger) {
      result = result.replace(/debugger;?/g, '');
    }

    // Remove unnecessary whitespace
    result = result.replace(/\s+/g, ' '); // Collapse multiple spaces
    result = result.replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1'); // Remove spaces around operators
    result = result.replace(/;\s*}/g, '}'); // Remove semicolon before closing brace
    
    // Handle string literals (basic approach)
    const strings: string[] = [];
    let stringIndex = 0;
    
    // Preserve strings by replacing them with placeholders
    result = result.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, (match) => {
      const placeholder = `__STRING_${stringIndex}__`;
      strings[stringIndex] = match;
      stringIndex++;
      return placeholder;
    });

    // Remove unnecessary semicolons
    if (options.removeUnnecessarySemicolons) {
      result = result.replace(/;+/g, ';'); // Multiple semicolons to single
      result = result.replace(/;}/g, '}'); // Semicolon before }
    }

    // Preserve newlines if option is enabled
    if (!options.preserveNewlines) {
      result = result.replace(/\n+/g, '');
    }

    // Restore strings
    strings.forEach((str, index) => {
      result = result.replace(`__STRING_${index}__`, str);
    });

    // Clean up
    result = result.trim();

    setOutput(result);
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([result]).size;
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

    toast({
      title: "JavaScript Minified",
      description: `Size reduced by ${reduction}% (${originalSize} → ${minifiedSize} bytes)`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Minified JavaScript copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJs = () => {
    const blob = new Blob([output], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.js";
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

  const getStats = () => {
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([output]).size;
    const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize * 100).toFixed(1) : 0;
    
    return { originalSize, minifiedSize, reduction };
  };

  const stats = getStats();

  const sampleJavaScript = `// This is a sample JavaScript file
function calculateTotal(items) {
    let total = 0;
    
    // Loop through all items
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.price && item.quantity) {
            total += item.price * item.quantity;
        }
    }
    
    console.log("Total calculated:", total);
    
    return total;
}

/* 
 * Multi-line comment
 * describing the function
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Event listener
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('calculate-btn');
    
    button.addEventListener('click', () => {
        const items = [
            { price: 10.99, quantity: 2 },
            { price: 5.50, quantity: 1 },
            { price: 15.00, quantity: 3 }
        ];
        
        const total = calculateTotal(items);
        const formatted = formatCurrency(total);
        
        document.getElementById('result').textContent = formatted;
    });
});`;

  const examples = [
    {
      name: "Remove Comments",
      before: "// This is a comment\nconst x = 5;",
      after: "const x=5;"
    },
    {
      name: "Collapse Whitespace",
      before: "function    hello(  ) {\n    return   'world'  ;\n}",
      after: "function hello(){return'world';}"
    },
    {
      name: "Remove Console",
      before: "console.log('debug');\nconst x = 5;",
      after: "const x=5;"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">JavaScript Minifier</h1>
          <p className="text-xl text-muted-foreground">
            Minify JavaScript code to reduce file size and improve performance
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 min-h-[700px]">
          {/* Input/Options Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>JavaScript Editor</CardTitle>
              <CardDescription>
                Paste your JavaScript code or upload a file. Configure minification options below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div>
                <Label htmlFor="file-upload" className="mb-2 block">
                  Upload JavaScript File
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".js,.mjs"
                  onChange={handleFileUpload}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <div>
                <Label htmlFor="js-input" className="mb-2 block">
                  JavaScript Code
                </Label>
                <Textarea
                  id="js-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your JavaScript here..."
                  className="min-h-[200px] font-mono text-sm resize-none"
                />
              </div>

              <Button 
                onClick={() => setInput(sampleJavaScript)} 
                variant="outline" 
                className="w-full"
              >
                <FileCode className="w-4 h-4 mr-2" />
                Load Sample JavaScript
              </Button>

              <div className="space-y-3">
                <h3 className="font-medium">Minification Options</h3>
                <div className="grid grid-cols-1 gap-3">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remove-console" className="text-sm">Remove console statements</Label>
                    <Switch
                      id="remove-console"
                      checked={options.removeConsole}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, removeConsole: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remove-debugger" className="text-sm">Remove debugger statements</Label>
                    <Switch
                      id="remove-debugger"
                      checked={options.removeDebugger}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, removeDebugger: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserve-newlines" className="text-sm">Preserve some newlines</Label>
                    <Switch
                      id="preserve-newlines"
                      checked={options.preserveNewlines}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, preserveNewlines: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remove-semicolons" className="text-sm">Remove unnecessary semicolons</Label>
                    <Switch
                      id="remove-semicolons"
                      checked={options.removeUnnecessarySemicolons}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, removeUnnecessarySemicolons: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={minifyJavaScript} className="w-full">
                <Archive className="w-4 h-4 mr-2" />
                Minify JavaScript
              </Button>
            </CardContent>
          </Card>

          {/* Output/Stats Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Minified Output</CardTitle>
              <CardDescription>
                Your minified JavaScript code and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {output && (
                <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <h3 className="font-medium mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Original</div>
                      <div className="font-mono">{stats.originalSize} bytes</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Minified</div>
                      <div className="font-mono">{stats.minifiedSize} bytes</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reduction</div>
                      <div className="text-green-600 dark:text-green-400 font-mono">{stats.reduction}%</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="js-output" className="mb-2 block">
                  Minified JavaScript
                </Label>
                <Textarea
                  id="js-output"
                  value={output}
                  readOnly
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Minified JavaScript will appear here..."
                />
              </div>

              {output && (
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadJs} variant="outline" className="flex-1">
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
                See how different optimizations work
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
                        <code className="text-red-600 dark:text-red-300 block bg-muted p-2 rounded text-xs">
                          {example.before}
                        </code>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">After:</div>
                        <code className="text-green-700 dark:text-green-300 block bg-muted p-2 rounded text-xs">
                          {example.after}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About JavaScript Minifier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span>Reduce file size for faster load times and better performance.</span>
                </div>
                <div>
                  <span>Removes comments, unnecessary whitespace, and development code like <code>console.log</code> and <code>debugger</code> statements.</span>
                </div>
                <div>
                  <span>Great for preparing JavaScript for production environments.</span>
                </div>
                <div>
                  <span>Options allow you to customize the minification process to your needs.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JavaScriptMinifier;
