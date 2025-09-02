
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}
function luminance([r, g, b]: number[]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrast(rgb1: number[], rgb2: number[]) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

const ContrastChecker = () => {
  const [color1, setColor1] = useState("#000000");
  const [color2, setColor2] = useState("#ffffff");
  const { toast } = useToast();
  const ratio = contrast(hexToRgb(color1), hexToRgb(color2));
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

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
              <Eye className="w-6 h-6 text-primary" /> Contrast Checker
            </CardTitle>
            <CardDescription>
              Check the contrast ratio between two colors for accessibility. Click a value to copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <div className="flex gap-8 w-full justify-center">
                <div className="flex flex-col items-center gap-2">
                  <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-20 h-20 rounded-2xl border-4 border-primary shadow-xl transition-all duration-300 hover:scale-105" aria-label="Text color" />
                  <Button variant="ghost" className="font-mono text-base px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow" onClick={() => handleCopy(color1, 'Text Color HEX')}>
                    {color1}
                    <Copy className="w-4 h-4 ml-2 opacity-60" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Text Color</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-20 h-20 rounded-2xl border-4 border-primary shadow-xl transition-all duration-300 hover:scale-105" aria-label="Background color" />
                  <Button variant="ghost" className="font-mono text-base px-4 py-2 rounded-lg bg-card/80 hover:bg-primary/20 border border-border shadow" onClick={() => handleCopy(color2, 'Background Color HEX')}>
                    {color2}
                    <Copy className="w-4 h-4 ml-2 opacity-60" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Background</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-lg font-bold">Contrast Ratio: <span className="text-primary">{ratio.toFixed(2)}:1</span></div>
                <div className="flex gap-4 mt-1">
                  <span className={passesAA ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>AA: {passesAA ? "Pass" : "Fail"}</span>
                  <span className={passesAAA ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>AAA: {passesAAA ? "Pass" : "Fail"}</span>
                </div>
                <div className="w-full h-20 mt-4 rounded-xl border-2 border-primary shadow-inner flex items-center justify-center text-lg font-bold tracking-wide" style={{ background: color2, color: color1 }}>
                  Sample Text
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContrastChecker;
