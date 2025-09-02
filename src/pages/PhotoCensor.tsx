import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const PhotoCensor = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [censoredUrl, setCensoredUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [method, setMethod] = useState<'blur' | 'pixelate'>('blur');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCensoredUrl(null);
      setRect(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setCensoredUrl(null);
      setRect(null);
      alert("Please select an image file.");
    }
  };

  const handleCensor = () => {
    if (!imgRef.current || !rect) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      if (method === 'blur') {
        ctx.save();
        ctx.filter = "blur(12px)";
        ctx.drawImage(
          img,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          rect.x,
          rect.y,
          rect.width,
          rect.height
        );
        ctx.restore();
      } else if (method === 'pixelate') {
        // Pixelate effect
        const pixelSize = 12;
        // Get the image data for the selected area
        const imageData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
        for (let y = 0; y < rect.height; y += pixelSize) {
          for (let x = 0; x < rect.width; x += pixelSize) {
            const i = (y * rect.width + x) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            for (let dy = 0; dy < pixelSize; dy++) {
              for (let dx = 0; dx < pixelSize; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < rect.width && ny < rect.height) {
                  const ni = (ny * rect.width + nx) * 4;
                  imageData.data[ni] = r;
                  imageData.data[ni + 1] = g;
                  imageData.data[ni + 2] = b;
                  imageData.data[ni + 3] = a;
                }
              }
            }
          }
        }
        ctx.putImageData(imageData, rect.x, rect.y);
      }
      setCensoredUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleDownload = () => {
    if (!censoredUrl) return;
    const a = document.createElement("a");
    a.href = censoredUrl;
    a.download = (imageFile?.name || "image") + "-censored.png";
    a.click();
  };

  // --- Area selection logic ---
  const getImageCoords = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * imgRef.current.naturalWidth);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * imgRef.current.naturalHeight);
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const start = getImageCoords(e);
    setDragStart(start);
    setDragCurrent(start);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (!dragStart) return;
    setDragCurrent(getImageCoords(e));
  };

  const handleMouseUp = () => {
    if (!dragStart || !dragCurrent) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    // Calculate rectangle from dragStart to dragCurrent
    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragStart.x - dragCurrent.x);
    const height = Math.abs(dragStart.y - dragCurrent.y);
    setRect({ x, y, width, height });
    setDragStart(null);
    setDragCurrent(null);
  };

  // Calculate overlay rectangle for preview
  let overlayRect = null;
  if (dragStart && dragCurrent) {
    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragStart.x - dragCurrent.x);
    const height = Math.abs(dragStart.y - dragCurrent.y);
    overlayRect = { x, y, width, height };
  } else if (rect) {
    overlayRect = rect;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Photo Censor</h1>
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
        <div className="flex gap-2 mb-4 justify-center">
          <Button variant={method === 'blur' ? 'default' : 'outline'} onClick={() => setMethod('blur')}>
            Blur
          </Button>
          <Button variant={method === 'pixelate' ? 'default' : 'outline'} onClick={() => setMethod('pixelate')}>
            Pixelate
          </Button>
        </div>
        {previewUrl && (
          <div className="mb-4 flex flex-col md:flex-row gap-8 justify-center items-start select-none">
            <div className="flex-1 text-center">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={previewUrl}
                  alt="To censor"
                  ref={imgRef}
                  className="max-h-64 mx-auto rounded shadow"
                  style={{ maxWidth: "100%", cursor: 'crosshair' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  draggable={false}
                />
                {overlayRect && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(overlayRect.x / (imgRef.current?.naturalWidth || 1)) * 100}%`,
                      top: `${(overlayRect.y / (imgRef.current?.naturalHeight || 1)) * 100}%`,
                      width: `${(overlayRect.width / (imgRef.current?.naturalWidth || 1)) * 100}%`,
                      height: `${(overlayRect.height / (imgRef.current?.naturalHeight || 1)) * 100}%`,
                      border: '2px dashed #f59e42',
                      background: 'rgba(245, 158, 66, 0.15)',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Click and drag to select the area to censor</div>
              <div className="mt-2 text-xs text-muted-foreground">Original</div>
            </div>
            {censoredUrl && (
              <div className="flex-1 text-center">
                <img src={censoredUrl} alt="Censored Preview" className="max-h-64 mx-auto rounded shadow border" />
                <div className="mt-2 text-xs text-muted-foreground">Censored</div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleCensor} disabled={!previewUrl || !rect}>
            Censor Area
          </Button>
          {censoredUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download Censored
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCensor; 