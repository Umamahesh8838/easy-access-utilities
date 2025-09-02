import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ImageCompressor = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedUrl(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setCompressedUrl(null);
      alert("Please select an image file.");
    }
  };

  const handleCompress = () => {
    if (!imageFile) return;
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
          // Use JPEG for compression, fallback to PNG if original is PNG
          const mimeType = imageFile.type === "image/png" ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(mimeType, quality / 100);
          setCompressedUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = (imageFile?.name || "image") + "-compressed.jpg";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 gap-y-8" style={{ marginTop: '96px' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Image Compressor</h1>
      <div className="flex flex-col items-center mb-6 w-full">
        <input
          type="file"
          accept="image/*"
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
            Choose Image File
          </Button>
          <span className="text-foreground text-sm truncate max-w-xs">
            {imageFile ? imageFile.name : "No file chosen"}
          </span>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-4 justify-center">
        <label htmlFor="quality" className="font-medium">Quality:</label>
        <input
          id="quality"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={e => setQuality(Number(e.target.value))}
          className="w-40"
        />
        <span>{quality}%</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center mb-6">
        {previewUrl && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">Original Image</div>
            <img src={previewUrl} alt="Original Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
        {compressedUrl && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">Compressed Image</div>
            <img src={compressedUrl} alt="Compressed Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-4 justify-center">
        <Button onClick={handleCompress} disabled={!imageFile}>
          Compress Image
        </Button>
        {compressedUrl && (
          <Button onClick={handleDownload} variant="secondary">
            Download Compressed
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageCompressor; 