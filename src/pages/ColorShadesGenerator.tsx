import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function getShades(hex: string, count = 10) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = num >> 16, g = (num >> 8) & 255, b = num & 255;
  const shades = [];
  for (let i = 0; i < count; i++) {
    const factor = 1 - i / (count - 1);
    const shade = `#${Math.round(r * factor).toString(16).padStart(2, '0')}${Math.round(g * factor).toString(16).padStart(2, '0')}${Math.round(b * factor).toString(16).padStart(2, '0')}`;
    shades.push(shade);
  }
  return shades;
}

const ColorShadesGenerator = () => {
  const [color, setColor] = useState("#3498db");
  const shades = getShades(color, 10);
  const { toast } = useToast();

  const copyShades = () => {
    navigator.clipboard.writeText(shades.join(", "));
    toast({ title: "Copied!", description: "Shades copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Color Shades Generator</CardTitle>
            <CardDescription>
              Generate a beautiful range of shades for any color. Click a swatch to copy!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-xl border-2 border-muted shadow-lg mb-2" style={{ background: color }} />
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-muted shadow" aria-label="Pick base color" />
                  <span className="font-mono text-xs text-muted-foreground mt-1">Base Color</span>
                </div>
                <div className="flex flex-col gap-4 items-center">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {shades.map((shade, i) => (
                      <button
                        key={i}
                        className="w-12 h-12 rounded-lg border-2 border-muted shadow transition-transform hover:scale-110 focus:outline-none"
                        style={{ background: shade }}
                        title={shade}
                        onClick={() => {
                          navigator.clipboard.writeText(shade);
                          toast({ title: "Copied!", description: `${shade} copied to clipboard.` });
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {shades.map((shade, i) => (
                      <span key={i} className="font-mono text-xs px-2 py-1 rounded bg-muted/60 border text-foreground shadow" style={{ background: i === 0 ? '#fff' : 'inherit' }}>{shade}</span>
                    ))}
                  </div>
                  <Button onClick={copyShades} variant="ghost" className="w-full flex items-center justify-center mt-2" aria-label="Copy all shades">
                    <Copy className="w-4 h-4 mr-2" /> Copy All Shades
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColorShadesGenerator;
