
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function randomColor() {
  return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, "0")}`;
}

const AiColorPaletteGenerator = () => {
  const [palette, setPalette] = useState([randomColor(), randomColor(), randomColor(), randomColor(), randomColor()]);
  const { toast } = useToast();

  const generatePalette = () => {
    setPalette([randomColor(), randomColor(), randomColor(), randomColor(), randomColor()]);
  };

  const copyPalette = () => {
    navigator.clipboard.writeText(palette.join(", "));
    toast({ title: "Copied!", description: "Palette copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-xl mx-auto px-4">
        <Card className="glass-card shadow-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" /> AI Color Palette Generator
            </CardTitle>
            <CardDescription>
              Instantly generate a beautiful color palette. Click a color to copy its HEX value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center">
              <div className="flex gap-4 w-full justify-center">
                {palette.map((color, i) => (
                  <button
                    key={i}
                    className="w-20 h-20 rounded-2xl border-4 border-primary shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ background: color }}
                    title={color}
                    onClick={() => {navigator.clipboard.writeText(color); toast({ title: "Copied!", description: `${color} copied to clipboard.` });}}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {palette.map((color, i) => (
                  <span key={i} className="font-mono text-xs px-3 py-1 rounded bg-card/80 border border-border shadow cursor-pointer hover:bg-primary/20 transition-all duration-200" style={{ color }} onClick={() => {navigator.clipboard.writeText(color); toast({ title: "Copied!", description: `${color} copied to clipboard.` });}}>
                    {color}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 w-full mt-4">
                <Button onClick={generatePalette} className="w-1/2">Generate Palette</Button>
                <Button onClick={copyPalette} variant="outline" className="w-1/2 flex items-center justify-center">
                  <Copy className="w-4 h-4 mr-2" /> Copy All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiColorPaletteGenerator;
