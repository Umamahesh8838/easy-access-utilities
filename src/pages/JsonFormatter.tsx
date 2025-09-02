import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [minifiedJson, setMinifiedJson] = useState("");
  const [inputToMinify, setInputToMinify] = useState("");
  const { toast } = useToast();

  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(inputToMinify);
      const minified = JSON.stringify(parsed);
      setMinifiedJson(minified);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard.",
    });
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
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
          <h1 className="text-4xl font-bold text-foreground mb-4">JSON Formatter</h1>
          <p className="text-xl text-muted-foreground">
            Format and minify JSON for better readability and optimization
          </p>
        </div>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="minify">Minify</TabsTrigger>
          </TabsList>

          <TabsContent value="format">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Input JSON</CardTitle>
                  <CardDescription>Enter the JSON you want to format</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    placeholder='{"name":"John","age":30,"city":"New York"}'
                    className="min-h-[200px]"
                  />
                  <Button onClick={formatJson} className="mt-4 w-full">
                    Format JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formatted JSON</CardTitle>
                  <CardDescription>Your beautifully formatted JSON</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formattedJson}
                    readOnly
                    placeholder="Formatted JSON will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(formattedJson)}
                      disabled={!formattedJson}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(formattedJson, "formatted.json")}
                      disabled={!formattedJson}
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

          <TabsContent value="minify">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>JSON to Minify</CardTitle>
                  <CardDescription>Enter the JSON you want to minify</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={inputToMinify}
                    onChange={(e) => setInputToMinify(e.target.value)}
                    placeholder={`{
  "name": "John",
  "age": 30,
  "city": "New York"
}`}
                    className="min-h-[200px]"
                  />
                  <Button onClick={minifyJson} className="mt-4 w-full">
                    Minify JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Minified JSON</CardTitle>
                  <CardDescription>Your compressed JSON</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={minifiedJson}
                    readOnly
                    placeholder="Minified JSON will appear here..."
                    className="min-h-[200px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(minifiedJson)}
                      disabled={!minifiedJson}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(minifiedJson, "minified.json")}
                      disabled={!minifiedJson}
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
            <CardTitle>About JSON Formatting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              JSON (JavaScript Object Notation) formatting improves readability by adding proper 
              indentation and line breaks. Minification removes unnecessary whitespace to reduce 
              file size for production use. This tool helps you validate JSON syntax, format for 
              human readability, or compress for optimal transmission and storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonFormatter;
