import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Upload, Code, FileCode, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JavaScriptFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    indentSize: "2",
    indentType: "spaces",
    maxLineLength: 80,
    insertFinalNewline: true,
    semicolons: true,
    quotes: "single",
    bracketSpacing: true,
  });
  const { toast } = useToast();

  const formatJavaScript = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;
    const indent = options.indentType === "spaces" 
      ? " ".repeat(parseInt(options.indentSize)) 
      : "\t";

    // Basic JavaScript formatting
    let formatted = '';
    let indentLevel = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let inMultiLineComment = false;

    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      const nextChar = result[i + 1];
      const prevChar = result[i - 1];

      // Handle string literals
      if ((char === '"' || char === "'" || char === '`') && !inComment && !inMultiLineComment) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = '';
        }
      }

      // Handle comments
      if (!inString) {
        if (char === '/' && nextChar === '/' && !inMultiLineComment) {
          inComment = true;
        } else if (char === '/' && nextChar === '*') {
          inMultiLineComment = true;
        } else if (char === '*' && nextChar === '/' && inMultiLineComment) {
          inMultiLineComment = false;
          formatted += char;
          i++; // Skip the '/'
          formatted += result[i];
          continue;
        } else if (char === '\n' && inComment) {
          inComment = false;
        }
      }

      if (inString || inComment || inMultiLineComment) {
        formatted += char;
        continue;
      }

      // Format based on character
      switch (char) {
        case '{':
          formatted += options.bracketSpacing ? ' {' : '{';
          formatted += '\n';
          indentLevel++;
          formatted += indent.repeat(indentLevel);
          break;

        case '}':
          if (formatted.trim().endsWith(indent)) {
            formatted = formatted.trimEnd();
          }
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += '\n' + indent.repeat(indentLevel) + '}';
          
          // Add newline after closing brace if not at end
          if (i < result.length - 1 && result[i + 1] !== ',' && result[i + 1] !== ';') {
            formatted += '\n' + indent.repeat(indentLevel);
          }
          break;

        case ';':
          formatted += char;
          // Add newline after semicolon if not in for loop
          if (nextChar && nextChar !== ' ' && nextChar !== '\n' && nextChar !== '}') {
            formatted += '\n' + indent.repeat(indentLevel);
          }
          break;

        case ',':
          formatted += char;
          if (nextChar && nextChar !== ' ' && nextChar !== '\n') {
            formatted += ' ';
          }
          break;

        case '=':
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '<':
        case '>':
        case '!':
        case '&':
        case '|':
          // Add spacing around operators
          if (prevChar && prevChar !== ' ' && prevChar !== '=' && prevChar !== '!' && prevChar !== '<' && prevChar !== '>') {
            formatted += ' ';
          }
          formatted += char;
          if (nextChar && nextChar !== ' ' && nextChar !== '=' && nextChar !== '!' && nextChar !== '<' && nextChar !== '>') {
            formatted += ' ';
          }
          break;

        case '(':
        case '[':
          formatted += char;
          break;

        case ')':
        case ']':
          formatted += char;
          break;

        case '\n':
          // Skip multiple newlines
          if (prevChar !== '\n') {
            formatted += '\n' + indent.repeat(indentLevel);
          }
          break;

        case ' ':
          // Skip multiple spaces
          if (prevChar !== ' ') {
            formatted += char;
          }
          break;

        default:
          formatted += char;
          break;
      }
    }

    // Clean up extra whitespace and newlines
    formatted = formatted
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra newlines
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .trim();

    // Add final newline if option is enabled
    if (options.insertFinalNewline) {
      formatted += '\n';
    }

    // Handle quote preferences
    if (options.quotes === 'double') {
      formatted = formatted.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    } else if (options.quotes === 'single') {
      formatted = formatted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'");
    }

    setOutput(formatted);
    
    toast({
      title: "JavaScript Formatted",
      description: "JavaScript code has been formatted successfully!",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Formatted JavaScript copied to clipboard",
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
    a.download = "formatted.js";
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

  const sampleJavaScript = `function calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){const item=items[i];if(item.price&&item.quantity){total+=item.price*item.quantity;}}return total;}const formatCurrency=(amount)=>{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(amount);};document.addEventListener("DOMContentLoaded",function(){const button=document.getElementById("calculate-btn");button.addEventListener("click",()=>{const items=[{price:10.99,quantity:2},{price:5.50,quantity:1}];const total=calculateTotal(items);const formatted=formatCurrency(total);document.getElementById("result").textContent=formatted;});});`;

  const examples = [
    {
      name: "Function Declaration",
      before: `function test(){return"hello";}`,
      after: `function test() {
  return "hello";
}`
    },
    {
      name: "Object Literals",
      before: `const obj={name:"John",age:30,city:"New York"};`,
      after: `const obj = {
  name: "John",
  age: 30,
  city: "New York"
};`
    },
    {
      name: "Arrow Functions",
      before: `const arr=[1,2,3].map(x=>x*2).filter(x=>x>2);`,
      after: `const arr = [1, 2, 3]
  .map(x => x * 2)
  .filter(x => x > 2);`
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">JavaScript Formatter</h1>
          <p className="text-xl text-muted-foreground">
            Format and beautify JavaScript code with proper indentation
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 min-h-[700px]">
          {/* Input/Options Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>JavaScript Editor</CardTitle>
              <CardDescription>
                Paste your JavaScript code or upload a file. Configure formatting options below.
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
                  accept=".js,.mjs,.ts"
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
                <div>
                  <Label className="mb-2 block text-sm">Quote Style</Label>
                  <Select value={options.quotes} onValueChange={(value) => 
                    setOptions(prev => ({ ...prev, quotes: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single (')</SelectItem>
                      <SelectItem value="double">Double (")</SelectItem>
                      <SelectItem value="preserve">Preserve Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bracket-spacing" className="text-sm">Bracket spacing</Label>
                    <Switch
                      id="bracket-spacing"
                      checked={options.bracketSpacing}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, bracketSpacing: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="semicolons" className="text-sm">Add semicolons</Label>
                    <Switch
                      id="semicolons"
                      checked={options.semicolons}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, semicolons: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="final-newline" className="text-sm">Insert final newline</Label>
                    <Switch
                      id="final-newline"
                      checked={options.insertFinalNewline}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, insertFinalNewline: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={formatJavaScript} className="w-full">
                <Code className="w-4 h-4 mr-2" />
                Format JavaScript
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Formatted Output</CardTitle>
              <CardDescription>
                Your beautifully formatted JavaScript code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div>
                <Label htmlFor="js-output" className="mb-2 block">
                  Formatted JavaScript
                </Label>
                <Textarea
                  id="js-output"
                  value={output}
                  readOnly
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Formatted JavaScript will appear here..."
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
              <CardTitle>About JavaScript Formatter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span>Beautifies and formats your JavaScript for better readability and maintainability.</span>
                </div>
                <div>
                  <span>Choose indentation style, quote style, bracket spacing, and more for clean code.</span>
                </div>
                <div>
                  <span>Great for preparing JavaScript for sharing, collaboration, or production.</span>
                </div>
                <div>
                  <span>Helps spot bugs and logical errors more easily.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JavaScriptFormatter;
