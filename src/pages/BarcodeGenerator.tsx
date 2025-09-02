import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Copy, Share2, Image, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveAs } from 'file-saver';
import JsBarcode from 'jsbarcode';

// Cookie helpers
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

// Barcode Types and their validation rules
interface BarcodeType {
  id: string;
  name: string;
  validator: (value: string) => boolean;
  errorMessage: string;
  options?: Record<string, any>;
}

const barcodeTypes: BarcodeType[] = [
  {
    id: 'code128',
    name: 'Code 128',
    validator: (value) => value.length > 0,
    errorMessage: 'Please enter a value'
  },
  {
    id: 'code39',
    name: 'Code 39',
    validator: (value) => /^[A-Z0-9\-\.\ \$\/\+\%]+$/i.test(value),
    errorMessage: 'Only uppercase alphanumeric characters and - . $ / + % are allowed'
  },
  {
    id: 'ean13',
    name: 'EAN-13',
    validator: (value) => /^\d{12,13}$/.test(value),
    errorMessage: 'Must be exactly 12 or 13 digits'
  },
  {
    id: 'ean8',
    name: 'EAN-8',
    validator: (value) => /^\d{7,8}$/.test(value),
    errorMessage: 'Must be exactly 7 or 8 digits'
  },
  {
    id: 'upc',
    name: 'UPC-A',
    validator: (value) => /^\d{11,12}$/.test(value),
    errorMessage: 'Must be exactly 11 or 12 digits'
  },
  {
    id: 'itf14',
    name: 'ITF-14',
    validator: (value) => /^\d{13,14}$/.test(value),
    errorMessage: 'Must be exactly 13 or 14 digits'
  },
  {
    id: 'itf',
    name: 'ITF',
    validator: (value) => /^\d+$/.test(value) && value.length % 2 === 0,
    errorMessage: 'Must contain an even number of digits'
  },
  {
    id: 'msi',
    name: 'MSI',
    validator: (value) => /^\d+$/.test(value),
    errorMessage: 'Must contain only digits'
  },
  {
    id: 'pharmacode',
    name: 'Pharmacode',
    validator: (value) => /^\d+$/.test(value) && parseInt(value) >= 3 && parseInt(value) <= 131070,
    errorMessage: 'Must be a number between 3 and 131070'
  },
  {
    id: 'codabar',
    name: 'Codabar',
    validator: (value) => /^[A-D][0-9\-\$\:\/\.\+]+[A-D]$/.test(value),
    errorMessage: 'Must start and end with A, B, C, or D and contain 0-9, -, $, :, /, ., or +'
  },
  {
    id: 'datamatrix',
    name: 'DataMatrix',
    validator: (value) => value.length > 0,
    errorMessage: 'Please enter a value'
  }
];

// Interface for barcode options
interface BarcodeOptions {
  type: string;
  value: string;
  width: number;
  height: number;
  margin: number;
  background: string;
  lineColor: string;
  showLabel: boolean;
  fontSize: number;
  fontFamily: string;
}

// Interface for history items
interface BarcodeHistory {
  id: string;
  type: string;
  value: string;
  options: BarcodeOptions;
  timestamp: number;
  thumbnailUrl?: string;
}

// Default options
const DEFAULT_OPTIONS: BarcodeOptions = {
  type: 'code128',
  value: '',
  width: 2,
  height: 100,
  margin: 10,
  background: '#ffffff',
  lineColor: '#000000',
  showLabel: true,
  fontSize: 20,
  fontFamily: 'monospace'
};

// Font families
const fontFamilies = [
  'monospace',
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New'
];

