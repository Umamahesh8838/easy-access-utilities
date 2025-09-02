import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function convertStrokesToFills(svgText: string): string {
  // This is a simple approach: for each <path> with stroke, copy stroke color to fill and remove stroke
  return svgText.replace(/<path([^>]*)stroke="([^"]+)"([^>]*)>/g, (match, before, color, after) => {
    // If already has fill, skip
    if (/fill="[^"]+"/.test(match)) return match;
    return `<path${before}fill="${color}"${after}>`;
  });
}

const SvgStrokeToFill = () => {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [convertedSvg, setConvertedSvg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      setSvgFile(file);
      setConvertedSvg(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSvgText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setSvgFile(null);
      setSvgText(null);
      setConvertedSvg(null);
      alert("Please select an SVG file.");
    }
  };

  const handleConvert = () => {
    if (!svgText) return;
    const converted = convertStrokesToFills(svgText);
    setConvertedSvg(converted);
  };

  const handleDownload = () => {
    if (!convertedSvg) return;
    const blob = new Blob([convertedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (svgFile?.name || "image") + "-stroke-to-fill.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-4xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">SVG Stroke to Fill Converter</h1>
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
          <div className="mb-4 w-full">
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
              <div className="flex-1 text-center">
                <div className="mb-2 text-foreground">Original SVG Preview:</div>
                <div
                  className="border rounded bg-white inline-block mb-4"
                  style={{ width: 320, height: 320, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: svgText }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Original</div>
              </div>
              {convertedSvg && (
                <div className="flex-1 text-center">
                  <div className="mb-2 text-foreground">Converted SVG Preview:</div>
                  <div
                    className="border rounded bg-white inline-block"
                    style={{ width: 320, height: 320, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <div
                      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: convertedSvg }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Converted</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleConvert} disabled={!svgText}>
            Convert Strokes to Fills
          </Button>
          {convertedSvg && (
            <Button onClick={handleDownload} variant="secondary">
              Download SVG
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SvgStrokeToFill; 