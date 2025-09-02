
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function rgbToHsl([r, g, b]: number[]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const ColorPicker = () => {
  const [color, setColor] = useState("#3498db");
  const { toast } = useToast();
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", description: `${label} value copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-xl mx-auto px-4">
        <Card className="glass-card shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-6 h-6 text-primary" /> Color Picker
            </CardTitle>
            <CardDescription>
              Pick a color and instantly get HEX, RGB, and HSL values. Click any value to copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-40 h-40 rounded-2xl border-4 border-primary shadow-xl transition-all duration-300 hover:scale-105"
                style={{ background: color }}
                aria-label="Pick a color"
              />
              <div className="flex gap-4 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">HEX</span>
                  <Button variant="ghost" className="font-mono text-lg px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow" onClick={() => handleCopy(color, 'HEX')}>
                    {color}
                    <Copy className="w-4 h-4 ml-2 opacity-60" />
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">RGB</span>
                  <Button variant="ghost" className="font-mono text-lg px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow" onClick={() => handleCopy(`rgb(${rgb.join(", ")})`, 'RGB')}>
                    rgb({rgb.join(", ")})
                    <Copy className="w-4 h-4 ml-2 opacity-60" />
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">HSL</span>
                  <Button variant="ghost" className="font-mono text-lg px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow" onClick={() => handleCopy(`hsl(${hsl.join(", ")})`, 'HSL')}>
                    hsl({hsl.join(", ")})
                    <Copy className="w-4 h-4 ml-2 opacity-60" />
                  </Button>
                </div>
              </div>
              <div className="w-full h-20 rounded-xl mt-4 border-2 border-primary shadow-inner flex items-center justify-center text-lg font-bold tracking-wide" style={{ background: color, color: hsl[2] < 60 ? '#fff' : '#222' }}>
                Live Preview
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorPicker;
