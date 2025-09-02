import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Copy, Download, Moon, Sun, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

// Simple IBAN generation for now
const countries = [
  { code: "DE", name: "Germany", length: 22 },
  { code: "FR", name: "France", length: 27 },
  { code: "ES", name: "Spain", length: 24 },
  { code: "IT", name: "Italy", length: 27 },
  { code: "NL", name: "Netherlands", length: 18 },
  { code: "BE", name: "Belgium", length: 16 },
  { code: "GB", name: "United Kingdom", length: 22 },
];

interface GeneratedIBAN {
  raw: string;
  pretty: string;
  masked: string;
  country: string;
  length: number;
  isValid: boolean;
}

// Simple MOD 97 calculation
function mod97(numStr: string): number {
  let remainder = 0;
  for (let i = 0; i < numStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numStr[i])) % 97;
  }
  return remainder;
}

// Character mapping for IBAN
const charMap: Record<string, string> = {
  'A': '10', 'B': '11', 'C': '12', 'D': '13', 'E': '14', 'F': '15', 'G': '16', 'H': '17', 'I': '18',
  'J': '19', 'K': '20', 'L': '21', 'M': '22', 'N': '23', 'O': '24', 'P': '25', 'Q': '26', 'R': '27',
  'S': '28', 'T': '29', 'U': '30', 'V': '31', 'W': '32', 'X': '33', 'Y': '34', 'Z': '35'
};

function calculateCheckDigits(countryCode: string, bban: string): string {
  const rearranged = bban + countryCode + "00";
  let numericString = "";
  for (const char of rearranged) {
    if (char in charMap) {
      numericString += charMap[char];
    } else {
      numericString += char;
    }
  }
  const remainder = mod97(numericString);
  const checkDigits = 98 - remainder;
  return checkDigits.toString().padStart(2, "0");
}

function generateRandomBban(length: number): string {
  let bban = "";
  for (let i = 0; i < length - 4; i++) {
    bban += Math.floor(Math.random() * 10).toString();
  }
  return bban;
}

function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function maskIBAN(formattedIban: string): string {
  const clean = formattedIban.replace(/\s/g, "");
  if (clean.length < 6) return formattedIban;
  const masked = clean.slice(0, 4) + "*".repeat(clean.length - 6) + clean.slice(-2);
  return formatIBAN(masked);
}

function generateFakeIban(countryCode: string, mode: "valid" | "invalid"): GeneratedIBAN {
  const country = countries.find(c => c.code === countryCode);
  if (!country) throw new Error(`Unsupported country: ${countryCode}`);
  
  const bban = generateRandomBban(country.length);
  
  let checkDigits: string;
  let isValid: boolean;
  
  if (mode === "valid") {
    checkDigits = calculateCheckDigits(countryCode, bban);
    isValid = true;
  } else {
    do {
      checkDigits = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    } while (checkDigits === calculateCheckDigits(countryCode, bban));
    isValid = false;
  }
  
  const raw = countryCode + checkDigits + bban;
  const pretty = formatIBAN(raw);
  const masked = maskIBAN(pretty);
  
  return { raw, pretty, masked, country: countryCode, length: raw.length, isValid };
}

