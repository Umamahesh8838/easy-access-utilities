import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Copy, Share2, Image, Wifi, Mail, Phone, Calendar, User, Link, FileText, X } from "lucide-react";
import QRCode from "qrcode"; // Now using the real QRCode library

// Cookie helpers
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}

// QR Type Interfaces
interface QrOptions {
  type: string;
  size: number;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  useGradient: boolean;
  gradientColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  eyeShape: 'square' | 'circle' | 'rounded';
  logoUrl?: string;
}

interface QrHistory {
  id: string;
  content: string;
  type: string;
  timestamp: number;
  options: QrOptions;
}

// Helper function to create formatted QR data
const formatQrData = (type: string, data: any): string => {
  switch(type) {
    case 'url':
      // Validate URL and add https:// if missing
      if (data.url && !data.url.startsWith('http://') && !data.url.startsWith('https://')) {
        data.url = 'https://' + data.url;
      }
      return data.url || '';
    
    case 'text':
      return data.text || '';
    
    case 'email':
      if (!data.email) return '';
      let emailStr = `mailto:${data.email}`;
      if (data.subject) emailStr += `?subject=${encodeURIComponent(data.subject)}`;
      if (data.body) emailStr += `${data.subject ? '&' : '?'}body=${encodeURIComponent(data.body)}`;
      return emailStr;
    
    case 'phone':
      return data.phone ? `tel:${data.phone}` : '';
    
    case 'wifi':
      if (!data.ssid) return '';
      return `WIFI:S:${data.ssid};T:${data.encryption || 'WPA'};P:${data.password || ''};;`;
    
    case 'vcard':
      if (!data.name) return '';
      return `BEGIN:VCARD
VERSION:3.0
N:${data.lastName || ''};${data.firstName || ''}
FN:${data.name}
${data.email ? `EMAIL:${data.email}` : ''}
${data.phone ? `TEL:${data.phone}` : ''}
${data.company ? `ORG:${data.company}` : ''}
${data.title ? `TITLE:${data.title}` : ''}
${data.website ? `URL:${data.website}` : ''}
${data.address ? `ADR:;;${data.address}` : ''}
END:VCARD`;
    
    case 'event':
      if (!data.title || !data.startDate) return '';
      return `BEGIN:VEVENT
SUMMARY:${data.title}
DTSTART:${formatCalendarDate(data.startDate)}
${data.endDate ? `DTEND:${formatCalendarDate(data.endDate)}` : ''}
${data.location ? `LOCATION:${data.location}` : ''}
${data.description ? `DESCRIPTION:${data.description}` : ''}
END:VEVENT`;
    
    default:
      return '';
  }
};

// Helper to format calendar dates for iCal
const formatCalendarDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

// Validate QR data based on type
const validateQrData = (type: string, data: any): boolean => {
  switch(type) {
    case 'url':
      return !!data.url;
    case 'text':
      return !!data.text;
    case 'email':
      return !!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    case 'phone':
      return !!data.phone && /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(data.phone);
    case 'wifi':
      return !!data.ssid;
    case 'vcard':
      return !!data.name;
    case 'event':
      return !!data.title && !!data.startDate;
    default:
      return false;
  }
};

// Default options
const DEFAULT_OPTIONS: QrOptions = {
  type: 'url',
  size: 300,
  margin: 4,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  useGradient: false,
  gradientColor: '#4338ca',
  errorCorrectionLevel: 'M',
  eyeShape: 'square'
};

