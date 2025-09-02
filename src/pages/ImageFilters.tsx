import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const defaultFilters = {
  grayscale: 0,
  sepia: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  invert: 0,
  saturate: 100,
  hueRotate: 0,
};

type Filters = typeof defaultFilters;

const getFilterString = (filters: Filters) =>
  `grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) blur(${filters.blur}px) brightness(${filters.brightness}%) contrast(${filters.contrast}%) invert(${filters.invert}%) saturate(${filters.saturate}%) hue-rotate(${filters.hueRotate}deg)`;

const ImageFilters = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const [filteredUrl, setFilteredUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFilteredUrl(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setFilteredUrl(null);
      alert("Please select an image file.");
    }
  };

  const handleFilterChange = (key: keyof Filters, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.filter = getFilterString(filters);
      ctx.drawImage(img, 0, 0);
      setFilteredUrl(canvas.toDataURL("image/png"));
    }
  };

  const handleDownload = () => {
    if (!filteredUrl) return;
    const a = document.createElement("a");
    a.href = filteredUrl;
    a.download = (imageFile?.name || "image") + "-filtered.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Filters</h1>
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
                alt="To filter"
                ref={imgRef}
                className="max-h-64 mx-auto rounded shadow"
                style={{ maxWidth: "100%", filter: getFilterString(filters) }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-4 items-center w-full max-w-xs mx-auto md:mx-0">
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Grayscale</span>
                  <span className="text-foreground">{filters.grayscale}%</span>
                </label>
                <Slider min={0} max={100} value={[filters.grayscale]} onValueChange={([v]) => handleFilterChange("grayscale", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Sepia</span>
                  <span className="text-foreground">{filters.sepia}%</span>
                </label>
                <Slider min={0} max={100} value={[filters.sepia]} onValueChange={([v]) => handleFilterChange("sepia", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Blur</span>
                  <span className="text-foreground">{filters.blur}px</span>
                </label>
                <Slider min={0} max={20} value={[filters.blur]} onValueChange={([v]) => handleFilterChange("blur", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Brightness</span>
                  <span className="text-foreground">{filters.brightness}%</span>
                </label>
                <Slider min={50} max={200} value={[filters.brightness]} onValueChange={([v]) => handleFilterChange("brightness", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Contrast</span>
                  <span className="text-foreground">{filters.contrast}%</span>
                </label>
                <Slider min={50} max={200} value={[filters.contrast]} onValueChange={([v]) => handleFilterChange("contrast", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Invert</span>
                  <span className="text-foreground">{filters.invert}%</span>
                </label>
                <Slider min={0} max={100} value={[filters.invert]} onValueChange={([v]) => handleFilterChange("invert", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Saturate</span>
                  <span className="text-foreground">{filters.saturate}%</span>
                </label>
                <Slider min={0} max={300} value={[filters.saturate]} onValueChange={([v]) => handleFilterChange("saturate", v)} />
              </div>
              <div className="w-full">
                <label className="flex items-center justify-between mb-1">
                  <span>Hue Rotate</span>
                  <span className="text-foreground">{filters.hueRotate}°</span>
                </label>
                <Slider min={0} max={360} value={[filters.hueRotate]} onValueChange={([v]) => handleFilterChange("hueRotate", v)} />
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleApplyFilters} disabled={!previewUrl}>
            Apply Filters
          </Button>
          {filteredUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download Filtered
            </Button>
          )}
        </div>
        {filteredUrl && (
          <div className="text-center">
            <img src={filteredUrl} alt="Filtered Preview" className="max-h-64 mx-auto rounded shadow border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageFilters; 