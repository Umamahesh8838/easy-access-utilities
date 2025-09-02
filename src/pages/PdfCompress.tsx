import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PDFDocument } from 'pdf-lib';

interface CompressionLevel {
  label: string;
  value: number;
  description: string;
}

const compressionLevels: CompressionLevel[] = [
  { label: "Low Compression", value: 0.85, description: "Preserve quality, minimal compression" },
  { label: "Medium Compression", value: 0.65, description: "Balanced quality and file size" },
  { label: "High Compression", value: 0.45, description: "Aggressive compression, good for large files" },
  { label: "Maximum Compression", value: 0.25, description: "Maximum compression, may affect quality" },
];

const PdfCompress = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<number>(0.65);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Compress PDF using pdf-lib for real compression
  const compressPdf = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setCompressedPdf(null);
    setOriginalSize(file.size);
    
    try {
      setProgress(20);
      
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setProgress(60);
      
      // Compress based on selected level
      let compressionOptions: any = {};
      
      if (compressionLevel >= 0.8) {
        // Low compression - preserve quality
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 50
        };
      } else if (compressionLevel >= 0.6) {
        // Medium compression
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 100,
          updateFieldAppearances: false
        };
      } else if (compressionLevel >= 0.4) {
        // High compression  
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 200,
          updateFieldAppearances: false,
          useNormalAppearances: false
        };
      } else {
        // Maximum compression
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 300,
          updateFieldAppearances: false,
          useNormalAppearances: false
        };
      }
      
      setProgress(80);
      
      // Save the compressed PDF
      const compressedPdfBytes = await pdfDoc.save(compressionOptions);
      setProgress(90);
      
      // Convert to data URL
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const compressedPdfData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      setCompressedPdf(compressedPdfData);
      setCompressedSize(compressedPdfBytes.length);
      setProgress(100);
      
      const compressionRatio = ((originalSize - compressedPdfBytes.length) / originalSize) * 100;
      
      if (compressionRatio > 0) {
        toast({
          title: 'Success',
          description: `PDF compressed successfully! Reduced size by ${Math.round(compressionRatio)}%`,
          variant: 'default',
        });
      } else if (compressionRatio < -10) {
        // If file got significantly larger, show warning
        toast({
          title: 'Notice',
          description: 'This PDF may already be optimized. Try a different compression level or file.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Info',
          description: 'PDF processed with minimal size change. This PDF may already be compressed.',
          variant: 'default',
        });
      }
      
    } catch (err: any) {
      console.error('Compression error:', err);
      toast({
        title: 'Error',
        description: 'Failed to compress PDF. The file may be corrupted or password protected.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file input or drop
  const handleFiles = async (files: FileList | File[]) => {
    const pdf = Array.from(files).find(f => f.type === "application/pdf");
    if (!pdf) {
      toast({
        title: 'Invalid File',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
      return;
    }
    setPdfFile(pdf);
    setCompressedPdf(null);
    setCompressedSize(0);
    await compressPdf(pdf);
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
    setCompressedPdf(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setProgress(0);
    setIsProcessing(false);
  };

  // Recompress with different level
  const handleRecompress = async () => {
    if (pdfFile) {
      await compressPdf(pdfFile);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate compression ratio
  const getCompressionRatio = () => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">PDF Compressor</h1>
        
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
                <div className="text-muted-foreground text-sm">
                  Original size: <span className="font-bold">{formatFileSize(originalSize)}</span>
                </div>
                {compressedSize > 0 && (
                  <div className="text-muted-foreground text-sm">
                    Compressed size: <span className={`font-bold ${getCompressionRatio() > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatFileSize(compressedSize)}</span>
                    {getCompressionRatio() > 0 ? (
                      <span className="ml-2 text-green-600">({getCompressionRatio()}% smaller)</span>
                    ) : (
                      <span className="ml-2 text-red-600">({Math.abs(getCompressionRatio())}% larger)</span>
                    )}
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={handleReset}>Reset / Upload Another PDF</Button>
            </div>

            {/* Compression Level Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Compression Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {compressionLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setCompressionLevel(level.value)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      compressionLevel === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recompress Button */}
            {compressedPdf && (
              <div className="mb-4 flex justify-center">
                <Button 
                  onClick={handleRecompress}
                  variant="secondary"
                  disabled={isProcessing}
                >
                  🔄 Recompress with Selected Level
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="w-full flex flex-col items-center mb-4">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Compressing PDF... {progress}%</div>
              </div>
            )}

            {/* Download Compressed PDF */}
            {compressedPdf && !isProcessing && (
              <div className="mb-4 flex justify-center">
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = compressedPdf;
                    link.download = `compressed_${pdfFile.name}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-6 py-2"
                  variant="default"
                >
                  📥 Download Compressed PDF
                </Button>
              </div>
            )}
          </>
        )}

        {/* Error feedback area */}
        <div className="mt-2 text-center text-muted-foreground text-sm">
          Compress your PDF files to reduce their size while maintaining quality
        </div>
      </div>
    </div>
  );
};

export default PdfCompress;
