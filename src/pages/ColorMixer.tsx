import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function mixColors(hex1: string, hex2: string, ratio: number) {
  let c1 = hex1.replace('#', '');
  let c2 = hex2.replace('#', '');
  if (c1.length === 3) c1 = c1.split('').map(x => x + x).join('');
  if (c2.length === 3) c2 = c2.split('').map(x => x + x).join('');
  const n1 = parseInt(c1, 16);
  const n2 = parseInt(c2, 16);
  const r = Math.round(((n1 >> 16) * ratio + (n2 >> 16) * (1 - ratio)));
  const g = Math.round((((n1 >> 8) & 255) * ratio + ((n2 >> 8) & 255) * (1 - ratio)));
  const b = Math.round(((n1 & 255) * ratio + (n2 & 255) * (1 - ratio)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const ColorMixer = () => {
  const [color1, setColor1] = useState("#3498db");
  const [color2, setColor2] = useState("#e74c3c");
  const [ratio, setRatio] = useState(0.5);
  const mixed = mixColors(color1, color2, ratio);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(mixed);
    toast({ title: "Copied!", description: `Mixed color copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Color Mixer</CardTitle>
            <CardDescription>
              Mix two colors and get the result instantly. Enjoy a live preview and easy copy!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-xl border-2 border-muted shadow-lg mb-2" style={{ background: color1 }} />
                  <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pick first color" />
                  <span className="font-mono text-xs text-muted-foreground mt-1">Color 1</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-xl border-2 border-muted shadow-lg mb-2" style={{ background: color2 }} />
                  <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pick second color" />
                  <span className="font-mono text-xs text-muted-foreground mt-1">Color 2</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl border-2 border-muted shadow-lg mb-2" style={{ background: mixed }} />
                  <span className="font-mono text-xs text-muted-foreground mt-1">Mixed</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={mixed} readOnly className="font-mono text-lg text-center bg-muted/60 dark:bg-muted/40 border-none w-28" />
                    <Button onClick={handleCopy} variant="ghost" size="icon" className="ml-1" aria-label="Copy mixed color">
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-full mt-4">
                <div className="flex gap-2 items-center w-full justify-center">
                  <span className="font-mono text-xs text-muted-foreground">Ratio</span>
                  <Input type="range" min={0} max={1} step={0.01} value={ratio} onChange={e => setRatio(Number(e.target.value))} className="w-48" aria-label="Mix ratio" />
                  <span className="font-mono text-xs text-muted-foreground">{Math.round(ratio * 100)}% {ratio >= 0.5 ? "Color 1" : "Color 2"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorMixer;
