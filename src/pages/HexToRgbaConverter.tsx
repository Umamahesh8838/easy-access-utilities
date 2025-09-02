
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function hexToRgba(hex: string, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  const r = num >> 16, g = (num >> 8) & 255, b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const HexToRgbaConverter = () => {
  const [hex, setHex] = useState("#3498db");
  const [alpha, setAlpha] = useState(1);
  const rgba = hexToRgba(hex, alpha);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(rgba);
    toast({ title: "Copied!", description: `RGBA value copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-xl mx-auto px-4">
        <Card className="glass-card shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-6 h-6 text-primary" /> HEX to RGBA Converter
            </CardTitle>
            <CardDescription>
              Convert HEX color to RGBA format. Adjust alpha and copy the result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <input
                type="color"
                value={hex}
                onChange={e => setHex(e.target.value)}
                className="w-32 h-32 rounded-2xl border-4 border-primary shadow-xl transition-all duration-300 hover:scale-105"
                aria-label="Pick HEX color"
              />
              <div className="flex gap-4 items-center">
                <span className="text-sm text-muted-foreground">Alpha:</span>
                <Input type="range" min={0} max={1} step={0.01} value={alpha} onChange={e => setAlpha(Number(e.target.value))} className="w-40" />
                <Input type="number" min={0} max={1} step={0.01} value={alpha} onChange={e => setAlpha(Number(e.target.value))} className="w-20 text-center" />
              </div>
              <Button onClick={handleCopy} variant="ghost" className="font-mono text-lg px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow flex items-center justify-center">
                {rgba}
                <Copy className="w-4 h-4 ml-2 opacity-60" />
              </Button>
              <div className="w-full h-20 rounded-xl mt-4 border-2 border-primary shadow-inner flex items-center justify-center text-lg font-bold tracking-wide" style={{ background: rgba, color: alpha < 0.5 ? '#222' : '#fff' }}>
                Live Preview
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HexToRgbaConverter;
