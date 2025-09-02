import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ImageResizer = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResizedUrl(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setResizedUrl(null);
      alert("Please select an image file.");
    }
  };

  const handleResize = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      setResizedUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleDownload = () => {
    if (!resizedUrl) return;
    const a = document.createElement("a");
    a.href = resizedUrl;
    a.download = (imageFile?.name || "image") + `-resized-${dimensions.width}x${dimensions.height}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Resizer</h1>
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
          <div className="mb-4 flex flex-col md:flex-row gap-8 justify-center items-start">
            <div className="flex-1 text-center">
              <img
                src={previewUrl}
                alt="To resize"
                ref={imgRef}
                className="max-h-64 mx-auto rounded shadow"
                style={{ maxWidth: "100%" }}
              />
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <span>Width:</span>
                    <Input
                      type="number"
                      value={dimensions.width}
                      min={1}
                      max={imgRef.current?.naturalWidth || 2000}
                      onChange={e => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                      className="w-24"
                    />
                    <span>px</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <span>Height:</span>
                    <Input
                      type="number"
                      value={dimensions.height}
                      min={1}
                      max={imgRef.current?.naturalHeight || 2000}
                      onChange={e => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                      className="w-24"
                    />
                    <span>px</span>
                  </label>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Original</div>
            </div>
            {resizedUrl && (
              <div className="flex-1 text-center">
                <img src={resizedUrl} alt="Resized Preview" className="max-h-64 mx-auto rounded shadow border" />
                <div className="mt-2 text-xs text-muted-foreground">Resized</div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleResize} disabled={!previewUrl}>
            Resize Image
          </Button>
          {resizedUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download Resized
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageResizer; 