import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ScannedPdfConverter = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfName(file.name);
      setText(null);
    } else {
      setPdfFile(null);
      setPdfName(null);
      setText(null);
      alert("Please select a PDF file.");
    }
  };

  const handleConvert = () => {
    // Placeholder: In a real app, this would call an OCR API
    setText("This is a placeholder. OCR (text extraction) from scanned PDFs will be available in a future update.");
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.', duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Scanned PDF Converter</h1>
        <input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="mb-4 flex justify-center">
          <Button onClick={() => inputRef.current?.click()}>
            {pdfFile ? "Change PDF" : "Choose PDF"}
          </Button>
        </div>
        {pdfName && (
          <div className="mb-4 text-center text-foreground">Selected PDF: {pdfName}</div>
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleConvert} disabled={!pdfFile}>
            Convert to Text
          </Button>
        </div>
        {text && (
          <div className="mb-4 text-center">
            <label className="block mb-2 text-foreground font-medium">Extracted Text:</label>
            <textarea
              className="w-full h-24 p-2 border rounded text-base text-foreground bg-muted scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/60 scrollbar-track-muted/30 focus:scrollbar-thumb-primary/80"
              value={text}
              readOnly
              style={{ resize: 'vertical' }}
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleCopy} variant="secondary">
                Copy to Clipboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              This is a placeholder. OCR (text extraction) from scanned PDFs will be available in a future update.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannedPdfConverter; 