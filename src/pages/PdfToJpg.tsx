import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Use local worker for PDF.js
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface JpgResult {
  name: string;
  url: string;
}

const PdfToJpg = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [jpgResults, setJpgResults] = useState<JpgResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate thumbnails and JPGs for all pages
  const generateJpgs = async (file: File) => {
    setProgress(0);
    setNumPages(0);
    setJpgResults([]);
    setThumbnails([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdf.numPages);
      const thumbs: string[] = [];
      const jpgs: JpgResult[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const jpgUrl = canvas.toDataURL("image/jpeg", 0.92);
        thumbs.push(canvas.toDataURL("image/jpeg", 0.5));
        jpgs.push({
          name: `${file.name.replace(/\.pdf$/i, "")}_page_${i}.jpg`,
          url: jpgUrl
        });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setThumbnails(thumbs);
      setJpgResults(jpgs);
      setProgress(100);
      document.getElementById('pdf-to-jpg-error')!.textContent = '';
    } catch (err: any) {
      setProgress(0);
      setNumPages(0);
      setJpgResults([]);
      setThumbnails([]);
      document.getElementById('pdf-to-jpg-error')!.textContent = 'Failed to process PDF. Please ensure the file is a valid PDF.';
      toast({
        title: 'Error',
        description: 'Failed to process PDF. Please ensure the file is a valid PDF.',
        variant: 'destructive',
      });
    }
  };

  // Handle file input or drop
  const handleFiles = async (files: FileList | File[]) => {
    const pdf = Array.from(files).find(f => f.type === "application/pdf");
    if (!pdf) return;
    setPdfFile(pdf);
    setJpgResults([]);
    setThumbnails([]);
    await generateJpgs(pdf);
  };

  // Drag-and-drop file upload
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  // File picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(e.target.files);
    }
  };

  // Reset all state
  const handleReset = () => {
    setPdfFile(null);
    setNumPages(0);
    setThumbnails([]);
    setJpgResults([]);
    setProgress(0);
    setIsProcessing(false);
    setPreviewImage(null);
  };

  // Open image preview
  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  // Close image preview
  const closePreview = () => {
    setPreviewImage(null);
  };

  // Download all JPGs as a ZIP file
  const downloadAllAsZip = async () => {
    if (jpgResults.length === 0) return;
    
    try {
      const zip = new JSZip();
      
      // Convert base64 data URLs to blobs and add to ZIP
      for (const jpg of jpgResults) {
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64Data = jpg.url.split(',')[1];
        zip.file(jpg.name, base64Data, { base64: true });
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${pdfFile?.name.replace(/\.pdf$/i, "") || "converted-images"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: 'Success',
        description: 'All images downloaded as ZIP file.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ZIP file.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">PDF to JPG Converter</h1>
        {!pdfFile && (
          <>
            <input
              type="file"
              accept="application/pdf"
              ref={inputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div
              className="mb-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { inputRef.current?.click(); } }}
              tabIndex={0}
              role="button"
              aria-label="Upload PDF"
              style={{ cursor: 'pointer' }}
            >
              <span className="text-lg text-muted-foreground mb-2">Upload PDF</span>
              <span className="text-xs text-muted-foreground mb-4">Drag & drop or click to select a PDF file</span>
              <Button
                type="button"
                variant="outline"
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                className="px-6 py-2"
              >
                Choose PDF File
              </Button>
            </div>
          </>
        )}
        {pdfFile && (
          <>
            <div className="mb-4 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 text-foreground font-medium">{pdfFile.name}</div>
                <div className="text-muted-foreground text-sm">Total pages: <span className="font-bold">{numPages}</span></div>
              </div>
              <Button variant="outline" onClick={handleReset}>Reset / Upload Another PDF</Button>
            </div>
            {progress > 0 && progress < 100 && (
              <div className="w-full flex flex-col items-center mb-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Processing PDF... {progress}%</div>
              </div>
            )}
            {thumbnails.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                {thumbnails.map((thumb, idx) => (
                  <div key={idx} className="border rounded p-1">
                    <img src={thumb} alt={`Page ${idx + 1}`} className="w-12 h-16 object-contain" />
                    <div className="text-xs text-center text-muted-foreground">{idx + 1}</div>
                  </div>
                ))}
              </div>
            )}
            {jpgResults.length > 0 && (
              <>
                <div className="mb-4 flex flex-wrap gap-4 justify-center">
                  {jpgResults.map((jpg, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openPreview(jpg.url)}
                      >
                        <img src={jpg.url} alt={jpg.name} className="w-24 h-32 object-contain border rounded mb-1" />
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = jpg.url;
                          link.download = jpg.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download JPG
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex justify-center">
                  <Button 
                    onClick={downloadAllAsZip}
                    className="px-6 py-2"
                    variant="default"
                  >
                    📦 Download All as ZIP
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Image Preview Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closePreview}
          >
            <div className="bg-card rounded-lg p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Image Preview</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={closePreview}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="flex justify-center mb-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-w-full max-h-[70vh] object-contain rounded border shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="default"
                  onClick={() => {
                    const jpg = jpgResults.find(j => j.url === previewImage);
                    if (jpg) {
                      const link = document.createElement('a');
                      link.href = jpg.url;
                      link.download = jpg.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  Download This Image
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Error feedback area */}
        <div id="pdf-to-jpg-error" className="mt-2 text-center text-destructive text-sm" style={{ minHeight: 24 }}></div>
      </div>
    </div>
  );
};

export default PdfToJpg; 