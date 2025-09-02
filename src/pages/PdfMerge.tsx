import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PDFDocument } from "pdf-lib";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
// Set PDF.js workerSrc for Vite compatibility
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface PdfItem {
  id: string;
  file: File;
  thumbnail?: string;
}

const PdfMerge = () => {
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Generate thumbnail for a PDF file
  const generateThumbnail = async (file: File, idx: number, total: number): Promise<string | undefined> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      setProgress(Math.round(((idx + 1) / total) * 100));
      return canvas.toDataURL();
    } catch {
      setProgress(100);
      return undefined;
    }
  };

  // Handle file input or drop
  const handleFiles = async (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter(f => f.type === "application/pdf");
    setProgress(0);
    const items: PdfItem[] = [];
    for (let idx = 0; idx < pdfs.length; idx++) {
      const file = pdfs[idx];
      const thumbnail = await generateThumbnail(file, idx, pdfs.length);
      items.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${idx}-${Math.random()}`,
        file,
        thumbnail
      });
    }
    setPdfItems(items);
    setMergedUrl(null);
    setProgress(100);
  };

  // Drag-and-drop file upload
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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

  // DnD-kit sortable item
  function SortablePdfItem({ id, file, thumbnail, index }: PdfItem & { index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      background: isDragging ? '#f3f4f6' : undefined,
      cursor: 'grab',
    };
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-2 border rounded bg-muted mb-2">
        <div {...listeners} {...attributes} className="cursor-grab select-none px-2 text-xl">☰</div>
        {thumbnail ? (
          <img src={thumbnail} alt="PDF thumbnail" className="w-12 h-16 object-contain border rounded bg-white" />
        ) : (
          <div className="w-12 h-16 flex items-center justify-center border rounded bg-white text-xs text-muted-foreground">No Preview</div>
        )}
        <span className="truncate max-w-xs text-foreground text-sm">{file.name}</span>
      </div>
    );
  }

  // DnD-kit reorder logic
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pdfItems.findIndex(item => item.id === active.id);
      const newIndex = pdfItems.findIndex(item => item.id === over.id);
      setPdfItems(items => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleMerge = async () => {
    if (pdfItems.length < 2) {
      toast({ title: "Select at least two PDFs", description: "You need at least two PDF files to merge.", duration: 2000 });
      return;
    }
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of pdfItems) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      setMergedUrl(URL.createObjectURL(blob));
      toast({ title: "Success!", description: "PDFs merged successfully.", duration: 2000 });
    } catch (err) {
      toast({ title: "Error", description: "Failed to merge PDFs.", duration: 2000 });
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedUrl) return;
    // Create a filename like pdf1_pdf2_pdf3_merged.pdf
    let baseNames = pdfItems.map(item => item.file.name.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]/g, ""));
    let joined = baseNames.join("_");
    // Limit filename length for safety
    if (joined.length > 60) joined = joined.slice(0, 60) + "_etc";
    const filename = `${joined}_merged.pdf`;
    const a = document.createElement("a");
    a.href = mergedUrl;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Merge PDFs</h1>
        <input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
        />
        <div
          className={`mb-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? 'border-primary bg-accent/30' : 'border-border bg-muted/50'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <span className="text-lg text-muted-foreground mb-2">Drag and drop PDFs here, or click to select</span>
          <span className="text-xs text-muted-foreground">(You can reorder after upload)</span>
        </div>
        {pdfItems.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pdfItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="mb-4">
                {pdfItems.map((item, idx) => (
                  <SortablePdfItem key={item.id} {...item} index={idx} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        {pdfItems.length > 0 && (
          progress < 100 && (
            <div className="w-full flex flex-col items-center mb-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Processing PDFs... {progress}%</div>
            </div>
          )
        )}
        <div className="flex gap-4 mb-4 justify-center">
          <Button onClick={handleMerge} disabled={pdfItems.length < 2 || isMerging} loading={isMerging}>
            Merge PDFs
          </Button>
          {mergedUrl && (
            <Button onClick={handleDownload} variant="secondary">
              Download Merged
            </Button>
          )}
        </div>
        {mergedUrl && (
          <div className="text-center mt-4 text-green-600 font-medium">Merged PDF is ready for download.</div>
        )}
      </div>
    </div>
  );
};

export default PdfMerge; 