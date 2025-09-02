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
import { AlertCircle, Download, Copy, Share2, Image, Wifi, Mail, Phone, Calendar, User, Link, FileText } from "lucide-react";
import QRCode from "qrcode";
import { debounce } from "@/lib/utils";

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

export default function QrCodeGenerator() {
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
  const [validationError, setValidationError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        await QRCode.toCanvas(canvasRef.current, qrString, {
          width: options.size,
          margin: options.margin,
          color: {
            dark: options.foregroundColor,
            light: options.backgroundColor
          },
          errorCorrectionLevel: options.errorCorrectionLevel
        });
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

  // Debounced QR generator
  const debouncedGenerateQr = useRef(
    debounce(generateQrCode, 300)
  ).current;

  useEffect(() => {
    debouncedGenerateQr();
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
      // Convert to SVG - simplified version
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${options.size} ${options.size}">
        <rect width="100%" height="100%" fill="${options.backgroundColor}" />
        <image width="100%" height="100%" href="${qrCodeUrl}" />
      </svg>`;
      
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(svgBlob);
      link.download = `qrcode-${activeTab}-${Date.now()}.svg`;
    } else if (format === 'pdf') {
      // This is a simplified PDF creation - a real solution would use a PDF library
      alert("PDF download is not implemented in this demo. Please use PNG or SVG.");
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
                          {/* This would be a QR code image in the full implementation */}
                          <div className="text-xs text-gray-500 p-1 text-center">
                            {item.type.toUpperCase()}
                          </div>
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
