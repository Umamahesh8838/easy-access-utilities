import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function getAverageColor(img: HTMLImageElement): { r: number; g: number; b: number } {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { r: 0, g: 0, b: 0 };
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

const ImageAverageColor = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [averageColor, setAverageColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAverageColor(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setAverageColor(null);
      alert("Please select an image file.");
    }
  };

  const handleFindAverageColor = () => {
    if (!imgRef.current) return;
    const color = getAverageColor(imgRef.current);
    setAverageColor(color);
  };

  const rgbString = averageColor ? `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})` : "";
  const hexString = averageColor ? `#${((1 << 24) + (averageColor.r << 16) + (averageColor.g << 8) + averageColor.b).toString(16).slice(1)}` : "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Average Color Finder</h1>
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
              alt="To analyze"
              ref={imgRef}
              className="max-h-64 mx-auto rounded shadow"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleFindAverageColor} disabled={!previewUrl}>
            Find Average Color
          </Button>
        </div>
        {averageColor && (
          <div className="text-center mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border border-border shadow" style={{ background: rgbString }} />
              <div className="text-foreground font-mono">{hexString}</div>
              <div className="text-foreground font-mono">{rgbString}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAverageColor; 