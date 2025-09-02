import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


// Simple random blob generator (for demo)
function generateBlobPath(size = 200, complexity = 6, irregularity = 0.5) {
  const points = [];
  const center = size / 2;
  const radius = size / 2 - 10;
  for (let i = 0; i < complexity; i++) {
    const angle = (Math.PI * 2 * i) / complexity;
    const rand = 1 + (Math.random() - 0.5) * irregularity;
    const r = radius * rand;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    points.push([x, y]);
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` Q${center},${center} ${points[i][0]},${points[i][1]}`;
  }
  d += ` Q${center},${center} ${points[0][0]},${points[0][1]} Z`;
  return d;
}

const SvgBlobGenerator = () => {

  const [size, setSize] = useState(200);
  const [complexity, setComplexity] = useState(6);
  const [irregularity, setIrregularity] = useState(0.5);
  const [fillColor, setFillColor] = useState("#3498db");
  const [strokeColor, setStrokeColor] = useState("#222222");
  const [path, setPath] = useState(() => generateBlobPath(200, 6, 0.5));
  const { toast } = useToast();

  // Regenerate blob when controls change
  const regenerate = () => {
    setPath(generateBlobPath(size, complexity, irregularity));
  };

  // Regenerate on control change
  // eslint-disable-next-line
  useEffect(() => { regenerate(); }, [size, complexity, irregularity]);

  const svg = `<svg width='${size}' height='${size}' viewBox='0 0 ${size} ${size}' fill='${fillColor}' stroke='${strokeColor}' stroke-width='3' xmlns='http://www.w3.org/2000/svg'><path d='${path}'/></svg>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(svg);
    toast({ title: "Copied!", description: "SVG code copied to clipboard." });
  };

  const handleDownload = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blob.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRandom = () => {
    setPath(generateBlobPath(size, complexity, irregularity));
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">SVG Blob Generator</CardTitle>
            <CardDescription>
              Generate organic SVG blob shapes. Adjust size and color, then copy the SVG code!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl border-2 border-muted shadow-lg bg-white dark:bg-muted" style={{ background: "#fff" }}>
                <path d={path} fill={fillColor} stroke={strokeColor} strokeWidth={3} />
              </svg>
              <div className="flex flex-col gap-4 w-full mt-4">
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Size</label>
                  <input type="range" min={100} max={400} value={size} onChange={e => setSize(Number(e.target.value))} className="w-40" />
                  <span className="font-mono text-xs">{size}px</span>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Complexity</label>
                  <input type="range" min={3} max={12} value={complexity} onChange={e => setComplexity(Number(e.target.value))} className="w-40" />
                  <span className="font-mono text-xs">{complexity}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Irregularity</label>
                  <input type="range" min={0} max={1} step={0.01} value={irregularity} onChange={e => setIrregularity(Number(e.target.value))} className="w-40" />
                  <span className="font-mono text-xs">{irregularity}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Fill</label>
                  <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pick fill color" />
                  <label className="font-mono text-xs text-muted-foreground ml-4">Stroke</label>
                  <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pick stroke color" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleRandom} variant="secondary">Random Blob</Button>
                  <Button onClick={handleCopy} variant="ghost" aria-label="Copy SVG">
                    <Copy className="w-4 h-4 mr-2" /> Copy SVG
                  </Button>
                  <Button onClick={handleDownload} variant="outline">Download SVG</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SvgBlobGenerator;
