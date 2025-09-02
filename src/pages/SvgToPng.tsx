import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SvgToPng = () => {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      setSvgFile(file);
      setPngUrl(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSvgText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setSvgFile(null);
      setSvgText(null);
      setPngUrl(null);
      alert("Please select an SVG file.");
    }
  };

  const handleConvert = () => {
    if (!svgText) return;
    const img = new window.Image();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setPngUrl(canvas.toDataURL("image/png"));
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownload = () => {
    if (!pngUrl) return;
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = (svgFile?.name || "image") + ".png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">SVG to PNG Converter</h1>
        <input
          type="file"
          accept="image/svg+xml"
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="mb-4 flex justify-center">
          <Button onClick={() => inputRef.current?.click()}>
            {svgFile ? "Change SVG" : "Choose SVG"}
          </Button>
        </div>
        {svgText && (
          <div className="mb-4 text-center relative">
            <div className="flex flex-col items-center">
              <div className="mb-2 text-foreground">SVG Preview:</div>
              <div
                className="border rounded bg-white inline-block"
                style={{ maxWidth: 320, maxHeight: 320 }}
                dangerouslySetInnerHTML={{ __html: svgText }}
              />
            </div>
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleConvert} disabled={!svgText}>
            Convert to PNG
          </Button>
          {pngUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download PNG
            </Button>
          )}
        </div>
        {pngUrl && (
          <div className="text-center">
            <img src={pngUrl} alt="PNG Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SvgToPng; 