export default function QrGenerator() {
  // Main states
  const [activeTab, setActiveTab] = useState<string>('url');
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);
  const [qrData, setQrData] = useState<any>({
    url: '',
    text: '',
    email: '',
    subject: '',
    body: '',
    phone: '',
    ssid: '',
    encryption: 'WPA',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    website: '',
    address: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });
  const [history, setHistory] = useState<QrHistory[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [historyThumbnails, setHistoryThumbnails] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dark/Light mode toggle
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Load history from cookies on mount
  useEffect(() => {
    try {
      const savedHistory = getCookie('qr_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory).slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading QR history:", error);
    }
  }, []);

  // Save history to cookies on change
  useEffect(() => {
    if (history.length > 0) {
      setCookie('qr_history', JSON.stringify(history), 30); // 30 days expiration
    }
  }, [history]);

  // Generate thumbnail for a history item
  const generateHistoryThumbnail = async (item: QrHistory) => {
    try {
      const thumbnailUrl = await QRCode.toDataURL(item.content, {
        width: 100,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: item.options.foregroundColor,
          light: item.options.backgroundColor
        }
      });
      
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

  // Helper to draw rounded rectangles
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  // Helper function to enhance QR code with gradient and eye shapes
  const enhanceQRCode = async (
    canvas: HTMLCanvasElement, 
    text: string, 
    options: any
  ) => {
    // First render the QR code normally
    await QRCode.toCanvas(canvas, text, {
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.foregroundColor,
        light: options.backgroundColor
      },
      errorCorrectionLevel: options.errorCorrectionLevel
    });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Apply gradient if enabled
    if (options.useGradient) {
      // Create a gradient - diagonal from top left to bottom right
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, options.foregroundColor);
      gradient.addColorStop(1, options.gradientColor || '#4338ca');
      
      // Get the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Create a temporary canvas to draw the gradient QR code
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Copy the background
        tempCtx.fillStyle = options.backgroundColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Find the dark pixels (QR code) and apply the gradient
        for (let i = 0; i < data.length; i += 4) {
          // If it's a dark pixel (part of the QR code)
          if (data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            
            // Draw the gradient pixel
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(x, y, 1, 1);
          }
        }
        
        // Copy the result back to the original canvas
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
    
    // Apply custom eye shapes if needed
    if (options.eyeShape && options.eyeShape !== 'square') {
      customizeEyeShape(canvas, options.eyeShape);
    }
    
    // Add logo if provided
    if (options.logoUrl) {
      const logoSize = canvas.width * 0.2; // Logo size is 20% of QR code
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = (canvas.height - logoSize) / 2;
      
      // Create a temporary image element
      const img = document.createElement('img');
      img.src = options.logoUrl;
      
      // Wait for the image to load
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if logo fails
      });
      
      // Create a rounded rect path for the logo background
      ctx.fillStyle = 'white';
      const radius = logoSize * 0.15;
      ctx.beginPath();
      ctx.moveTo(logoX + radius, logoY);
      ctx.arcTo(logoX + logoSize, logoY, logoX + logoSize, logoY + logoSize, radius);
      ctx.arcTo(logoX + logoSize, logoY + logoSize, logoX, logoY + logoSize, radius);
      ctx.arcTo(logoX, logoY + logoSize, logoX, logoY, radius);
      ctx.arcTo(logoX, logoY, logoX + logoSize, logoY, radius);
      ctx.closePath();
      ctx.fill();
      
      // Draw the logo with a small padding
      const padding = logoSize * 0.1;
      ctx.drawImage(
        img, 
        logoX + padding, 
        logoY + padding, 
        logoSize - padding * 2, 
        logoSize - padding * 2
      );
    }
  };

  // Helper to customize QR code eye shapes
  const customizeEyeShape = (
    canvas: HTMLCanvasElement, 
    shape: 'square' | 'circle' | 'rounded'
  ) => {
    if (shape === 'square') return; // Default shape, no customization needed
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the canvas data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    
    // Detect the position markers (eyes)
    const moduleSize = canvas.width / 25; // Approximate module size
    const eyePositions = [
      {x: 0, y: 0},                            // Top-left
      {x: canvas.width - 7 * moduleSize, y: 0}, // Top-right
      {x: 0, y: canvas.width - 7 * moduleSize}  // Bottom-left
    ];
    
    // Clear the canvas for redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the background
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all pixels except for the eye positions
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        
        // If this is a dark pixel (part of the QR code)
        if (pixelData[index] < 100 && pixelData[index + 1] < 100 && pixelData[index + 2] < 100) {
          // Check if it's within any of the eye markers
          let isInEye = false;
          for (const eye of eyePositions) {
            if (
              x >= eye.x && 
              x < eye.x + 7 * moduleSize && 
              y >= eye.y && 
              y < eye.y + 7 * moduleSize
            ) {
              isInEye = true;
              break;
            }
          }
          
          // If not in an eye position, draw it normally
          if (!isInEye) {
            ctx.fillStyle = options.foregroundColor;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    
    // Now draw custom eye shapes
    for (const eye of eyePositions) {
      const eyeSize = 7 * moduleSize;
      const innerSize = 3 * moduleSize;
      const outerMargin = 1 * moduleSize;
      const innerMargin = 2 * moduleSize;
      
      // Outer shape
      ctx.fillStyle = options.foregroundColor;
      
      if (shape === 'circle') {
        // Draw outer circle
        ctx.beginPath();
        ctx.arc(
          eye.x + eyeSize / 2, 
          eye.y + eyeSize / 2, 
          eyeSize / 2 - outerMargin / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Draw white space
        ctx.fillStyle = options.backgroundColor;
        ctx.beginPath();
        ctx.arc(
          eye.x + eyeSize / 2, 
          eye.y + eyeSize / 2, 
          eyeSize / 2 - outerMargin - innerMargin / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Draw inner circle
        ctx.fillStyle = options.foregroundColor;
        ctx.beginPath();
        ctx.arc(
          eye.x + eyeSize / 2, 
          eye.y + eyeSize / 2, 
          innerSize / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      } else if (shape === 'rounded') {
        // Draw rounded rect for outer shape
        const radius = moduleSize;
        
        // Outer rounded rectangle
        ctx.fillStyle = options.foregroundColor;
        drawRoundedRect(ctx, 
          eye.x + outerMargin / 2, 
          eye.y + outerMargin / 2, 
          eyeSize - outerMargin, 
          eyeSize - outerMargin, 
          radius
        );
        
        // Inner white space
        ctx.fillStyle = options.backgroundColor;
        drawRoundedRect(ctx, 
          eye.x + outerMargin + innerMargin / 2, 
          eye.y + outerMargin + innerMargin / 2, 
          eyeSize - 2 * outerMargin - innerMargin, 
          eyeSize - 2 * outerMargin - innerMargin, 
          radius / 2
        );
        
        // Inner finder pattern
        ctx.fillStyle = options.foregroundColor;
        drawRoundedRect(ctx, 
          eye.x + eyeSize / 2 - innerSize / 2, 
          eye.y + eyeSize / 2 - innerSize / 2, 
          innerSize, 
          innerSize, 
          radius / 3
        );
      }
    }
  };

  // Generate QR code when data or options change
  const generateQrCode = async () => {
    const qrString = formatQrData(activeTab, qrData);
    
    if (!qrString) {
      setValidationError('Please enter the required information');
      setQrCodeUrl('');
      return;
    }

    setValidationError('');

    try {
      if (canvasRef.current) {
        // Create QR options
        const qrOptions = {
          width: options.size,
          margin: options.margin,
          color: {
            dark: options.foregroundColor,
            light: options.backgroundColor
          },
          errorCorrectionLevel: options.errorCorrectionLevel,
          eyeShape: options.eyeShape,
          useGradient: options.useGradient,
          gradientColor: options.gradientColor,
          logoUrl: options.logoUrl
        };
        
        // Generate enhanced QR code on canvas
        await enhanceQRCode(canvasRef.current, qrString, qrOptions);
      }

      // Generate a data URL for the history
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor
        },
        errorCorrectionLevel: options.errorCorrectionLevel
      });
      
      setQrCodeUrl(dataUrl);
      
      // Add to history if valid and not empty
      if (qrString && validateQrData(activeTab, qrData)) {
        const newHistoryItem: QrHistory = {
          id: Date.now().toString(),
          content: qrString,
          type: activeTab,
          timestamp: Date.now(),
          options: { ...options }
        };
        
        // Add to front of history, keep only last 5
        setHistory(prev => {
          const filtered = prev.filter(item => item.content !== qrString);
          return [newHistoryItem, ...filtered].slice(0, 5);
        });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setValidationError('Error generating QR code. Please try again with different settings.');
    }
  };

  // Validation warnings
  const getValidationWarnings = (): string[] => {
    const warnings = [];
    
    // Check QR content length
    const qrString = formatQrData(activeTab, qrData);
    if (qrString && qrString.length > 500) {
      warnings.push(`Your QR code contains ${qrString.length} characters, which might be difficult to scan. Consider shortening the content.`);
    }
    
    // Check logo + error correction
    if (options.logoUrl && options.errorCorrectionLevel !== 'H') {
      warnings.push('Using a logo with low error correction might reduce scannability. Consider using "High" error correction.');
    }
    
    // Check contrast
    const fgColor = options.foregroundColor.toLowerCase();
    const bgColor = options.backgroundColor.toLowerCase();
    if (fgColor === bgColor || (fgColor === '#ffffff' && bgColor === '#ffffff') || (fgColor === '#000000' && bgColor === '#000000')) {
      warnings.push('The foreground and background colors are too similar, which may make the QR code impossible to scan.');
    }
    
    // Check margin for scanability
    if (options.margin < 2) {
      warnings.push('A margin less than 2 pixels might cause scanning issues on some devices.');
    }
    
    return warnings;
  };

  // Debounced QR generator
  // We'll use a simple version since the full debounce is in utils.ts
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQrCode();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [qrData, options, activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOptions(prev => ({ ...prev, type: value }));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQrData(prev => ({ ...prev, [name]: value }));
  };

  // Handle option change
  const handleOptionChange = (name: string, value: any) => {
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setOptions(prev => ({ ...prev, logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Download QR code
  const downloadQrCode = (format: 'png' | 'svg' | 'pdf') => {
    if (!canvasRef.current || !qrCodeUrl) return;

    const link = document.createElement('a');
    
    if (format === 'png') {
      link.href = qrCodeUrl;
      link.download = `qrcode-${activeTab}-${Date.now()}.png`;
    } else if (format === 'svg') {
      // Create a more accurate SVG using QRCode.js's toDataURL with svg output
      try {
        // Generate an SVG QR code
        QRCode.toString(formatQrData(activeTab, qrData), {
          type: 'svg',
          width: options.size,
          margin: options.margin,
          color: {
            dark: options.foregroundColor,
            light: options.backgroundColor
          },
          errorCorrectionLevel: options.errorCorrectionLevel
        }, (error, svgString) => {
          if (error) throw error;
          
          // Create downloadable SVG
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
          link.href = URL.createObjectURL(svgBlob);
          link.download = `qrcode-${activeTab}-${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        return; // Return early as we're handling the download in the callback
      } catch (error) {
        console.error("Error generating SVG:", error);
        // Fall back to simpler method if the advanced method fails
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${options.size} ${options.size}">
          <rect width="100%" height="100%" fill="${options.backgroundColor}" />
          <image width="100%" height="100%" href="${qrCodeUrl}" />
        </svg>`;
        
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(svgBlob);
        link.download = `qrcode-${activeTab}-${Date.now()}.svg`;
      }
    } else if (format === 'pdf') {
      // Create a PDF using HTML and print to PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Please allow popups to download as PDF");
        return;
      }
      
      // Create a simple HTML document with the QR code
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${activeTab}</title>
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
            <img src="${qrCodeUrl}" alt="QR Code" width="${options.size}" height="${options.size}">
            <div class="info">
              <p>Type: ${activeTab.toUpperCase()}</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            <div class="no-print">
              <p>Your QR code is ready to be printed or saved as PDF.</p>
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
      return;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy QR code to clipboard
  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const blob = await (await fetch(qrCodeUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert("QR code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy QR code:", err);
      alert("Failed to copy QR code. Your browser may not support this feature.");
    }
  };

  // Generate HTML embed code
  const getEmbedCode = (): string => {
    if (!qrCodeUrl) return '';
    return `<img src="${qrCodeUrl}" alt="QR Code" width="${options.size}" height="${options.size}" />`;
  };

  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    const code = getEmbedCode();
    if (code) {
      navigator.clipboard.writeText(code);
      alert("Embed code copied to clipboard!");
    }
  };

  // Load history item
  const loadHistoryItem = (item: QrHistory) => {
    setActiveTab(item.type);
    setOptions(item.options);
    
    // Parse the content based on type to populate form fields
    // This is a simplified version - a real implementation would parse all field types
    switch(item.type) {
      case 'url':
        setQrData(prev => ({ ...prev, url: item.content }));
        break;
      case 'text':
        setQrData(prev => ({ ...prev, text: item.content }));
        break;
      // Additional parsers would be implemented for other types
      default:
        // For complex types, we would parse the content string back into fields
        break;
    }
  };

  // URL form
  const UrlForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Website URL</Label>
        <Input 
          id="url" 
          name="url" 
          value={qrData.url}
          onChange={handleInputChange}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );

  // Text form
  const TextForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text Content</Label>
        <textarea 
          id="text" 
          name="text" 
          value={qrData.text}
          onChange={handleInputChange}
          placeholder="Enter any text content here..."
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );

  // Email form
  const EmailForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          name="email" 
          type="email"
          value={qrData.email}
          onChange={handleInputChange}
          placeholder="email@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject (Optional)</Label>
        <Input 
          id="subject" 
          name="subject" 
          value={qrData.subject}
          onChange={handleInputChange}
          placeholder="Email subject"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Body (Optional)</Label>
        <textarea 
          id="body" 
          name="body" 
          value={qrData.body}
          onChange={handleInputChange}
          placeholder="Email content..."
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );

  // Phone form
  const PhoneForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          value={qrData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </div>
  );

  // Wi-Fi form
  const WifiForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ssid">Network Name (SSID)</Label>
        <Input 
          id="ssid" 
          name="ssid" 
          value={qrData.ssid}
          onChange={handleInputChange}
          placeholder="Your WiFi Network Name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="encryption">Encryption Type</Label>
        <Select 
          value={qrData.encryption} 
          onValueChange={(value) => setQrData(prev => ({ ...prev, encryption: value }))}
        >
          <SelectTrigger id="encryption">
            <SelectValue placeholder="Select encryption type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">No Password</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {qrData.encryption !== 'nopass' && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password"
            value={qrData.password}
            onChange={handleInputChange}
            placeholder="WiFi Password"
          />
        </div>
      )}
    </div>
  );

  // vCard form
  const VCardForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={qrData.name}
          onChange={handleInputChange}
          placeholder="John Doe"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
            name="firstName" 
            value={qrData.firstName}
            onChange={handleInputChange}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            name="lastName" 
            value={qrData.lastName}
            onChange={handleInputChange}
            placeholder="Doe"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="vcardEmail" 
          name="email" 
          type="email"
          value={qrData.email}
          onChange={handleInputChange}
          placeholder="john@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input 
          id="vcardPhone" 
          name="phone" 
          value={qrData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input 
            id="company" 
            name="company" 
            value={qrData.company}
            onChange={handleInputChange}
            placeholder="Company Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input 
            id="title" 
            name="title" 
            value={qrData.title}
            onChange={handleInputChange}
            placeholder="Software Engineer"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website" 
          name="website" 
          value={qrData.website}
          onChange={handleInputChange}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          name="address" 
          value={qrData.address}
          onChange={handleInputChange}
          placeholder="123 Main St, City, Country"
        />
      </div>
    </div>
  );

  // Event form
  const EventForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input 
          id="title" 
          name="title" 
          value={qrData.title}
          onChange={handleInputChange}
          placeholder="Meeting, Party, Conference, etc."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input 
            id="startDate" 
            name="startDate" 
            type="datetime-local"
            value={qrData.startDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date & Time (Optional)</Label>
          <Input 
            id="endDate" 
            name="endDate" 
            type="datetime-local"
            value={qrData.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location (Optional)</Label>
        <Input 
          id="location" 
          name="location" 
          value={qrData.location}
          onChange={handleInputChange}
          placeholder="Event location"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea 
          id="description" 
          name="description" 
          value={qrData.description}
          onChange={handleInputChange}
          placeholder="Event details..."
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );

  // Helper to mix two colors with a ratio
  const mixColors = (color1: string, color2: string, ratio: number): string => {
    // Parse hex colors to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Mix them
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    // Return hex string
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground text-center mb-8">Generate QR codes for URLs, text, contact info, Wi-Fi, and more</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Input forms */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Content Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                  <TabsList className="grid grid-cols-7 md:grid-cols-7">
                    <TabsTrigger value="url" className="flex flex-col items-center py-2">
                      <Link size={16} className="mb-1" />
                      <span className="text-xs">URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex flex-col items-center py-2">
                      <FileText size={16} className="mb-1" />
                      <span className="text-xs">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex flex-col items-center py-2">
                      <Mail size={16} className="mb-1" />
                      <span className="text-xs">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="flex flex-col items-center py-2">
                      <Phone size={16} className="mb-1" />
                      <span className="text-xs">Phone</span>
                    </TabsTrigger>
                    <TabsTrigger value="wifi" className="flex flex-col items-center py-2">
                      <Wifi size={16} className="mb-1" />
                      <span className="text-xs">Wi-Fi</span>
                    </TabsTrigger>
                    <TabsTrigger value="vcard" className="flex flex-col items-center py-2">
                      <User size={16} className="mb-1" />
                      <span className="text-xs">vCard</span>
                    </TabsTrigger>
                    <TabsTrigger value="event" className="flex flex-col items-center py-2">
                      <Calendar size={16} className="mb-1" />
                      <span className="text-xs">Event</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="pt-4">
                    {UrlForm}
                  </TabsContent>
                  
                  <TabsContent value="text" className="pt-4">
                    {TextForm}
                  </TabsContent>
                  
                  <TabsContent value="email" className="pt-4">
                    {EmailForm}
                  </TabsContent>
                  
                  <TabsContent value="phone" className="pt-4">
                    {PhoneForm}
                  </TabsContent>
                  
                  <TabsContent value="wifi" className="pt-4">
                    {WifiForm}
                  </TabsContent>
                  
                  <TabsContent value="vcard" className="pt-4">
                    {VCardForm}
                  </TabsContent>
                  
                  <TabsContent value="event" className="pt-4">
                    {EventForm}
                  </TabsContent>
                </Tabs>

                {validationError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
                
                {/* Show validation warnings */}
                {getValidationWarnings().map((warning, index) => (
                  <Alert key={index} className="mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-700">{warning}</AlertDescription>
                  </Alert>
                ))}

                {/* Validation warnings are now handled above */}

                <Separator className="my-4" />

                <div className="space-y-6">
                  <h3 className="text-lg font-medium">QR Code Options</h3>
                  
                  {/* Size slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="size">Size: {options.size}×{options.size}px</Label>
                    </div>
                    <Slider
                      id="size"
                      min={100}
                      max={1000}
                      step={10}
                      value={[options.size]}
                      onValueChange={(value) => handleOptionChange('size', value[0])}
                    />
                  </div>
                  
                  {/* Margin slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="margin">Margin: {options.margin}px</Label>
                    </div>
                    <Slider
                      id="margin"
                      min={0}
                      max={50}
                      step={1}
                      value={[options.margin]}
                      onValueChange={(value) => handleOptionChange('margin', value[0])}
                    />
                  </div>
                  
                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foregroundColor">Foreground Color</Label>
                      <div className="flex">
                        <Input 
                          id="foregroundColor" 
                          type="color"
                          value={options.foregroundColor}
                          onChange={(e) => handleOptionChange('foregroundColor', e.target.value)}
                          className="w-12 p-1 h-10"
                        />
                        <Input 
                          type="text" 
                          value={options.foregroundColor} 
                          onChange={(e) => handleOptionChange('foregroundColor', e.target.value)}
                          className="flex-1 ml-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex">
                        <Input 
                          id="backgroundColor" 
                          type="color"
                          value={options.backgroundColor}
                          onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                          className="w-12 p-1 h-10"
                        />
                        <Input 
                          type="text" 
                          value={options.backgroundColor} 
                          onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                          className="flex-1 ml-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Gradient */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="useGradient">Use Gradient</Label>
                      <Switch 
                        id="useGradient"
                        checked={options.useGradient}
                        onCheckedChange={(checked) => handleOptionChange('useGradient', checked)}
                      />
                    </div>
                    {options.useGradient && (
                      <div className="flex mt-2">
                        <Input 
                          type="color"
                          value={options.gradientColor}
                          onChange={(e) => handleOptionChange('gradientColor', e.target.value)}
                          className="w-12 p-1 h-10"
                        />
                        <Input 
                          type="text" 
                          value={options.gradientColor} 
                          onChange={(e) => handleOptionChange('gradientColor', e.target.value)}
                          className="flex-1 ml-2"
                          placeholder="Second gradient color"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Error correction */}
                  <div className="space-y-2">
                    <Label htmlFor="errorCorrectionLevel">Error Correction</Label>
                    <Select 
                      value={options.errorCorrectionLevel} 
                      onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => handleOptionChange('errorCorrectionLevel', value)}
                    >
                      <SelectTrigger id="errorCorrectionLevel">
                        <SelectValue placeholder="Select error correction level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Eye Shape */}
                  <div className="space-y-2">
                    <Label htmlFor="eyeShape">Eye Shape</Label>
                    <Select 
                      value={options.eyeShape} 
                      onValueChange={(value: 'square' | 'circle' | 'rounded') => handleOptionChange('eyeShape', value)}
                    >
                      <SelectTrigger id="eyeShape">
                        <SelectValue placeholder="Select eye shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square (Default)</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Logo upload */}
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo Overlay (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Image size={16} className="mr-2" />
                        {options.logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {options.logoUrl && (
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleOptionChange('logoUrl', undefined)}
                        >
                          <span className="sr-only">Remove Logo</span>
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                    {options.logoUrl && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={options.logoUrl} 
                          alt="Logo overlay" 
                          className="h-12 object-contain border rounded p-1"
                        />
                      </div>
                    )}
                    {options.logoUrl && options.errorCorrectionLevel !== 'H' && (
                      <p className="text-yellow-500 text-sm mt-1">
                        Note: It's recommended to use High error correction when using a logo overlay.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* History */}
            {history.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recently Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {history.map((item) => (
                      <Button 
                        key={item.id} 
                        variant="outline"
                        className="p-2 h-auto flex flex-col"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="w-full aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                          {historyThumbnails[item.id] ? (
                            <img 
                              src={historyThumbnails[item.id]}
                              alt={`${item.type} QR Code`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-xs text-gray-500 p-1 text-center">
                              {item.type.toUpperCase()}
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
          
          {/* Right column: QR preview */}
          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div 
                    className="relative bg-white rounded-lg shadow-md p-4 flex items-center justify-center"
                    style={{ width: `${Math.min(500, options.size + 80)}px`, height: `${Math.min(500, options.size + 80)}px` }}
                  >
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-full"
                    ></canvas>
                    
                    {options.logoUrl && (
                      <div 
                        className="absolute"
                        style={{
                          width: options.size * 0.2,
                          height: options.size * 0.2,
                          backgroundImage: `url(${options.logoUrl})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      ></div>
                    )}
                  </div>
                </div>
                
                {qrCodeUrl && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button onClick={() => downloadQrCode('png')}>
                      <Download size={16} className="mr-2" />
                      Download PNG
                    </Button>
                    <Button onClick={() => downloadQrCode('svg')} variant="outline">
                      <Download size={16} className="mr-2" />
                      Download SVG
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline">
                      <Copy size={16} className="mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button onClick={copyEmbedCode} variant="outline">
                      <Share2 size={16} className="mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scan Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Make sure there's enough contrast between foreground and background colors for better scanning.</li>
                  <li>Using a logo? Set error correction to "High" to ensure the QR code remains scannable.</li>
                  <li>Test your QR code with multiple scanning apps before sharing.</li>
                  <li>If the QR code contains a lot of information, increase its size for better readability.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
