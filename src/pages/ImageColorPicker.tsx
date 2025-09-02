import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const MAG_SIZE = 9; // 9x9 pixels
const MAG_SCALE = 12; // scale up each pixel

const ImageColorPicker = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [magUrl, setMagUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPickedColor(null);
      setMagUrl(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setPickedColor(null);
      setMagUrl(null);
      alert("Please select an image file.");
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(x, y, 1, 1).data;
    setPickedColor({ r: data[0], g: data[1], b: data[2] });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * img.naturalHeight);
    setHoverPos({ x, y });
    // Magnifier logic
    const magCanvas = document.createElement("canvas");
    magCanvas.width = MAG_SIZE;
    magCanvas.height = MAG_SIZE;
    const ctx = magCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      img,
      x - Math.floor(MAG_SIZE / 2),
      y - Math.floor(MAG_SIZE / 2),
      MAG_SIZE,
      MAG_SIZE,
      0,
      0,
      MAG_SIZE,
      MAG_SIZE
    );
    // Draw highlight border for center pixel
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.floor(MAG_SIZE / 2) - 0.5,
      Math.floor(MAG_SIZE / 2) - 0.5,
      1,
      1
    );
    setMagUrl(magCanvas.toDataURL());
  };

  const handleImageMouseLeave = () => {
    setHoverPos(null);
    setMagUrl(null);
  };

  const rgbString = pickedColor ? `rgb(${pickedColor.r}, ${pickedColor.g}, ${pickedColor.b})` : "";
  const hexString = pickedColor ? `#${((1 << 24) + (pickedColor.r << 16) + (pickedColor.g << 8) + pickedColor.b).toString(16).slice(1)}` : "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Color Picker</h1>
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
              alt="To pick color"
              ref={imgRef}
              className="max-h-64 mx-auto rounded shadow cursor-crosshair"
              style={{ maxWidth: "100%" }}
              onClick={handleImageClick}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              title="Click anywhere on the image to pick a color"
            />
            {magUrl && hoverPos && (
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${((hoverPos.x / (imgRef.current?.naturalWidth || 1)) * 100).toFixed(2)}% + 24px)` ,
                  top: `calc(${((hoverPos.y / (imgRef.current?.naturalHeight || 1)) * 100).toFixed(2)}% - 24px)` ,
                  zIndex: 10,
                  pointerEvents: 'none',
                  border: '2px solid #888',
                  background: '#222',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  width: MAG_SIZE * MAG_SCALE,
                  height: MAG_SIZE * MAG_SCALE,
                  overflow: 'hidden',
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <img
                  src={magUrl}
                  alt="Magnifier"
                  style={{
                    width: MAG_SIZE * MAG_SCALE,
                    height: MAG_SIZE * MAG_SCALE,
                    imageRendering: 'pixelated',
                    display: 'block',
                  }}
                />
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">Click anywhere on the image to pick a color</div>
          </div>
        )}
        {pickedColor && (
          <div className="text-center mt-4 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full border border-border shadow" style={{ background: rgbString }} />
            <div className="text-foreground font-mono">{hexString}</div>
            <div className="text-foreground font-mono">{rgbString}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageColorPicker; 