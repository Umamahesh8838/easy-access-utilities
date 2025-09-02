
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

const Md5HashGenerator = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleHash = () => {
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(CryptoJS.MD5(input).toString());
    toast({ title: "MD5 Hash Generated", description: "Hash has been generated." });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Hash copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">MD5 Hash Generator</h1>
          <p className="text-xl text-muted-foreground">Generate MD5 hash for any string</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 min-h-[400px]">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter text to hash</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Textarea value={input} onChange={e => setInput(e.target.value)} className="min-h-[120px] font-mono text-sm resize-none" placeholder="Enter text..." />
              <Button onClick={handleHash} className="w-full">Generate MD5 Hash</Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>MD5 Hash</CardTitle>
              <CardDescription>Your generated hash</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Textarea value={output} readOnly className="min-h-[120px] font-mono text-sm resize-none" placeholder="Hash will appear here..." />
              <Button onClick={copyToClipboard} variant="outline" className="w-full"><Copy className="w-4 h-4 mr-2" />Copy</Button>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About MD5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">MD5 is a widely used hash function producing a 128-bit hash value. It is not recommended for cryptographic security but is useful for checksums and fingerprinting.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Md5HashGenerator;
