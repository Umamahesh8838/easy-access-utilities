import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useNumbers: boolean, useSymbols: boolean): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  let chars = "";
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;
  if (!chars) return "";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

const StrongPasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleGenerate = () => {
    const pwd = generatePassword(length, useUpper, useLower, useNumbers, useSymbols);
    setPassword(pwd);
    toast({ title: "Password Generated", description: "A strong password has been generated." });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    toast({ title: "Copied!", description: "Password copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Strong Password Generator</h1>
          <p className="text-xl text-muted-foreground">Generate a strong, random password</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 min-h-[400px]">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Customize your password</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block mb-2">Length: {length}</label>
                <input type="range" min={6} max={64} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full" />
              </div>
              <div className="flex gap-4 flex-wrap">
                <label><input type="checkbox" checked={useUpper} onChange={e => setUseUpper(e.target.checked)} /> Uppercase</label>
                <label><input type="checkbox" checked={useLower} onChange={e => setUseLower(e.target.checked)} /> Lowercase</label>
                <label><input type="checkbox" checked={useNumbers} onChange={e => setUseNumbers(e.target.checked)} /> Numbers</label>
                <label><input type="checkbox" checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} /> Symbols</label>
              </div>
              <Button onClick={handleGenerate} className="w-full">Generate Password</Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Your generated password</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Input value={password} readOnly className="font-mono text-lg" placeholder="Password will appear here..." />
              <Button onClick={copyToClipboard} variant="outline" className="w-full"><Copy className="w-4 h-4 mr-2" />Copy</Button>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A strong password uses a mix of uppercase, lowercase, numbers, and symbols. Avoid using personal information and use unique passwords for each account.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrongPasswordGenerator;
