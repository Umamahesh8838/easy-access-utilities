import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ImageCaptionGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCaption(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setCaption(null);
      alert("Please select an image file.");
    }
  };

  const handleGenerateCaption = () => {
    // Placeholder: In a real app, this would call an AI API
    setCaption("A placeholder caption for the uploaded image. (AI integration needed)");
  };

  const handleCopy = () => {
    if (!caption) return;
    navigator.clipboard.writeText(caption);
    toast({ title: 'Copied!', description: 'Caption copied to clipboard.', duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image Caption Generator</h1>
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
              alt="To caption"
              className="max-h-64 mx-auto rounded shadow"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleGenerateCaption} disabled={!previewUrl}>
            Generate Caption
          </Button>
        </div>
        {caption && (
          <div className="mb-4 text-center">
            <label className="block mb-2 text-foreground font-medium">Generated Caption:</label>
            <textarea
              className="w-full h-24 p-2 border rounded text-base text-foreground bg-muted scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/60 scrollbar-track-muted/30 focus:scrollbar-thumb-primary/80"
              value={caption}
              readOnly
              style={{ resize: 'vertical' }}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleCopy} variant="secondary">
                Copy to Clipboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              This is a placeholder. AI-powered captioning will be available in a future update.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCaptionGenerator; 