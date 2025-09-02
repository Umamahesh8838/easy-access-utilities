import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function rgbaToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

const RgbaToHexConverter = () => {
  const [r, setR] = useState(52);
  const [g, setG] = useState(152);
  const [b, setB] = useState(219);
  const hex = rgbaToHex(r, g, b);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    toast({ title: "Copied!", description: `HEX value copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">RGBA to HEX Converter</CardTitle>
            <CardDescription>
              Instantly convert RGBA color values to HEX format. Enjoy a live preview and easy copy!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 items-center">
              <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-xl border-2 border-muted shadow-lg mb-2" style={{ background: hex }} />
                  <span className="font-mono text-xs text-muted-foreground">Live Preview</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Input type="number" min={0} max={255} value={r} onChange={e => setR(Number(e.target.value))} className="w-20 text-lg" placeholder="R" aria-label="Red" />
                    <Input type="number" min={0} max={255} value={g} onChange={e => setG(Number(e.target.value))} className="w-20 text-lg" placeholder="G" aria-label="Green" />
                    <Input type="number" min={0} max={255} value={b} onChange={e => setB(Number(e.target.value))} className="w-20 text-lg" placeholder="B" aria-label="Blue" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={hex} readOnly className="font-mono text-lg text-center bg-muted/60 dark:bg-muted/40 border-none w-36" />
                    <Button onClick={handleCopy} variant="ghost" size="icon" className="ml-1" aria-label="Copy HEX">
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RgbaToHexConverter;
