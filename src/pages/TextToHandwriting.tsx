import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PenTool, Copy, RotateCcw, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const TextToHandwriting = () => {
  const [inputText, setInputText] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [handwritingStyle, setHandwritingStyle] = useState("0");
  const [textSize, setTextSize] = useState([18]);
  const [lineHeight, setLineHeight] = useState([1.5]);
  const [marginLeft, setMarginLeft] = useState([50]);
  const [marginTop, setMarginTop] = useState([50]);
  const { toast } = useToast();

  const handwritingStyles = [
    { value: "0", name: "Style 1 - Clean", description: "Clean and readable handwriting" },
    { value: "1", name: "Style 2 - Casual", description: "Casual handwriting style" },
    { value: "2", name: "Style 3 - Cursive", description: "Cursive handwriting style" },
    { value: "3", name: "Style 4 - Bold", description: "Bold handwriting style" },
  ];

  const generateHandwriting = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - In real implementation, you'd call the handwriting API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock URL - In real implementation, this would be the actual generated image URL
      const mockUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      setOutputUrl(mockUrl);
      
      toast({
        title: "Generated!",
        description: "Handwriting image has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate handwriting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!outputUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = outputUrl;
      link.download = 'handwriting.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Downloaded!",
        description: "Handwriting image has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image.",
        variant: "destructive",
      });
    }
  };

  const copyImageUrl = async () => {
    if (!outputUrl) return;
    
    try {
      await navigator.clipboard.writeText(outputUrl);
      toast({
        title: "Copied!",
        description: "Image URL copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Hello, this is a sample handwriting text.",
    "Practice makes perfect in handwriting.",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-6xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <PenTool className="w-8 h-8" />
            Text to Handwriting Converter
          </h1>
          <p className="text-muted-foreground">
            Convert your text into realistic handwriting images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input & Settings Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Enter your text:</label>
                <Textarea
                  placeholder="Type your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style">Handwriting Style:</Label>
                  <Select value={handwritingStyle} onValueChange={setHandwritingStyle}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {handwritingStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Text Size: {textSize[0]}px</Label>
                  <Slider
                    value={textSize}
                    onValueChange={setTextSize}
                    max={30}
                    min={12}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Line Height: {lineHeight[0]}</Label>
                  <Slider
                    value={lineHeight}
                    onValueChange={setLineHeight}
                    max={3}
                    min={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Left Margin: {marginLeft[0]}px</Label>
                  <Slider
                    value={marginLeft}
                    onValueChange={setMarginLeft}
                    max={200}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={generateHandwriting}
                  disabled={!inputText.trim() || isLoading}
                  className="px-8"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate Handwriting"}
                </Button>
              </div>
            </div>
          </div>

          {/* Sample Texts & Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Sample Texts</h3>
            <div className="space-y-2 mb-6">
              {sampleTexts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(sample)}
                  className="w-full text-left h-auto p-3 justify-start"
                >
                  <div className="text-xs leading-relaxed">{sample}</div>
                </Button>
              ))}
            </div>

            {outputUrl && (
              <div className="space-y-4">
                <h4 className="font-medium text-center">Generated Image</h4>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="aspect-video bg-white rounded border flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PenTool className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Handwriting Preview</p>
                      <p className="text-xs">(Demo - Real implementation would show actual handwriting)</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadImage}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyImageUrl}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setInputText("");
                  setOutputUrl("");
                  toast({
                    title: "Cleared",
                    description: "All content has been cleared.",
                  });
                }}
                className="px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a demo implementation. In a real application, this would integrate with handwriting generation APIs 
            like the one from GitHub (https://github.com/saurabhdaware/text-to-handwriting) to create actual handwriting images.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextToHandwriting;
