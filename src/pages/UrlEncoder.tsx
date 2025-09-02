import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UrlEncoder = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [encodedUrl, setEncodedUrl] = useState("");
  const [inputToDecode, setInputToDecode] = useState("");
  const [decodedUrl, setDecodedUrl] = useState("");
  const { toast } = useToast();

  const encodeUrl = () => {
    try {
      const encoded = encodeURIComponent(inputUrl);
      setEncodedUrl(encoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode URL",
        variant: "destructive",
      });
    }
  };

  const decodeUrl = () => {
    try {
      const decoded = decodeURIComponent(inputToDecode);
      setDecodedUrl(decoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid URL encoding",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
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
          <h1 className="text-4xl font-bold text-foreground mb-4">URL Encoder/Decoder</h1>
          <p className="text-xl text-muted-foreground">
            Encode and decode URLs for safe transmission
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
                  <CardTitle>Input URL</CardTitle>
                  <CardDescription>Enter the URL you want to encode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://example.com/search?q=hello world&type=all"
                    className="min-h-[200px]"
                  />
                  <Button onClick={encodeUrl} className="mt-4 w-full">
                    Encode URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Encoded URL</CardTitle>
                  <CardDescription>Your URL-encoded string</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={encodedUrl}
                    readOnly
                    placeholder="Encoded URL will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(encodedUrl)}
                      disabled={!encodedUrl}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(encodedUrl, "url-encoded.txt")}
                      disabled={!encodedUrl}
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
                  <CardTitle>Encoded URL Input</CardTitle>
                  <CardDescription>Enter the URL-encoded string you want to decode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputToDecode}
                    onChange={(e) => setInputToDecode(e.target.value)}
                    placeholder="https%3A//example.com/search%3Fq%3Dhello%20world%26type%3Dall"
                    className="min-h-[200px]"
                  />
                  <Button onClick={decodeUrl} className="mt-4 w-full">
                    Decode URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decoded URL</CardTitle>
                  <CardDescription>Your decoded URL</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={decodedUrl}
                    readOnly
                    placeholder="Decoded URL will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(decodedUrl)}
                      disabled={!decodedUrl}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(decodedUrl, "url-decoded.txt")}
                      disabled={!decodedUrl}
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
            <CardTitle>About URL Encoding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              URL encoding (also known as percent encoding) is a mechanism for encoding information 
              in a URL under certain circumstances. It replaces unsafe ASCII characters with a "%" 
              followed by two hexadecimal digits. This is essential for including special characters 
              in URLs, such as spaces, ampersands, and other symbols that have special meanings in URLs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UrlEncoder;
