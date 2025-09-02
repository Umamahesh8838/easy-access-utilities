import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Upload, Archive, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HtmlMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    collapseWhitespace: true,
    removeOptionalTags: false,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  });
  const { toast } = useToast();

  const minifyHtml = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;

    // Remove comments
    if (options.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Collapse whitespace
    if (options.collapseWhitespace) {
      // Remove extra whitespace between tags
      result = result.replace(/>\s+</g, '><');
      // Remove leading/trailing whitespace
      result = result.replace(/^\s+|\s+$/gm, '');
      // Collapse multiple whitespace to single space
      result = result.replace(/\s+/g, ' ');
    }

    // Remove redundant attributes
    if (options.removeRedundantAttributes) {
      result = result.replace(/\s+method=["']get["']/gi, '');
      result = result.replace(/\s+type=["']text["']/gi, '');
      result = result.replace(/\s+javascript:void\(0\)/gi, '');
    }

    // Remove empty attributes
    if (options.removeEmptyAttributes) {
      result = result.replace(/\s+\w+=['"]\s*['"]/g, '');
    }

    // Remove script type attributes
    if (options.removeScriptTypeAttributes) {
      result = result.replace(/\s+type=["']text\/javascript["']/gi, '');
    }

    // Remove style/link type attributes
    if (options.removeStyleLinkTypeAttributes) {
      result = result.replace(/\s+type=["']text\/css["']/gi, '');
    }

    // Remove optional tags (simplified)
    if (options.removeOptionalTags) {
      result = result.replace(/<\/?(html|head|body)\s*>/gi, '');
    }

    // Basic CSS minification
    if (options.minifyCSS) {
      result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
        const minifiedCSS = css
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove last semicolon before }
          .replace(/\s*{\s*/g, '{') // Remove space around {
          .replace(/\s*}\s*/g, '}') // Remove space around }
          .replace(/\s*;\s*/g, ';') // Remove space around ;
          .replace(/\s*:\s*/g, ':') // Remove space around :
          .trim();
        return match.replace(css, minifiedCSS);
      });
    }

    // Basic JS minification
    if (options.minifyJS) {
      result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
        const minifiedJS = js
          .replace(/\/\/.*$/gm, '') // Remove single line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\s*([{}();,])\s*/g, '$1') // Remove space around operators
          .trim();
        return match.replace(js, minifiedJS);
      });
    }

    setOutput(result.trim());
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([result]).size;
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

    toast({
      title: "HTML Minified",
      description: `Size reduced by ${reduction}% (${originalSize} → ${minifiedSize} bytes)`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Minified HTML copied to clipboard",
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
    a.download = "minified.html";
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

  const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <!-- This is a comment -->
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is a sample paragraph with some text.</p>
        <script type="text/javascript">
            console.log("Hello, World!");
            // This is a JavaScript comment
        </script>
    </div>
</body>
</html>`;

  return (
    <div className="pt-40 min-h-screen bg-background px-4 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input & Options */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                HTML Minifier
              </CardTitle>
              <CardDescription>
                Minify HTML code to reduce file size and improve loading speed. Paste code, upload a file, or use the sample.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="file-upload">Upload HTML File</Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="block w-full text-sm"
                  />
                  <Label htmlFor="html-input">HTML Code</Label>
                  <Textarea
                    id="html-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your HTML here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button 
                    onClick={() => setInput(sampleHtml)} 
                    variant="outline" 
                    className="w-full mt-2"
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    Load Sample HTML
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label>Minification Options</Label>
                  <div className="grid grid-cols-1 gap-3 mt-1">
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
                      <Label htmlFor="collapse-whitespace" className="text-sm">Collapse whitespace</Label>
                      <Switch
                        id="collapse-whitespace"
                        checked={options.collapseWhitespace}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, collapseWhitespace: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="remove-redundant" className="text-sm">Remove redundant attributes</Label>
                      <Switch
                        id="remove-redundant"
                        checked={options.removeRedundantAttributes}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, removeRedundantAttributes: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="remove-empty" className="text-sm">Remove empty attributes</Label>
                      <Switch
                        id="remove-empty"
                        checked={options.removeEmptyAttributes}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, removeEmptyAttributes: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minify-css" className="text-sm">Minify inline CSS</Label>
                      <Switch
                        id="minify-css"
                        checked={options.minifyCSS}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, minifyCSS: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minify-js" className="text-sm">Minify inline JavaScript</Label>
                      <Switch
                        id="minify-js"
                        checked={options.minifyJS}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, minifyJS: checked }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={minifyHtml} className="w-full mt-2">
                    <Archive className="w-4 h-4 mr-2" />
                    Minify HTML
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Minified Output
              </CardTitle>
              <CardDescription>
                Your minified HTML code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {output && (
                <div className="bg-muted border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
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
                      <div className="text-green-600 font-mono">{stats.reduction}%</div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="html-output">Minified HTML</Label>
                <Textarea
                  id="html-output"
                  value={output}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Minified HTML will appear here..."
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
        {/* Right: Info & Benefits */}
        <div className="space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>About & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <b>HTML Minifier</b> helps you reduce file size and improve loading speed by removing unnecessary characters, whitespace, and comments from your HTML code. Use the options to customize the minification process.
                </p>
                <ul className="list-disc ml-5">
                  <li>Faster loading: smaller files download quicker</li>
                  <li>Bandwidth savings: less data transfer</li>
                  <li>Better SEO: faster sites rank higher</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HtmlMinifier;
