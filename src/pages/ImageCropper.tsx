import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";

const ImageCropper = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  const [rect, setRect] = useState<{ start: { x: number; y: number } | null; end: { x: number; y: number } | null; active: boolean }>({ start: null, end: null, active: false });
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImgObj(null);
      setCroppedUrl(null);
      setRect({ start: null, end: null, active: false });
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => setImgObj(img);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setImgObj(null);
      setCroppedUrl(null);
      setRect({ start: null, end: null, active: false });
      alert("Please select an image file.");
    }
  };

  const handleStageMouseDown = (e: any) => {
    if (croppedUrl) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (pointer) {
      setRect({ start: pointer, end: pointer, active: true });
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!rect.active) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (pointer) {
      setRect(r => r.start ? { ...r, end: pointer } : r);
    }
  };

  const handleStageMouseUp = () => {
    if (!rect.active || !rect.start || !rect.end || croppedUrl) return;
    if (!imgObj) return;
    // Calculate scale factors
    const displayWidth = imgObj.width > 320 ? 320 : imgObj.width;
    const displayHeight = imgObj.height > 320 ? 320 : imgObj.height;
    const scaleX = imgObj.width / displayWidth;
    const scaleY = imgObj.height / displayHeight;
    // Map rect to original image coordinates
    const x = Math.min(rect.start.x, rect.end.x) * scaleX;
    const y = Math.min(rect.start.y, rect.end.y) * scaleY;
    const width = Math.abs(rect.end.x - rect.start.x) * scaleX;
    const height = Math.abs(rect.end.y - rect.start.y) * scaleY;
    if (width < 5 || height < 5) {
      setRect({ start: null, end: null, active: false });
      return;
    }
    // Crop
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(imgObj, x, y, width, height, 0, 0, width, height);
      setCroppedUrl(canvas.toDataURL("image/png"));
    }
    setRect({ ...rect, active: false });
  };

  const handleReset = () => {
    setCroppedUrl(null);
    setRect({ start: null, end: null, active: false });
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 flex flex-col items-center" style={{ marginTop: '96px' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">Image Cropper (Basic Rectangle)</h1>
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
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center mb-6">
        {previewUrl && imgObj && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">Draw Rectangle to Crop</div>
            <div className="relative w-full h-64 bg-muted rounded shadow border mx-auto" style={{ maxWidth: 320 }}>
              <Stage
                width={imgObj.width > 320 ? 320 : imgObj.width}
                height={imgObj.height > 320 ? 320 : imgObj.height}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                style={{ background: "#f3f4f6", borderRadius: 12 }}
              >
                <Layer>
                  <KonvaImage
                    image={imgObj}
                    width={imgObj.width > 320 ? 320 : imgObj.width}
                    height={imgObj.height > 320 ? 320 : imgObj.height}
                  />
                  {rect.start && rect.end && (
                    <Rect
                      x={Math.min(rect.start.x, rect.end.x)}
                      y={Math.min(rect.start.y, rect.end.y)}
                      width={Math.abs(rect.end.x - rect.start.x)}
                      height={Math.abs(rect.end.y - rect.start.y)}
                      stroke="#2563eb"
                      strokeWidth={2}
                      dash={[6, 4]}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Click and drag to select crop area.</div>
          </div>
        )}
        {croppedUrl && (
          <div className="flex-1 text-center">
            <div className="mb-2 text-foreground font-medium">Cropped Result</div>
            <img src={croppedUrl} alt="Cropped Preview" className="max-h-64 mx-auto rounded shadow border" />
            <Button
              className="mt-4"
              onClick={() => {
                const a = document.createElement('a');
                a.href = croppedUrl;
                a.download = (imageFile?.name || 'image') + '-cropped.png';
                a.click();
              }}
              variant="secondary"
            >
              Download Cropped
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-4 mb-4 justify-center">
        <Button onClick={handleReset} disabled={!croppedUrl && !rect.start} variant="secondary">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper; 