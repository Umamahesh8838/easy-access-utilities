import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Space, Copy, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const MultipleWhitespaceRemover = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [removeExtraSpaces, setRemoveExtraSpaces] = useState(true);
  const [removeExtraTabs, setRemoveExtraTabs] = useState(true);
  const [removeExtraNewlines, setRemoveExtraNewlines] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const processText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    let result = inputText;

    // Remove extra spaces (multiple spaces become single space)
    if (removeExtraSpaces) {
      result = result.replace(/ +/g, ' ');
    }

    // Remove extra tabs (multiple tabs become single tab)
    if (removeExtraTabs) {
      result = result.replace(/\t+/g, '\t');
    }

    // Remove extra newlines (multiple newlines become single newline)
    if (removeExtraNewlines) {
      result = result.replace(/\n+/g, '\n');
    }

    // Trim whitespace from start and end of each line
    if (trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n');
    }

    // Remove completely empty lines
    if (removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    setOutputText(result);

    const originalLength = inputText.length;
    const newLength = result.length;
    const saved = originalLength - newLength;

    toast({
      title: "Processed!",
      description: `Removed ${saved} characters of whitespace.`,
    });

    // Scroll to output section after a brief delay
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Processed text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const originalChars = inputText.length;
    const processedChars = outputText.length;
    const spaceSaved = originalChars - processedChars;
    
    const originalSpaces = (inputText.match(/ /g) || []).length;
    const processedSpaces = (outputText.match(/ /g) || []).length;
    
    const originalNewlines = (inputText.match(/\n/g) || []).length;
    const processedNewlines = (outputText.match(/\n/g) || []).length;

    return {
      originalChars,
      processedChars,
      spaceSaved,
      originalSpaces,
      processedSpaces,
      originalNewlines,
      processedNewlines
    };
  };

  const stats = getStats();

  const sampleTexts = [
    {
      title: "Multiple Spaces",
      text: "This   text    has     multiple     spaces\n\n\n\nAnd   many\n\n\nnewlines",
      description: "Text with excessive spaces and newlines"
    },
    {
      title: "Leading/Trailing",
      text: "   Leading spaces\n\tTabs\t\there\n   Trailing spaces   \n\n\n",
      description: "Text with leading/trailing whitespace"
    },
    {
      title: "Mixed Problems",
      text: "Mixed\t\t\twhitespace\n\n   problems    everywhere   \n\n\n\nNeed    cleaning",
      description: "Text with various whitespace issues"
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Space className="w-8 h-8" />
            Multiple Whitespace Remover
          </h1>
          <p className="text-muted-foreground">
            Clean up excessive whitespace, spaces, tabs, and newlines from your text
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sample Texts Section - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-6 sticky top-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">Sample Texts</h2>
                <p className="text-sm text-muted-foreground">
                  Try these examples
                </p>
              </div>
              <div className="space-y-3">
                {sampleTexts.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(sample.text)}
                    className="w-full text-xs h-auto py-3 px-4"
                  >
                    <div className="text-center">
                      <div className="font-medium">{sample.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {sample.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Tool Section */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-8">

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-2">Enter your text:</label>
                  <Textarea
                    placeholder="Paste your text with multiple whitespace here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px] resize-none font-mono text-sm"
                  />
                </div>

                {/* Processing Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Processing Options</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="removeExtraSpaces"
                        checked={removeExtraSpaces}
                        onCheckedChange={(checked) => setRemoveExtraSpaces(checked === true)}
                      />
                      <label htmlFor="removeExtraSpaces" className="text-sm font-medium">
                        Remove extra spaces
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="removeExtraTabs"
                        checked={removeExtraTabs}
                        onCheckedChange={(checked) => setRemoveExtraTabs(checked === true)}
                      />
                      <label htmlFor="removeExtraTabs" className="text-sm font-medium">
                        Remove extra tabs
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="removeExtraNewlines"
                        checked={removeExtraNewlines}
                        onCheckedChange={(checked) => setRemoveExtraNewlines(checked === true)}
                      />
                      <label htmlFor="removeExtraNewlines" className="text-sm font-medium">
                        Remove extra newlines
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trimLines"
                        checked={trimLines}
                        onCheckedChange={(checked) => setTrimLines(checked === true)}
                      />
                      <label htmlFor="trimLines" className="text-sm font-medium">
                        Trim line whitespace
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="removeEmptyLines"
                        checked={removeEmptyLines}
                        onCheckedChange={(checked) => setRemoveEmptyLines(checked === true)}
                      />
                      <label htmlFor="removeEmptyLines" className="text-sm font-medium">
                        Remove empty lines
                      </label>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={processText}
                      disabled={!inputText.trim()}
                      className="px-8"
                    >
                      <Space className="w-4 h-4 mr-2" />
                      Clean Whitespace
                    </Button>
                  </div>

                  {outputText && (
                    <div className="mt-8 space-y-4">
                      <h4 className="font-medium text-center">Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Characters saved:</span>
                          <span className="font-mono font-bold text-primary">{stats.spaceSaved}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Original length:</span>
                          <span className="font-mono">{stats.originalChars}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>New length:</span>
                          <span className="font-mono">{stats.processedChars}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Spaces removed:</span>
                          <span className="font-mono">{stats.originalSpaces - stats.processedSpaces}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Newlines removed:</span>
                          <span className="font-mono">{stats.originalNewlines - stats.processedNewlines}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {outputText && (
                <div className="mt-8" ref={outputRef}>
                  <label className="block text-sm font-medium mb-2">Processed Text:</label>
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Processed text will appear here..."
                    className="min-h-[200px] resize-none bg-muted font-mono text-sm"
                  />
                  
                  <div className="mt-4 text-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="px-8"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Result
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputText("");
                        setOutputText("");
                        toast({
                          title: "Cleared",
                          description: "All text has been cleared.",
                        });
                      }}
                      className="px-6"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleWhitespaceRemover;
