import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Base64Encoder = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [inputToDecode, setInputToDecode] = useState("");
  const { toast } = useToast();

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setEncodedText(encoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode text to Base64",
        variant: "destructive",
      });
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(inputToDecode)));
      setDecodedText(decoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid Base64 string",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Base64 Encoder/Decoder</h1>
          <p className="text-xl text-muted-foreground">
            Encode and decode text using Base64 encoding
          </p>
        </div>

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <TabsContent value="encode">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Input Text</CardTitle>
                  <CardDescription>Enter the text you want to encode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to encode..."
                    className="min-h-[200px]"
                  />
                  <Button onClick={encodeToBase64} className="mt-4 w-full">
                    Encode to Base64
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Base64 Output</CardTitle>
                  <CardDescription>Your encoded Base64 string</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={encodedText}
                    readOnly
                    placeholder="Encoded text will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(encodedText)}
                      disabled={!encodedText}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(encodedText, "base64-encoded.txt")}
                      disabled={!encodedText}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Base64 Input</CardTitle>
                  <CardDescription>Enter the Base64 string you want to decode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputToDecode}
                    onChange={(e) => setInputToDecode(e.target.value)}
                    placeholder="Enter Base64 string to decode..."
                    className="min-h-[200px]"
                  />
                  <Button onClick={decodeFromBase64} className="mt-4 w-full">
                    Decode from Base64
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decoded Output</CardTitle>
                  <CardDescription>Your decoded text</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={decodedText}
                    readOnly
                    placeholder="Decoded text will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(decodedText)}
                      disabled={!decodedText}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(decodedText, "base64-decoded.txt")}
                      disabled={!decodedText}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Base64 Encoding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string format. 
              It's commonly used for encoding data that needs to be stored and transferred over media that 
              are designed to deal with text. This encoding is used in email via MIME, storing complex 
              data in XML or JSON, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Base64Encoder;
