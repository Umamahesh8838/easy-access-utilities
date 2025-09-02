import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Pattern SVG generators
function generatePatternSVG({
  type,
  size,
  color,
  bg,
  shapeSize,
  spacing,
  angle
}: {
  type: string;
  size: number;
  color: string;
  bg: string;
  shapeSize: number;
  spacing: number;
  angle: number;
}) {
  if (type === "dots") {
    return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/><circle cx=\"${size/2}\" cy=\"${size/2}\" r=\"${shapeSize/2}\" fill=\"${color}\"/></svg>`;
  }
  if (type === "stripes") {
    return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/><rect x=\"0\" y=\"0\" width=\"${size}\" height=\"${shapeSize}\" fill=\"${color}\" transform=\"rotate(${angle} ${size/2} ${size/2})\"/></svg>`;
  }
  if (type === "grid") {
    return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/><rect x=\"0\" y=\"0\" width=\"${size}\" height=\"${shapeSize}\" fill=\"${color}\"/><rect x=\"0\" y=\"0\" width=\"${shapeSize}\" height=\"${size}\" fill=\"${color}\"/></svg>`;
  }
  if (type === "waves") {
    return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/><path d=\"M0 ${size/2} Q${size/4} ${size/2-shapeSize} ${size/2} ${size/2} T${size} ${size/2}\" stroke=\"${color}\" stroke-width=\"2\" fill=\"none\"/></svg>`;
  }
  if (type === "triangles") {
    return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/><polygon points=\"${size/2},${(size-shapeSize)/2} ${(size-shapeSize)/2},${(size+shapeSize)/2} ${(size+shapeSize)/2},${(size+shapeSize)/2}\" fill=\"${color}\"/></svg>`;
  }
  return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"${size}\" height=\"${size}\" fill=\"${bg}\"/></svg>`;
}

const SvgPatternGenerator = () => {
  const [type, setType] = useState("dots");
  const [size, setSize] = useState(100);
  const [color, setColor] = useState("#3498db");
  const [bg, setBg] = useState("#fff");
  const [shapeSize, setShapeSize] = useState(20);
  const [spacing, setSpacing] = useState(0);
  const [angle, setAngle] = useState(45);
  const { toast } = useToast();

  const svg = generatePatternSVG({ type, size, color, bg, shapeSize, spacing, angle });

  // SVG <pattern> code for export
  const patternCode = `<pattern id='pattern' patternUnits='userSpaceOnUse' width='${size}' height='${size}'>${svg.replace(/<svg[^>]*>|<\/svg>/g, '')}</pattern>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(patternCode);
    toast({ title: "Copied!", description: "SVG <pattern> code copied to clipboard." });
  };

  // For preview: base64 encode SVG for CSS background
  function toBase64(str: string) {
    if (typeof window === 'undefined') return '';
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  const svgBase64 = toBase64(svg);

  const handleDownload = () => {
    // Use the exact SVG string as previewed
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pattern.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">SVG Pattern Generator</CardTitle>
            <CardDescription>
              Create simple SVG patterns. Adjust size, colors, and copy the SVG code!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              {/* Tiled preview using SVG as background */}
              <div
                className="rounded-xl border-2 border-muted shadow-lg bg-white dark:bg-muted"
                style={{
                  width: 320,
                  height: 200,
                  backgroundImage: `url("data:image/svg+xml;base64,${svgBase64}")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: `${size}px ${size}px`,
                }}
              />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Pattern</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
                    <option value="dots">Dots</option>
                    <option value="stripes">Diagonal Stripes</option>
                    <option value="grid">Grid</option>
                    <option value="waves">Waves</option>
                    <option value="triangles">Triangles</option>
                  </select>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Tile Size</label>
                  <input type="range" min={40} max={200} value={size} onChange={e => setSize(Number(e.target.value))} className="w-40" />
                  <span className="font-mono text-xs">{size}px</span>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Shape Size</label>
                  <input type="range" min={5} max={size/2} value={shapeSize} onChange={e => setShapeSize(Number(e.target.value))} className="w-40" />
                  <span className="font-mono text-xs">{shapeSize}px</span>
                </div>
                {type === 'stripes' && (
                  <div className="flex gap-4 items-center">
                    <label className="font-mono text-xs text-muted-foreground">Angle</label>
                    <input type="range" min={0} max={90} value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-40" />
                    <span className="font-mono text-xs">{angle}°</span>
                  </div>
                )}
                <div className="flex gap-4 items-center">
                  <label className="font-mono text-xs text-muted-foreground">Pattern Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pattern color" />
                  <label className="font-mono text-xs text-muted-foreground ml-4">Background</label>
                  <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Background color" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleCopy} variant="ghost" aria-label="Copy SVG pattern">
                    <Copy className="w-4 h-4 mr-2" /> Copy &lt;pattern&gt; Code
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

export default SvgPatternGenerator;
