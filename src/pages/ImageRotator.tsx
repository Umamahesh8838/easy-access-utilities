import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const ImageRotator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState<number>(0);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRotatedUrl(null);
      setAngle(0);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setRotatedUrl(null);
      setAngle(0);
      alert("Please select an image file.");
    }
  };

  const handleRotate = (finalAngle?: number) => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const radians = ((finalAngle ?? angle) * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const newWidth = Math.round(width * cos + height * sin);
    const newHeight = Math.round(width * sin + height * cos);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.save();
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      ctx.drawImage(img, -width / 2, -height / 2);
      ctx.restore();
      setRotatedUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleDownload = () => {
    if (!rotatedUrl) return;
    const a = document.createElement("a");
    a.href = rotatedUrl;
    a.download = (imageFile?.name || "image") + `-rotated-${angle}.png`;
    a.click();
  };

  // --- Drag to rotate logic ---
  const getAngleFromCenter = (e: React.MouseEvent | React.TouchEvent) => {
    if (!imgRef.current) return 0;
    const rect = imgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return 0;
    }
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartAngle(angle);
    setDragStartPos({
      x: 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX,
      y: 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY,
    });
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !imgRef.current) return;
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    } else {
      return;
    }
    const rect = imgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const startRect = dragStartPos;
    if (startRect) {
      const startDx = startRect.x - centerX;
      const startDy = startRect.y - centerY;
      const startAngle = (Math.atan2(startDy, startDx) * 180) / Math.PI;
      let delta = newAngle - startAngle;
      let updated = dragStartAngle + delta;
      // Normalize angle
      if (updated > 180) updated -= 360;
      if (updated < -180) updated += 360;
      setAngle(updated);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      handleRotate();
    }
  };

  // Attach/detach global listeners for drag
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
    // eslint-disable-next-line
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Rotator</h1>
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
          <div className="mb-4 flex flex-col md:flex-row gap-6 justify-center items-start select-none">
            <div className="flex-1 text-center">
              <img
                src={previewUrl}
                alt="To rotate"
                ref={imgRef}
                className="max-h-64 mx-auto rounded shadow"
                style={{ maxWidth: "100%", cursor: isDragging ? 'grabbing' : 'grab', transform: `rotate(${angle}deg)` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                draggable={false}
              />
              <div className="mt-2 text-sm text-muted-foreground">Drag the image to rotate</div>
              <div className="mt-1 text-xs text-muted-foreground">Original</div>
            </div>
            {rotatedUrl && (
              <div className="flex-1 text-center">
                <img src={rotatedUrl} alt="Rotated Preview" className="max-h-64 mx-auto rounded shadow border" />
                <div className="mt-2 text-xs text-muted-foreground">Rotated</div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={() => handleRotate()} disabled={!previewUrl}>
            Apply Rotation
          </Button>
          {rotatedUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download Rotated
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageRotator; 