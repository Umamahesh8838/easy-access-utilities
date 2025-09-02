import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ImageToBase64 = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setBase64(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBase64(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setBase64(null);
      alert("Please select an image file.");
    }
  };

  const handleCopy = () => {
    if (!base64) return;
    navigator.clipboard.writeText(base64);
    toast({ title: 'Copied!', description: 'Base64 string copied to clipboard.', duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Image to Base64 Converter</h1>
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
              alt="To convert"
              className="max-h-64 mx-auto rounded shadow"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        {base64 && (
          <div className="mb-4">
            <label className="block mb-2 text-foreground font-medium">Base64 String:</label>
            <textarea
              className="w-full h-32 p-2 border rounded text-xs text-foreground bg-muted scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/60 scrollbar-track-muted/30 focus:scrollbar-thumb-primary/80"
              value={base64}
              readOnly
              style={{ resize: 'vertical' }}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleCopy} variant="secondary">
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToBase64; 