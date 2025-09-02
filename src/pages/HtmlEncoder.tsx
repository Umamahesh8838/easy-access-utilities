import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HtmlEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [inputToDecode, setInputToDecode] = useState("");
  const { toast } = useToast();

  const encodeToHtml = () => {
    const encoded = inputText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
    setEncodedText(encoded);
  };

  const decodeFromHtml = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = inputToDecode;
      const decoded = textarea.value;
      setDecodedText(decoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decode HTML. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
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
          <h1 className="text-4xl font-bold text-foreground mb-4">HTML Encoder/Decoder</h1>
          <p className="text-xl text-muted-foreground">
            Encode and decode HTML entities for safe display
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
                  <Button onClick={encodeToHtml} className="mt-4 w-full">
                    Encode to HTML
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>HTML Encoded Output</CardTitle>
                  <CardDescription>Your HTML-encoded string</CardDescription>
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
                      onClick={() => downloadAsFile(encodedText, "html-encoded.txt")}
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
                  <CardTitle>HTML Encoded Input</CardTitle>
                  <CardDescription>Enter the HTML-encoded string you want to decode</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputToDecode}
                    onChange={(e) => setInputToDecode(e.target.value)}
                    placeholder="Enter HTML entities to decode..."
                    className="min-h-[200px]"
                  />
                  <Button onClick={decodeFromHtml} className="mt-4 w-full">
                    Decode from HTML
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decoded Text</CardTitle>
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
                      onClick={() => downloadAsFile(decodedText, "html-decoded.txt")}
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
            <CardTitle>About HTML Encoding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              HTML encoding (also known as HTML entity encoding) is a way of representing special 
              characters in HTML by replacing them with character entities. This prevents these 
              characters from being interpreted as HTML markup. Common entities include &amp;lt; for &lt;, 
              &amp;gt; for &gt;, &amp;amp; for &amp;, and &amp;quot; for quotes. This is essential for displaying 
              user input safely in web pages and preventing XSS attacks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HtmlEncoder;
