import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


function generateFaviconSVG(color: string) {
  return `<svg width='64' height='64' viewBox='0 0 64 64' fill='${color}' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' r='28'/></svg>`;
}

const SIZES = [16, 32, 48, 64, 128];

const FaviconGenerator = () => {

  const [color, setColor] = useState("#3498db");
  const [image, setImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<{name: string, blob: Blob}[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate SVG if no image uploaded
  const svg = generateFaviconSVG(color);

  // Handle file upload
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target?.result as string);
      setPreviewUrl(ev.target?.result as string);
    };
    if (file.type.startsWith('image/svg')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // Generate PNGs from SVG or image
  const handleGenerate = async () => {
    let imgSrc = image;
    if (!imgSrc) {
      // Use SVG string as data URL
      imgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      setPreviewUrl(imgSrc);
    }
    const results: {name: string, blob: Blob}[] = [];
    for (const size of SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>(resolve => {
        img.onload = () => {
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          resolve();
        };
        img.src = imgSrc!;
      });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
      if (blob) results.push({ name: `favicon-${size}x${size}.png`, blob });
    }
    setFiles(results);
    toast({ title: "Generated!", description: "PNG favicon files are ready to download." });
  };

  // Download all as zip
  const handleDownloadZip = async () => {
    // Use JSZip if available, else download individually
    // @ts-ignore
    if (window.JSZip) {
      // @ts-ignore
      const zip = new window.JSZip();
      for (const f of files) {
        zip.file(f.name, f.blob);
      }
      // Add example favicon.html
      const html = `<!DOCTYPE html><html><head><title>Favicon Example</title>\n<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">\n<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">\n<link rel="icon" type="image/png" sizes="64x64" href="favicon-64x64.png">\n<link rel="icon" type="image/png" sizes="128x128" href="favicon-128x128.png">\n</head><body><h1>Favicon Example</h1></body></html>`;
      zip.file('favicon.html', html);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicons.zip';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Download individually
      for (const f of files) {
        const url = URL.createObjectURL(f.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  // Browser tab preview
  const previewFavicon = files.find(f => f.name === 'favicon-32x32.png');

  const handleCopy = () => {
    navigator.clipboard.writeText(svg);
    toast({ title: "Copied!", description: "Favicon SVG code copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Favicon Generator</CardTitle>
            <CardDescription>
              Generate a simple SVG favicon. Pick a color and copy the SVG code!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 items-center w-full">
              {/* Browser tab preview */}
              <div className="w-full flex flex-col items-center mb-4">
                <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-t px-4 py-2 w-64">
                  <img src={previewFavicon ? URL.createObjectURL(previewFavicon.blob) : previewUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(svg))} alt="favicon" className="w-5 h-5 mr-2" style={{ borderRadius: 4 }} />
                  <span className="text-xs text-muted-foreground">example.com - Favicon Preview</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label className="font-mono text-xs text-muted-foreground">Upload PNG, JPG, or SVG</label>
                <input type="file" accept=".png,.jpg,.jpeg,.svg" ref={fileInputRef} onChange={handleFile} />
                <div className="flex gap-4 items-center mt-2">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-full border-2 border-muted shadow" aria-label="Pick favicon color" />
                  <Button onClick={() => setImage(null)} variant="outline" size="sm">Reset</Button>
                </div>
              </div>
              <Button onClick={handleGenerate} variant="default" className="w-full mt-2">Generate Favicons</Button>
              <div className="flex flex-wrap gap-2 mt-4 w-full">
                {files.map(f => (
                  <div key={f.name} className="flex flex-col items-center">
                    <img src={URL.createObjectURL(f.blob)} alt={f.name} width={32} height={32} style={{ border: '1px solid #ccc', borderRadius: 4 }} />
                    <span className="text-xs mt-1">{f.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 w-full">
                <Button onClick={handleCopy} variant="ghost" className="flex-1 flex items-center justify-center" aria-label="Copy favicon SVG">
                  <Copy className="w-4 h-4 mr-2" /> Copy SVG
                </Button>
                <Button onClick={handleDownloadZip} variant="outline" className="flex-1">Download All (.zip)</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaviconGenerator;
