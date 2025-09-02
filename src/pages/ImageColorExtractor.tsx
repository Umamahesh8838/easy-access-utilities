import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function getDominantColors(img: HTMLImageElement, colorCount = 5): { r: number; g: number; b: number }[] {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const colorMap: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Reduce color space for grouping
    const key = `${Math.round(r/32)*32},${Math.round(g/32)*32},${Math.round(b/32)*32}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }
  const sorted = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return { r, g, b };
    });
  return sorted;
}

const ImageColorExtractor = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<{ r: number; g: number; b: number }[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setColors([]);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setColors([]);
      alert("Please select an image file.");
    }
  };

  const handleExtractColors = () => {
    if (!imgRef.current) return;
    const extracted = getDominantColors(imgRef.current, 5);
    setColors(extracted);
  };

  const toHex = (c: { r: number; g: number; b: number }) =>
    `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
  const toRgb = (c: { r: number; g: number; b: number }) =>
    `rgb(${c.r}, ${c.g}, ${c.b})`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Color Extractor</h1>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="mb-4 flex justify-center">
          <Button onClick={() => inputRef.current?.click()}>
            {imageFile ? "Change Image" : "Choose Image"}
          </Button>
        </div>
        {previewUrl && (
          <div className="mb-4 text-center relative">
            <img
              src={previewUrl}
              alt="To extract colors"
              ref={imgRef}
              className="max-h-64 mx-auto rounded shadow"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleExtractColors} disabled={!previewUrl}>
            Extract Colors
          </Button>
        </div>
        {colors.length > 0 && (
          <div className="text-center mt-4 flex flex-wrap gap-4 justify-center">
            {colors.map((color, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border border-border shadow" style={{ background: toRgb(color) }} />
                <div className="text-foreground font-mono text-xs">{toHex(color)}</div>
                <div className="text-foreground font-mono text-xs">{toRgb(color)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageColorExtractor; 