import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

const Md5EncryptDecrypt = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleEncrypt = () => {
    setOutput(CryptoJS.MD5(input).toString());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "MD5 hash copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>MD5 Encrypt/Decrypt</CardTitle>
            <CardDescription>
              Generate MD5 hash for any string. (MD5 is a one-way hash, so decryption is not possible.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter text to hash..."
                className="font-mono"
              />
              <Button onClick={handleEncrypt} className="w-full">Encrypt (Hash)</Button>
              <Input
                value={output}
                readOnly
                placeholder="MD5 hash will appear here"
                className="font-mono"
              />
              <Button onClick={handleCopy} variant="outline" className="w-full flex items-center justify-center">
                <Copy className="w-4 h-4 mr-2" /> Copy Hash
              </Button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">
              <b>Note:</b> MD5 is not reversible. This tool only generates the hash.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Md5EncryptDecrypt;
