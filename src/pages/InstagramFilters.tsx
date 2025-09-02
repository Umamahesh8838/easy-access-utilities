import { useRef, useState } from "react";
import { Slider as UISlider } from "@/components/ui/slider";
import { Slider } from "@/components/ui/slider";
import { Download, Copy, Eye, EyeOff } from "lucide-react";
import { getCroppedImg } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MAX_SIZE_MB = 30;
const ACCEPTED = ".jpg,.jpeg,.png,.webp";

const FILTER_PRESETS = [
  { name: "Normal", filter: "none" },
  { name: "Clarendon", filter: "contrast(1.2) saturate(1.35) brightness(1.05)" },
  { name: "Gingham", filter: "contrast(1.1) brightness(1.05) sepia(0.04)" },
  { name: "Moon", filter: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Lark", filter: "contrast(1.05) brightness(1.1) saturate(1.12)" },
  { name: "Reyes", filter: "brightness(1.15) sepia(0.22)" },
  { name: "Juno", filter: "hue-rotate(-10deg) contrast(1.15) saturate(1.4)" },
  { name: "Slumber", filter: "brightness(1.05) saturate(0.66) sepia(0.2)" },
];

const InstagramFilters = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [controls, setControls] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    sepia: 0,
    grayscale: 0,
    blur: 0,
  });
  // Remove crop/zoom/rotation state
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError("File too large (max 30MB)");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setError(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
      }
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Compose CSS filter string
  const getFilter = () => {
    const preset = FILTER_PRESETS[selectedPreset]?.filter || "none";
    const custom = `brightness(${controls.brightness}) contrast(${controls.contrast}) saturate(${controls.saturation}) sepia(${controls.sepia}) grayscale(${controls.grayscale}) blur(${controls.blur}px)`;
    return preset === "none" ? custom : `${preset} ${custom}`;
  };

  // Helper to get filtered image as dataURL (no crop/rotate)
  const getTransformedImage = async () => {
    if (!imageUrl) return null;
    const img = document.createElement("img");
    img.src = imageUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.filter = getFilter();
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  // Export/copy helpers
  const handleDownload = async () => {
    const dataUrl = await getTransformedImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "instagram-filtered.jpg";
    a.click();
  };

  const handleCopy = async () => {
    const dataUrl = await getTransformedImage();
    if (!dataUrl) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob })
      ]);
      toast({ title: "Copied image to clipboard!" });
    } catch {
      toast({ title: "Copy failed", description: "Try downloading instead." });
    }
  };

  // Crop complete
  // Removed crop complete handler (no cropping)

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-none bg-gradient-to-br from-background to-muted/60 dark:from-background dark:to-muted/80">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Instagram Filters</CardTitle>
            <CardDescription>
              Privacy-first, in-browser photo editor with Instagram-style presets. No upload, all processing in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col gap-6 items-center w-full"
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onPaste={onPaste}
              tabIndex={0}
              aria-label="Upload area"
            >
              {!imageUrl ? (
                <>
                  <div className="w-full flex flex-col items-center gap-2 py-8">
                    <div className="w-48 h-48 rounded-xl border-2 border-dashed border-muted flex items-center justify-center bg-white/60 dark:bg-muted/40">
                      <span className="text-muted-foreground text-center">Drag & drop, paste, or <Button variant='link' onClick={() => fileInput.current?.click()}>browse</Button></span>
                    </div>
                    <input
                      type="file"
                      accept={ACCEPTED}
                      ref={fileInput}
                      onChange={onFileChange}
                      className="hidden"
                    />
                    <div className="text-xs text-muted-foreground mt-2">JPG, PNG, or WebP, up to 30MB</div>
                    {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  {/* Before/After toggle */}
                  <div className="flex gap-2 items-center mb-2">
                    <Button size="icon" variant="ghost" aria-label={showBefore ? "Show after" : "Show before"} onClick={() => setShowBefore(v => !v)}>
                      {showBefore ? <EyeOff /> : <Eye />}
                    </Button>
                    <span className="text-sm text-muted-foreground">{showBefore ? "Before" : "After"} Preview</span>
                  </div>
                  {/* Simple preview only, no crop/rotate */}
                  <div className="w-full flex flex-col items-center mt-4">
                    <div className="mb-2 text-foreground font-medium">Preview</div>
                    <div className="rounded-xl border bg-white dark:bg-muted shadow p-2">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Live preview"
                          style={{
                            maxWidth: 240,
                            maxHeight: 240,
                            objectFit: 'contain',
                            filter: showBefore ? 'none' : getFilter()
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Presets */}
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {FILTER_PRESETS.map((preset, i) => (
                      <Button key={preset.name} size="sm" variant={selectedPreset === i ? "default" : "outline"} onClick={() => setSelectedPreset(i)} aria-pressed={selectedPreset === i} aria-label={preset.name}>{preset.name}</Button>
                    ))}
                  </div>
                  {/* Fine controls */}
                  <div className="w-full flex flex-col gap-2 mt-4">
                    <label className="text-xs">Brightness
                      <Slider min={0.5} max={2} step={0.01} value={[controls.brightness]} onValueChange={([v]) => setControls(c => ({ ...c, brightness: v }))} aria-label="Brightness" />
                    </label>
                    <label className="text-xs">Contrast
                      <Slider min={0.5} max={2} step={0.01} value={[controls.contrast]} onValueChange={([v]) => setControls(c => ({ ...c, contrast: v }))} aria-label="Contrast" />
                    </label>
                    <label className="text-xs">Saturation
                      <Slider min={0} max={2} step={0.01} value={[controls.saturation]} onValueChange={([v]) => setControls(c => ({ ...c, saturation: v }))} aria-label="Saturation" />
                    </label>
                    <label className="text-xs">Sepia
                      <Slider min={0} max={1} step={0.01} value={[controls.sepia]} onValueChange={([v]) => setControls(c => ({ ...c, sepia: v }))} aria-label="Sepia" />
                    </label>
                    <label className="text-xs">Grayscale
                      <Slider min={0} max={1} step={0.01} value={[controls.grayscale]} onValueChange={([v]) => setControls(c => ({ ...c, grayscale: v }))} aria-label="Grayscale" />
                    </label>
                    <label className="text-xs">Blur
                      <Slider min={0} max={10} step={0.1} value={[controls.blur]} onValueChange={([v]) => setControls(c => ({ ...c, blur: v }))} aria-label="Blur" />
                    </label>
                  </div>
                  {/* Crop/canvas tools */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => setImageUrl(null)}>Remove</Button>
                  </div>
                  {/* Export options */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="default" onClick={handleDownload} aria-label="Download filtered image"><Download className="w-4 h-4 mr-1" />Download</Button>
                    <Button size="sm" variant="outline" onClick={handleCopy} aria-label="Copy filtered image"><Copy className="w-4 h-4 mr-1" />Copy</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramFilters;
