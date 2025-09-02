import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import JSZip from "jszip";
import { Input } from "@/components/ui/input";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface SplitResult {
  name: string;
  url: string;
}

const PdfSplit = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'range' | 'every'>('range');
  const [pageRange, setPageRange] = useState<string>("");
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate thumbnails for all pages
  const generateThumbnails = async (file: File) => {
    setProgress(0);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
    setNumPages(pdf.numPages);
    const thumbs: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.25 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      thumbs.push(canvas.toDataURL());
      setProgress(Math.round((i / pdf.numPages) * 100));
    }
    setThumbnails(thumbs);
    setProgress(100);
  };

  // Handle file input or drop
  const handleFiles = async (files: FileList | File[]) => {
    const pdf = Array.from(files).find(f => f.type === "application/pdf");
    if (!pdf) return;
    setPdfFile(pdf);
    setZipUrl(null);
    setSplitResults([]);
    setPageRange("");
    await generateThumbnails(pdf);
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

  // Parse page range string (e.g., "1-3,5,8-10")
  const parsePageRange = (range: string, max: number): number[] => {
    const result: number[] = [];
    range.split(',').forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end && i <= max; i++) result.push(i);
      } else {
        const n = Number(part);
        if (n >= 1 && n <= max) result.push(n);
      }
    });
    return Array.from(new Set(result));
  };

  // Split logic
  const handleSplit = async () => {
    if (!pdfFile) return;
    setIsSplitting(true);
    setZipUrl(null);
    setSplitResults([]);
    setProgress(0);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      let pageSets: number[][] = [];
      let baseName = pdfFile.name.replace(/\.pdf$/i, "");
      if (splitMode === 'every') {
        pageSets = Array.from({ length: srcPdf.getPageCount() }, (_, i) => [i]);
      } else if (splitMode === 'range') {
        let pages: number[] = [];
        if (pageRange.trim()) {
          pages = parsePageRange(pageRange, srcPdf.getPageCount()).map(n => n - 1);
        }
        if (pages.length === 0) {
          toast({ title: "No pages selected", description: "Enter pages to extract.", duration: 2000 });
          setIsSplitting(false);
          setProgress(0);
          return;
        }
        pageSets = [pages];
      }
      // Output: one file per set, or one file if only one set
      if (pageSets.length === 1) {
        const pdfDoc = await PDFDocument.create();
        const copiedPages = await pdfDoc.copyPages(srcPdf, pageSets[0]);
        copiedPages.forEach(page => pdfDoc.addPage(page));
        const pdfBytes = await pdfDoc.save();
        const filename = `${baseName}_split.pdf`;
        const url = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
        setSplitResults([{ name: filename, url }]);
      } else {
        const zip = new JSZip();
        const results: SplitResult[] = [];
        for (let i = 0; i < pageSets.length; i++) {
          const pdfDoc = await PDFDocument.create();
          const copiedPages = await pdfDoc.copyPages(srcPdf, pageSets[i]);
          copiedPages.forEach(page => pdfDoc.addPage(page));
          const pdfBytes = await pdfDoc.save();
          const filename = `${baseName}_page_${pageSets[i][0] + 1}.pdf`;
          zip.file(filename, pdfBytes);
          results.push({ name: filename, url: "" }); // url will be set after zip
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        setZipUrl(zipUrl);
        setSplitResults(results);
      }
      toast({ title: "Success!", description: "PDF split complete.", duration: 2000 });
      setProgress(0);
    } catch (err) {
      toast({ title: "Error", description: "Failed to split PDF.", duration: 2000 });
      setProgress(0);
    } finally {
      setIsSplitting(false);
    }
  };

  // Reset all state
  const handleReset = () => {
    setPdfFile(null);
    setNumPages(0);
    setThumbnails([]);
    setSplitMode('range');
    setPageRange("");
    setSplitResults([]);
    setZipUrl(null);
    setIsSplitting(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Split PDF</h1>
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
              className="mb-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors border-border bg-muted/50"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <span className="text-lg text-muted-foreground mb-2">Upload PDF</span>
              <span className="text-xs text-muted-foreground">Drag & drop or click to select a PDF file</span>
            </div>
          </>
        )}
        {pdfFile && (
          <>
            {progress > 0 && progress < 100 && (
              <div className="w-full flex flex-col items-center mb-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Processing PDF... {progress}%</div>
              </div>
            )}
            <div className="mb-4 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 text-foreground font-medium">{pdfFile.name}</div>
                <div className="text-muted-foreground text-sm">Total pages: <span className="font-bold">{numPages}</span></div>
              </div>
              <Button variant="outline" onClick={handleReset}>Reset / Upload Another PDF</Button>
            </div>
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
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-center">
              <label className="flex items-center gap-2">
                <input type="radio" checked={splitMode === 'range'} onChange={() => setSplitMode('range')} />
                <span>Split by Page Range</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={splitMode === 'every'} onChange={() => setSplitMode('every')} />
                <span>Split Every Page</span>
              </label>
              {splitMode === 'range' && (
                <Input
                  type="text"
                  placeholder="e.g. 1-3,5,7"
                  value={pageRange}
                  onChange={e => setPageRange(e.target.value)}
                  className="ml-2 w-40 text-sm"
                />
              )}
            </div>
            <div className="flex gap-4 mb-4 justify-center">
              <Button onClick={handleSplit} disabled={isSplitting} loading={isSplitting}>
                Start Split
              </Button>
            </div>
            {splitResults.length === 1 && splitResults[0].url && (
              <div className="text-center mt-4">
                <Button asChild variant="secondary">
                  <a href={splitResults[0].url} download={splitResults[0].name}>
                    Download PDF
                  </a>
                </Button>
              </div>
            )}
            {zipUrl && (
              <div className="text-center mt-4">
                <Button asChild variant="secondary">
                  <a href={zipUrl} download={pdfFile.name.replace(/\.pdf$/i, "") + "_split.zip"}>
                    Download ZIP
                  </a>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PdfSplit; 