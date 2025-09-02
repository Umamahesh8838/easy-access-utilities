import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const PngToJpg = () => {
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [jpgUrl, setJpgUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/png") {
      setPngFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setJpgUrl(null);
    } else {
      setPngFile(null);
      setPreviewUrl(null);
      setJpgUrl(null);
      alert("Please select a PNG file.");
    }
  };

  const handleConvert = () => {
    if (!pngFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
          setJpgUrl(jpgDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(pngFile);
  };

  const handleDownload = () => {
    if (!jpgUrl) return;
    const a = document.createElement("a");
    a.href = jpgUrl;
    a.download = (pngFile?.name || "image") + ".jpg";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 gap-y-8" style={{ marginTop: '96px' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">PNG to JPG Converter</h1>
      <div className="flex flex-col items-center mb-6 w-full">
        <input
          type="file"
          accept="image/png"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-4 w-full justify-center">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2"
            variant="outline"
          >
            Choose PNG File
          </Button>
          <span className="text-foreground text-sm truncate max-w-xs">
            {pngFile ? pngFile.name : "No file chosen"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center mb-6">
        {previewUrl && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">PNG Preview</div>
            <img src={previewUrl} alt="PNG Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
        {jpgUrl && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">JPG Result</div>
            <img src={jpgUrl} alt="JPG Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-4 justify-center">
        <Button onClick={handleConvert} disabled={!pngFile}>
          Convert to JPG
        </Button>
        {jpgUrl && (
          <Button onClick={handleDownload} variant="secondary">
            Download JPG
          </Button>
        )}
      </div>
    </div>
  );
};

export default PngToJpg; 