export default function BarcodeGenerator() {
  // Main states
  const [options, setOptions] = useState<BarcodeOptions>(DEFAULT_OPTIONS);
  const [validationError, setValidationError] = useState<string>('');
  const [barcodeValid, setBarcodeValid] = useState<boolean>(false);
  const [history, setHistory] = useState<BarcodeHistory[]>([]);
  const [historyThumbnails, setHistoryThumbnails] = useState<Record<string, string>>({});
  const [expandCustomization, setExpandCustomization] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  
  // Refs
  const barcodeRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load history from cookies on mount
  useEffect(() => {
    try {
      const savedHistory = getCookie('barcode_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory).slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading barcode history:", error);
    }
  }, []);

  // Save history to cookies on change
  useEffect(() => {
    if (history.length > 0) {
      setCookie('barcode_history', JSON.stringify(history), 30); // 30 days expiration
    }
  }, [history]);

  // Generate barcode when options change
  useEffect(() => {
    generateBarcode();
  }, [options, highContrastMode]);

  // Validate input
  useEffect(() => {
    validateInput();
  }, [options.type, options.value]);

  // Generate thumbnail for a history item
  const generateHistoryThumbnail = (item: BarcodeHistory) => {
    try {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svgElement, item.value, {
        format: item.type,
        width: 2,
        height: 40,
        margin: 2,
        background: item.options.background,
        lineColor: item.options.lineColor,
        displayValue: false
      });
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const thumbnailUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
      
      setHistoryThumbnails(prev => ({
        ...prev,
        [item.id]: thumbnailUrl
      }));
    } catch (error) {
      console.error("Error generating history thumbnail:", error);
    }
  };

  // Generate thumbnails for history items
  useEffect(() => {
    history.forEach(item => {
      if (!historyThumbnails[item.id]) {
        generateHistoryThumbnail(item);
      }
    });
  }, [history]);

  // Validate barcode input
  const validateInput = () => {
    // Find selected barcode type
    const selectedType = barcodeTypes.find(type => type.id === options.type);
    if (!selectedType) return;
    
    // Check if input is valid
    const isValid = selectedType.validator(options.value);
    setBarcodeValid(isValid);
    
    if (!isValid && options.value) {
      setValidationError(selectedType.errorMessage);
    } else {
      setValidationError('');
    }
  };

  // Generate barcode
  const generateBarcode = () => {
    if (!barcodeRef.current || !options.value) return;
    
    try {
      // Clear the current barcode
      barcodeRef.current.innerHTML = '';
      
      // Create a new SVG element
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      barcodeRef.current.appendChild(svgElement);
      svgRef.current = svgElement;
      
      // Apply high contrast mode if enabled
      const lineColor = highContrastMode ? '#000000' : options.lineColor;
      const background = highContrastMode ? '#ffffff' : options.background;
      
      // Generate the barcode
      JsBarcode(svgElement, options.value, {
        format: options.type,
        width: options.width,
        height: options.height,
        margin: options.margin,
        background: background,
        lineColor: lineColor,
        displayValue: options.showLabel,
        fontSize: options.fontSize,
        font: options.fontFamily
      });
    } catch (error) {
      console.error("Error generating barcode:", error);
      setValidationError('Error generating barcode. Please check your input.');
    }
  };

  // Handle option change
  const handleOptionChange = (name: keyof BarcodeOptions, value: any) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  // Handle value change with debounce
  const handleValueChange = (value: string) => {
    handleOptionChange('value', value);
  };

  // Download barcode as PNG
  const downloadPNG = () => {
    if (!svgRef.current || !options.value) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `barcode-${options.type}-${Date.now()}.png`);
        }
      });
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  // Download barcode as SVG
  const downloadSVG = () => {
    if (!svgRef.current || !options.value) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    saveAs(blob, `barcode-${options.type}-${Date.now()}.svg`);
  };

  // Download barcode as PDF
  const downloadPDF = () => {
    if (!svgRef.current || !options.value) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    
    // Create a PDF using HTML and print to PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download as PDF");
      return;
    }
    
    // Create a simple HTML document with the barcode
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${options.type}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
          }
          img {
            max-width: 100%;
            height: auto;
            margin-bottom: 20px;
          }
          .info {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="data:image/svg+xml;base64,${btoa(svgData)}" alt="Barcode" width="${svgRef.current.width.baseVal.value}" height="${svgRef.current.height.baseVal.value}">
          <div class="info">
            <p>Type: ${options.type.toUpperCase()}</p>
            <p>Value: ${options.value}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          <div class="no-print">
            <p>Your barcode is ready to be printed or saved as PDF.</p>
            <p>Use your browser's Print function (Ctrl+P or Cmd+P) and select "Save as PDF".</p>
          </div>
        </div>
        <script>
          // Auto-trigger print dialog after a short delay
          setTimeout(() => {
            document.querySelector('.no-print').innerHTML = '<p>Preparing PDF...</p>';
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Copy barcode to clipboard
  const copyToClipboard = async () => {
    if (!svgRef.current || !options.value) return;
    
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            alert("Barcode copied to clipboard!");
          }
        });
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (err) {
      console.error("Failed to copy barcode:", err);
      alert("Failed to copy barcode. Your browser may not support this feature.");
    }
  };

  // Save to history
  const saveToHistory = () => {
    if (!options.value || !barcodeValid) return;
    
    const newHistoryItem: BarcodeHistory = {
      id: Date.now().toString(),
      type: options.type,
      value: options.value,
      options: { ...options },
      timestamp: Date.now()
    };
    
    // Add to front of history, keep only last 5
    setHistory(prev => {
      const filtered = prev.filter(item => item.value !== options.value || item.type !== options.type);
      return [newHistoryItem, ...filtered].slice(0, 5);
    });
  };

  // Load history item
  const loadHistoryItem = (item: BarcodeHistory) => {
    setOptions(item.options);
  };

  // Render
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Barcode Generator</h1>
        <p className="text-muted-foreground text-center mb-8">Generate barcodes in multiple formats with customization options</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Input and Settings */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Barcode Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barcode Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Barcode Type</Label>
                    <Select 
                      value={options.type}
                      onValueChange={(value) => handleOptionChange('type', value)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select barcode type" />
                      </SelectTrigger>
                      <SelectContent>
                        {barcodeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Barcode Value */}
                  <div className="space-y-2">
                    <Label htmlFor="value">Barcode Value</Label>
                    <Input 
                      id="value"
                      value={options.value}
                      onChange={(e) => handleValueChange(e.target.value)}
                      placeholder="Enter value for barcode"
                      className={validationError ? "border-red-500" : ""}
                    />
                    {validationError && (
                      <p className="text-sm text-red-500">{validationError}</p>
                    )}
                  </div>
                  
                  {/* Validation Error */}
                  {validationError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Show Save Button */}
                  <Button 
                    onClick={saveToHistory}
                    disabled={!barcodeValid || !options.value}
                    className="w-full mt-2"
                  >
                    Save to History
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Customization Options */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Customization</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setExpandCustomization(!expandCustomization)}
                  >
                    {expandCustomization ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </div>
              </CardHeader>
              
              {expandCustomization && (
                <CardContent>
                  <div className="space-y-6">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lineColor">Bar Color</Label>
                        <div className="flex">
                          <Input 
                            id="lineColor"
                            type="color"
                            value={options.lineColor}
                            onChange={(e) => handleOptionChange('lineColor', e.target.value)}
                            className="w-12 p-1 h-10"
                            disabled={highContrastMode}
                          />
                          <Input 
                            type="text"
                            value={options.lineColor}
                            onChange={(e) => handleOptionChange('lineColor', e.target.value)}
                            className="flex-1 ml-2"
                            disabled={highContrastMode}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="background">Background Color</Label>
                        <div className="flex">
                          <Input 
                            id="background"
                            type="color"
                            value={options.background}
                            onChange={(e) => handleOptionChange('background', e.target.value)}
                            className="w-12 p-1 h-10"
                            disabled={highContrastMode}
                          />
                          <Input 
                            type="text"
                            value={options.background}
                            onChange={(e) => handleOptionChange('background', e.target.value)}
                            className="flex-1 ml-2"
                            disabled={highContrastMode}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* High Contrast Mode */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="highContrast">High Contrast Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Maximum readability (black on white)
                        </p>
                      </div>
                      <Switch
                        id="highContrast"
                        checked={highContrastMode}
                        onCheckedChange={setHighContrastMode}
                      />
                    </div>
                    
                    {/* Dimensions */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="width">Bar Width: {options.width}px</Label>
                        </div>
                        <Slider
                          id="width"
                          min={1}
                          max={4}
                          step={0.5}
                          value={[options.width]}
                          onValueChange={(value) => handleOptionChange('width', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="height">Bar Height: {options.height}px</Label>
                        </div>
                        <Slider
                          id="height"
                          min={50}
                          max={200}
                          step={5}
                          value={[options.height]}
                          onValueChange={(value) => handleOptionChange('height', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="margin">Margin: {options.margin}px</Label>
                        </div>
                        <Slider
                          id="margin"
                          min={5}
                          max={30}
                          step={1}
                          value={[options.margin]}
                          onValueChange={(value) => handleOptionChange('margin', value[0])}
                        />
                      </div>
                    </div>
                    
                    {/* Label Options */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showLabel">Show Text Label</Label>
                        <Switch
                          id="showLabel"
                          checked={options.showLabel}
                          onCheckedChange={(checked) => handleOptionChange('showLabel', checked)}
                        />
                      </div>
                      
                      {options.showLabel && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="fontFamily">Font Family</Label>
                            <Select 
                              value={options.fontFamily}
                              onValueChange={(value) => handleOptionChange('fontFamily', value)}
                            >
                              <SelectTrigger id="fontFamily">
                                <SelectValue placeholder="Select font family" />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font} value={font}>
                                    <span style={{ fontFamily: font }}>{font}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="fontSize">Font Size: {options.fontSize}px</Label>
                            </div>
                            <Slider
                              id="fontSize"
                              min={10}
                              max={30}
                              step={1}
                              value={[options.fontSize]}
                              onValueChange={(value) => handleOptionChange('fontSize', value[0])}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recently Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {history.map((item) => (
                      <Button 
                        key={item.id}
                        variant="outline"
                        className="p-2 h-auto flex flex-col"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="w-full aspect-video bg-white rounded mb-2 flex items-center justify-center overflow-hidden p-1">
                          {historyThumbnails[item.id] ? (
                            <img 
                              src={historyThumbnails[item.id]}
                              alt={`${item.type} Barcode`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-xs text-gray-500 text-center">
                              {item.type}
                            </div>
                          )}
                        </div>
                        <span className="text-xs truncate w-full">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right column: Barcode Preview */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Barcode Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div 
                    className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center w-full"
                    style={{ minHeight: '200px' }}
                  >
                    <div
                      ref={barcodeRef}
                      className="flex justify-center w-full transition-all duration-300"
                    ></div>
                  </div>
                </div>
                
                {barcodeValid && options.value && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button onClick={downloadPNG}>
                      <Download size={16} className="mr-2" />
                      Download PNG
                    </Button>
                    <Button onClick={downloadSVG} variant="outline">
                      <Download size={16} className="mr-2" />
                      Download SVG
                    </Button>
                    <Button onClick={downloadPDF} variant="outline">
                      <FileText size={16} className="mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline">
                      <Copy size={16} className="mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tips for Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>For better scanning, ensure there's enough contrast between bars and background.</li>
                  <li>Some barcode types (like EAN-13) require a specific number of digits.</li>
                  <li>Increase the bar width if you're having trouble scanning.</li>
                  <li>A larger quiet zone (margin) often improves readability.</li>
                  <li>Test your barcode with multiple scanning apps before using it in production.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