const FakeIbanGenerator: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState("DE");
  const [generationMode, setGenerationMode] = useState<"valid" | "invalid">("valid");
  const [quantity, setQuantity] = useState(5);
  const [showMasked, setShowMasked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [generatedIbans, setGeneratedIbans] = useState<GeneratedIBAN[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Theme effect
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 1000) {
      toast.error("Quantity must be between 1 and 1000");
      return;
    }

    setIsGenerating(true);
    
    try {
      const results: GeneratedIBAN[] = [];
      
      for (let i = 0; i < quantity; i++) {
        const iban = generateFakeIban(selectedCountry, generationMode);
        results.push(iban);
      }
      
      setGeneratedIbans(results);
      toast.success(`Generated ${results.length} test IBANs`);
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate IBANs");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, description: string = "IBAN") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${description} copied to clipboard`);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success(`${description} copied to clipboard (fallback)`);
    }
  };

  const copyAllIbans = () => {
    if (generatedIbans.length === 0) {
      toast.error("No IBANs to copy");
      return;
    }
    
    const text = generatedIbans
      .map(iban => showMasked ? iban.masked : iban.pretty)
      .join("\n");
    
    copyToClipboard(text, `${generatedIbans.length} IBANs`);
  };

  const exportData = (format: "csv" | "json") => {
    if (generatedIbans.length === 0) {
      toast.error("No IBANs to export");
      return;
    }

    const timestamp = new Date().toISOString();
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "csv") {
      const header = "# TEST USE ONLY - FAKE IBANS FOR DEVELOPMENT/TESTING\n# Generated: " + timestamp + "\n";
      const csvHeader = "country,length,iban,pretty,checksum_valid,mode\n";
      const csvRows = generatedIbans.map(iban => [
        iban.country,
        iban.length,
        iban.raw,
        iban.pretty,
        iban.isValid,
        generationMode
      ].join(",")).join("\n");
      
      content = header + csvHeader + csvRows;
      filename = `fake-ibans-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else {
      const data = {
        disclaimer: "TEST USE ONLY - FAKE IBANS FOR DEVELOPMENT/TESTING",
        generated_at: timestamp,
        config: { country: selectedCountry, mode: generationMode, quantity },
        ibans: generatedIbans,
      };
      
      content = JSON.stringify(data, null, 2);
      filename = `fake-ibans-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${generatedIbans.length} IBANs as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{ paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Fake IBAN Generator</h1>
              <Badge variant="destructive" className="text-xs font-bold">
                TEST USE ONLY
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Generate synthetic IBANs for testing and development. Not for real banking operations.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="icon"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <Card className="border-destructive/20 bg-destructive/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-destructive mb-1">Important Disclaimer</p>
                <p className="text-muted-foreground">
                  This tool generates synthetic IBANs for testing, development, and educational purposes only. 
                  These are NOT real bank accounts and must never be used for actual payments, KYC verification, 
                  customer onboarding, or any fraudulent activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Country Selection */}
                <div>
                  <Label>Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {countries.find(c => c.code === selectedCountry)?.length} characters
                  </p>
                </div>

                {/* Generation Mode */}
                <div>
                  <Label>Generation Mode</Label>
                  <Select value={generationMode} onValueChange={(value: any) => setGenerationMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valid">✅ Valid (Compliant)</SelectItem>
                      <SelectItem value="invalid">❌ Invalid (For Testing)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {generationMode === "valid" 
                      ? "Generate IBANs with correct format and checksum"
                      : "Generate IBANs with deliberate defects for negative testing"
                    }
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate 1-1000 IBANs at once
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Display Options */}
            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showMasked}
                    onCheckedChange={setShowMasked}
                  />
                  <Label>Show masked IBANs</Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Display as DE** **** **** **** **** ** format
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated IBANs</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => exportData("csv")}>
                      <Download className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => exportData("json")}>
                      <Download className="w-4 h-4" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {generatedIbans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏦</div>
                    <h3 className="text-lg font-semibold mb-2">No IBANs Generated</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your settings and click Generate to create test IBANs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedIbans.map((iban, index) => (
                      <Card key={index} className="relative overflow-hidden">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                          <span className="text-4xl font-bold transform rotate-12">
                            TEST ONLY
                          </span>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {iban.country}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {iban.length} chars
                                </Badge>
                                {iban.isValid ? (
                                  <Badge variant="default" className="text-xs bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Invalid
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Non-assignable
                                </Badge>
                              </div>
                              <div className="font-mono text-lg">
                                {showMasked ? iban.masked : iban.pretty}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(showMasked ? iban.masked : iban.pretty)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {generatedIbans.length > 0 && (
                  <span>{generatedIbans.length} IBANs generated</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {generatedIbans.length > 0 && (
                  <Button variant="outline" onClick={copyAllIbans}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                )}
                
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="min-w-32"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FakeIbanGenerator;
