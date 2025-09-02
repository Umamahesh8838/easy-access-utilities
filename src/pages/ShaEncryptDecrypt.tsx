import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore
import * as CryptoJS from "crypto-js";

const shaVariants = [
  { name: "SHA1", fn: CryptoJS.SHA1 },
  { name: "SHA224", fn: CryptoJS.SHA224 },
  { name: "SHA256", fn: CryptoJS.SHA256 },
  { name: "SHA384", fn: CryptoJS.SHA384 },
  { name: "SHA512", fn: CryptoJS.SHA512 },
];


const ShaEncryptDecrypt = () => {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  // Default to SHA1, but check for ?variant=SHA224 etc
  const getInitialVariant = () => {
    const params = new URLSearchParams(location.search);
    const v = params.get("variant");
    if (v && shaVariants.some(sv => sv.name === v)) return v;
    return "SHA1";
  };
  const [variant, setVariant] = useState(getInitialVariant());
  const { toast } = useToast();

  // Update variant if URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("variant");
    if (v && shaVariants.some(sv => sv.name === v)) setVariant(v);
  }, [location.search]);

  const handleEncrypt = () => {
    const selected = shaVariants.find(v => v.name === variant);
    if (selected) setOutput(selected.fn(input).toString());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: `${variant} hash copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>{variant} Encrypt/Decrypt</CardTitle>
            <CardDescription>
              Generate {variant} hash for any string. (SHA hashes are one-way, not reversible.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                {shaVariants.map(v => (
                  <Button key={v.name} variant={variant === v.name ? "default" : "outline"} onClick={() => setVariant(v.name)}>{v.name}</Button>
                ))}
              </div>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Enter text to hash with ${variant}...`}
                className="font-mono"
              />
              <Button onClick={handleEncrypt} className="w-full">Encrypt (Hash)</Button>
              <Input
                value={output}
                readOnly
                placeholder={`${variant} hash will appear here`}
                className="font-mono"
              />
              <Button onClick={handleCopy} variant="outline" className="w-full flex items-center justify-center">
                <Copy className="w-4 h-4 mr-2" /> Copy Hash
              </Button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">
              <b>Note:</b> {variant} is not reversible. This tool only generates the hash.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShaEncryptDecrypt;
