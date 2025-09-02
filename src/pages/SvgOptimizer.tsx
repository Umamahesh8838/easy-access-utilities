import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple in-browser SVG optimizer
function optimizeSVG(svg: string) {
  if (!svg) return '';
  let out = svg;
  // Remove comments
  out = out.replace(/<!--([\s\S]*?)-->/g, '');
  // Remove metadata/script/style tags
  out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove empty groups
  out = out.replace(/<g(\s[^>]*)?>\s*<\/g>/gi, '');
  // Remove unnecessary whitespace
  out = out.replace(/>\s+</g, '><');
  // Remove redundant decimals (e.g. 1.0000 -> 1)
  out = out.replace(/(\d+)\.0+(?=[^\d])/g, '$1');
  // Remove unused xmlns:xlink
  out = out.replace(/xmlns:xlink="[^"]*"/g, '');
  // Remove empty id/class attributes
  out = out.replace(/\s(id|class)="\s*"/g, '');
  // Remove xml:space attributes
  out = out.replace(/xml:space="[^"]*"/g, '');
  // Remove leading/trailing whitespace
  out = out.trim();
  return out;
}

const SvgOptimizer = () => {
  const [input, setInput] = useState("<svg width='100' height='100'><circle cx='50' cy='50' r='40' fill='#3498db'/></svg>");
  const { toast } = useToast();
  const optimized = optimizeSVG(input);
  const beforeSize = input.length;
  const afterSize = optimized.length;
  const percent = beforeSize > 0 ? Math.round(100 * (beforeSize - afterSize) / beforeSize) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(optimized);
    toast({ title: "Copied!", description: "Optimized SVG code copied to clipboard." });
  };

  const handleDownload = () => {
    const blob = new Blob([optimized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setInput(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">SVG Optimizer</CardTitle>
            <CardDescription>
              Paste your SVG code below to optimize it. Whitespace and unnecessary code will be removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center w-full">
              <div className="flex flex-col gap-2 w-full">
                <label className="font-mono text-xs text-muted-foreground">Upload SVG file or paste code:</label>
                <input type="file" accept=".svg" onChange={handleFile} className="mb-2" />
                <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} className="w-full rounded border p-2 font-mono text-sm bg-muted/60 dark:bg-muted/40" placeholder="Paste SVG code here..." />
              </div>
              <div className="w-full flex flex-col gap-2">
                <label className="font-mono text-xs text-muted-foreground">Optimized SVG</label>
                <textarea value={optimized} readOnly rows={6} className="w-full rounded border p-2 font-mono text-sm bg-muted/60 dark:bg-muted/40 mt-1" />
                <div className="flex gap-4 items-center mt-2">
                  <span className="font-mono text-xs">Original: {beforeSize} bytes</span>
                  <span className="font-mono text-xs">Optimized: {afterSize} bytes</span>
                  <span className="font-mono text-xs text-green-700">{percent > 0 ? `Reduced by ${percent}%` : ''}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 w-full">
                <Button onClick={handleCopy} variant="ghost" className="flex-1 flex items-center justify-center" aria-label="Copy optimized SVG">
                  <Copy className="w-4 h-4 mr-2" /> Copy Optimized SVG
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex-1">Download SVG</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SvgOptimizer;
